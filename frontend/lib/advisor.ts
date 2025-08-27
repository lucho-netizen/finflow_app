export interface TxPayload {
  fecha: string;
  monto: number;
  tipo: 'ingreso' | 'egreso';
  categoria: string;
  recurrente?: boolean;
}

export interface MetaPayload {
  id: number;
  nombre: string;
  monto_objetivo: number;
  ahorro_actual?: number;
  fecha_limite: string;
  prioridad_usuario?: number;
}

export async function getAdvisorRecommendation(
  fetchWithAuth: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
  txs: TxPayload[],
  metas: MetaPayload[]
) {
  const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/advisor/recomendar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ txs, metas }),
  });

  if (!res.ok) {
    throw new Error('Error obteniendo recomendación');
  }
  return res.json();
}
