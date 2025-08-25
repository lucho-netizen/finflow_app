import { Card, CardHeader, CardContent } from "@/components/ui/card"

interface AdvisorCardProps {
  recommendations: string[]
}

export default function AdvisorCard({ recommendations }: AdvisorCardProps) {
  return (
    <Card className="shadow-lg border rounded-2xl">
      <CardHeader>
        <h2 className="text-xl font-semibold">Tus Recomendaciones 📊</h2>
      </CardHeader>
      <CardContent>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          {recommendations.map((rec, i) => (
            <li key={i}>{rec}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
