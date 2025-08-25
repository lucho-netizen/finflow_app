from __future__ import annotations
from dataclasses import dataclass
from typing import List, Dict, Optional, Tuple
from math import exp
from statistics import mean, pstdev
from datetime import date

# ---------- Data Models ----------
@dataclass
class Tx:
    fecha: date
    monto: float              # positivo
    tipo: str                 # "ingreso" | "egreso"
    categoria: str            # "Salario", "Comida", etc.
    recurrente: bool = False  # marcado por pre-proceso

@dataclass
class Meta:
    id: int
    nombre: str
    monto_objetivo: float
    ahorro_actual: float
    fecha_limite: date
    prioridad_usuario: int    # 1..5

@dataclass
class Config:
    meses_hist: int = 12
    alpha_ema: float = 0.3
    lambda_softmax: float = 2.0
    objetivo_colchon_meses: int = 4
    categorias_esenciales: Tuple[str, ...] = ("Renta", "Arriendo", "Servicios", "Supermercado", "Transporte")

# ---------- Helpers ----------
def _ema(values: List[float], alpha: float) -> float:
    if not values:
        return 0.0
    ema = values[0]
    for x in values[1:]:
        ema = alpha * x + (1 - alpha) * ema
    return ema

def _group_monthly(txs: List[Tx]) -> Dict[Tuple[int, int], Dict[str, float]]:
    agg = {}
    for t in txs:
        key = (t.fecha.year, t.fecha.month)
        if key not in agg:
            agg[key] = {"ingreso": 0.0, "egreso": 0.0}
        agg[key][t.tipo] += t.monto
    return agg  # {(y,m): {"ingreso": x, "egreso": y}}

def _p95(values: List[float]) -> float:
    if not values:
        return 0.0
    s = sorted(values)
    k = int(round(0.95 * (len(s) - 1)))
    return s[k]

def _clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))

def _months_between(a: date, b: date) -> int:
    # meses enteros entre a y b (a < b)
    return max((b.year - a.year) * 12 + (b.month - a.month), 0)

def _normalize(x: float, p50: float, p90: float) -> float:
    if x <= p50: return 0.0
    if x >= p90: return 1.0
    return (x - p50) / max(p90 - p50, 1e-9)

