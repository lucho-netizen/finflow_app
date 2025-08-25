from fastapi import APIRouter
from datetime import date
from typing import List
from app.services.advisor import Tx, Meta, analizar_usuario

router = APIRouter(prefix="/advisor", tags=["advisor"])

@router.post("/recomendar")
def recomendar(payload: dict):
    # payload esperado: { "txs": [...], "metas": [...] }
    txs_in: List[Tx] = [
        Tx(
            fecha=date.fromisoformat(t["fecha"]),
            monto=abs(float(t["monto"])),
            tipo=t["tipo"],
            categoria=t.get("categoria","Otros"),
            recurrente=bool(t.get("recurrente", False))
        )
        for t in payload.get("txs", [])
    ]
    metas_in: List[Meta] = [
        Meta(
            id=int(m["id"]),
            nombre=m["nombre"],
            monto_objetivo=float(m["monto_objetivo"]),
            ahorro_actual=float(m.get("ahorro_actual",0)),
            fecha_limite=date.fromisoformat(m["fecha_limite"]),
            prioridad_usuario=int(m.get("prioridad_usuario",3))
        )
        for m in payload.get("metas", [])
    ]
    return analizar_usuario(txs_in, metas_in)
