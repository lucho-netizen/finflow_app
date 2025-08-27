"use client"

import { useState } from "react"
import { useFetchWithAuth } from "@/hooks/useFetchWithAuth"
import AdvisorCard from "@/components/ui/advisor-card"

export default function AdvisorPage() {
  const fetchWithAuth = useFetchWithAuth()
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<string[] | null>(null)

  const getAdvice = async () => {
    setLoading(true)
    const res = await fetchWithAuth<{ recomendaciones: string[] }>(
      `${import.meta.env.VITE_API_URL}/advisor/recomendar`,
      { method: "POST" }
    )
    setLoading(false)
    if (res) setRecommendations(res.recomendaciones)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Asesor Financiero IA 💡</h1>
      <p className="text-gray-600">
        Aquí puedes recibir recomendaciones personalizadas sobre tus finanzas.
      </p>

      <button
        onClick={getAdvice}
        disabled={loading}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      >
        {loading ? "Pensando..." : "Obtener recomendaciones"}
      </button>

      {recommendations && (
        <AdvisorCard recommendations={recommendations} />
      )}
    </div>
  )
}