# ---------- Núcleo ----------
def analizar_usuario(
    txs: List[Tx],
    metas: List[Meta],
    hoy: Optional[date] = None,
    cfg: Config = Config()
) -> Dict:
    hoy = hoy or date.today()

    # 1) Agregación mensual
    monthly = _group_monthly(txs)
    months_sorted = sorted(monthly.keys())[-cfg.meses_hist:]
    ingresos_hist = [monthly[k]["ingreso"] for k in months_sorted]
    egresos_hist  = [monthly[k]["egreso"]  for k in months_sorted]

    ingresos_prom = mean(ingresos_hist) if ingresos_hist else 0.0
    egresos_prom  = mean(egresos_hist)  if egresos_hist else 0.0
    egresos_vol   = pstdev(egresos_hist) if len(egresos_hist) > 1 else 0.0

    # 2) Proyección próxima
    ingresos_proj = _ema(ingresos_hist, cfg.alpha_ema)
    egresos_proj  = _ema(egresos_hist,  cfg.alpha_ema)
    saldo_proj    = ingresos_proj - egresos_proj

    # 3) Buffer de seguridad (volatilidad de variables)
    var_txs = [t.monto for t in txs if t.tipo == "egreso" and t.categoria not in cfg.categorias_esenciales]
    buffer_seguridad = _p95(var_txs)

    # 4) Riesgo de liquidez
    riesgo = _clamp(egresos_vol / max(ingresos_prom, 1.0), 0.0, 1.0)

    # 5) Colchón de emergencia
    gasto_esencial_prom = mean([
        sum(t.monto for t in txs if t.tipo == "egreso" and (t.fecha.year, t.fecha.month) == k and t.categoria in cfg.categorias_esenciales)
        for k in months_sorted
    ]) if months_sorted else 0.0
    colchon_obj = gasto_esencial_prom * cfg.objetivo_colchon_meses

    ahorro_actual_colchon = 0.0  # si lo gestionas como meta separada, pásalo aquí
    colchon_restante = max(colchon_obj - ahorro_actual_colchon, 0.0)
    cuota_colchon_sugerida = min(max(saldo_proj - buffer_seguridad, 0.0), colchon_restante / 6 if colchon_restante else 0.0)

    # 6) Priorización de metas
    # parámetros para normalización
    t_refs = []
    for m in metas:
        meses_rest = _months_between(hoy, m.fecha_limite)
        restante = max(m.monto_objetivo - m.ahorro_actual, 0.0)
        base = ingresos_prom if ingresos_prom > 0 else (ingresos_proj if ingresos_proj > 0 else 1.0)
        t_refs.append(restante / base)
    p50 = _percentile(t_refs, 50) if t_refs else 0.0
    p90 = _percentile(t_refs, 90) if t_refs else 1.0

    metas_out = []
    for m in metas:
        meses_rest = _months_between(hoy, m.fecha_limite)
        restante = max(m.monto_objetivo - m.ahorro_actual, 0.0)
        u = 1.0 / (meses_rest + 1.0)
        t = restante / max(ingresos_prom, 1.0)
        score = 0.5*u + 0.3*_normalize(t, p50, p90) + 0.2*_clamp((m.prioridad_usuario-1)/4.0,0,1)
        cuota_necesaria = restante / max(meses_rest, 1) if restante > 0 else 0.0
        metas_out.append({
            "id": m.id,
            "nombre": m.nombre,
            "restante": restante,
            "meses_restantes": meses_rest,
            "score": _clamp(score, 0.0, 1.0),
            "cuota_necesaria": cuota_necesaria
        })

    # 7) Asignación
    cap_total = max(saldo_proj - buffer_seguridad, 0.0)
    # prioriza colchón si muy bajo
    cap_after_colchon = max(cap_total - cuota_colchon_sugerida, 0.0)

    if metas_out:
        lam = cfg.lambda_softmax
        exps = [exp(lam*m["score"]) for m in metas_out]
        Z = sum(exps) or 1.0
        for m, e in zip(metas_out, exps):
            cuota_soft = cap_after_colchon * (e / Z)
            m["asignacion_sugerida"] = min(cuota_soft, m["cuota_necesaria"])
    else:
        metas_out = []

    # 8) Recortes sugeridos si no alcanza
    deficit = (sum(m["cuota_necesaria"] for m in metas_out) + cuota_colchon_sugerida) - cap_total
    recortes = []
    if deficit > 0:
        # Top categorías variables por gasto promedio
        by_cat = {}
        for k in months_sorted:
            ym_txs = [t for t in txs if (t.fecha.year, t.fecha.month) == k and t.tipo=="egreso" and t.categoria not in cfg.categorias_esenciales]
            for t in ym_txs:
                by_cat[t.categoria] = by_cat.get(t.categoria, 0.0) + t.monto
        # ordena por impacto
        top = sorted(by_cat.items(), key=lambda kv: kv[1], reverse=True)[:5]
        # propone recortes 10–30%
        for cat, total in top:
            prop = 0.2 if deficit > 0 else 0.1
            ahorro = total/len(months_sorted) * prop if months_sorted else total * prop
            if ahorro > 0:
                recortes.append({"categoria": cat, "recorte_pct": round(prop,2), "ahorro_estimado": round(ahorro,2)})

    # 9) Alertas
    alertas = []
    if saldo_proj < 0:
        alertas.append({"tipo":"LiquidezNegativa","detalle":"Proyección de saldo negativo. Ajusta gastos o difiere metas."})
    if riesgo > 0.6:
        alertas.append({"tipo":"RiesgoAlto","detalle":"Alta volatilidad de egresos vs ingresos."})
    for m in metas_out:
        esperado = ( (m["cuota_necesaria"] or 0) * max(m["meses_restantes"],1) )
        if esperado > 0 and m["restante"] > 0 and m["meses_restantes"]>0:
            progreso = 1 - (m["restante"]/ (m["restante"] + m.get("asignacion_sugerida",0)*m["meses_restantes"]))
            if progreso < 0.8 and m["meses_restantes"] <= max(1, m["meses_restantes"]//2):
                alertas.append({"tipo":"MetaRetrasada", "detalle": f"Atraso en '{m['nombre']}'"})

    return {
        "resumen": {
            "ingresos_proj": round(ingresos_proj,2),
            "egresos_proj": round(egresos_proj,2),
            "saldo_proj": round(saldo_proj,2),
            "riesgo": round(riesgo,2),
            "buffer_seguridad": round(buffer_seguridad,2)
        },
        "colchon": {
            "objetivo_meses": cfg.objetivo_colchon_meses,
            "estimado_necesario": round(colchon_obj,2),
            "ahorro_actual": round(ahorro_actual_colchon,2),
            "cuota_sugerida": round(cuota_colchon_sugerida,2),
            "prioridad": "alta" if colchon_restante>0 else "cumplido"
        },
        "metas": metas_out,
        "recortes": recortes,
        "alertas": alertas
    }

def _percentile(values: List[float], p: float) -> float:
    if not values:
        return 0.0
    s = sorted(values)
    k = (len(s)-1) * (p/100.0)
    f = int(k)
    c = min(f+1, len(s)-1)
    if f == c:
        return s[int(k)]
    return s[f] + (s[c]-s[f])*(k-f)
