'use client'
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResponsivePie } from "@nivo/pie"
import { Button } from "@/components/ui/button"
import { DownloadIcon } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export function TransactionStats() {
  const [activeTab, setActiveTab] = useState("expenses")
  const [transactions, setTransactions] = useState([])
  const [monthlyData, setMonthlyData] = useState([])

  useEffect(() => {
    fetch("http://localhost:8000/dashboard/", {
        method: "GET",
        credentials: 'include',
         })
      .then(res => res.json())
      .then(data => {
        setTransactions(data.transactions || [])
      })
      .catch(err => console.error("Error fetching transactions:", err))
  }, [])

  useEffect(() => {
    fetch("http://localhost:8000/dashboard/overview", {
        credentials: 'include',
      
    })
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(item => ({
          month: new Date(2024, item.month - 1).toLocaleString("default", { month: "long" }),
          income: item.income || 0,
          expenses: item.expense || 0,
          savings: (item.income || 0) - (item.expense || 0),
        }))
        setMonthlyData(mapped)
      })
      .catch(err => console.error("Error fetching overview:", err))
  }, [])

  function groupByCategory(type) {
    const groups = {}
    transactions
      .filter(t => t.type === type)
      .forEach(t => {
        if (!groups[t.category]) {
          groups[t.category] = 0
        }
        groups[t.category] += t.amount
      })
    const palette = ["#f43f5e", "#3b82f6", "#a855f7", "#10b981", "#f59e0b", "#6366f1"]
    return Object.entries(groups).map(([name, value], i) => ({
      name,
      value,
      color: palette[i % palette.length],
    }))
  }

  const expensesByCategory = groupByCategory("expense")
  const incomeByCategory = groupByCategory("income")

  const chartData = activeTab === "expenses" ? expensesByCategory : incomeByCategory

  const exportToPdf = () => {
    const doc = new jsPDF()
    doc.text("Monthly Summary", 14, 16)
    autoTable(doc, {
      startY: 20,
      head: [["Month", "Income", "Expenses", "Savings"]],
      body: monthlyData.map(row => [row.month, row.income, row.expenses, row.savings]),
    })
    doc.save("monthly-summary.pdf")
  }

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-1">
          <CardTitle>Monthly Summary</CardTitle>
        </div>
        <div className="ml-auto flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={exportToPdf}>
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Tabs defaultValue="expenses" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="h-[300px]">
            <ResponsivePie
              data={chartData}
              margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              colors={({ data }) => data.color}
              borderWidth={1}
              borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333333"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: "color" }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-900">Month</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-900">Income</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-900">Expenses</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-900">Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {monthlyData.map(item => (
                  <tr key={item.month}>
                    <td className="px-4 py-2">{item.month}</td>
                    <td className="px-4 py-2">${item.income.toFixed(2)}</td>
                    <td className="px-4 py-2">${item.expenses.toFixed(2)}</td>
                    <td className="px-4 py-2">${item.savings.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold">
                  <td className="px-4 py-2">Total</td>
                  <td className="px-4 py-2">
                    $
                    {monthlyData.reduce((acc, curr) => acc + curr.income, 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-2">
                    $
                    {monthlyData.reduce((acc, curr) => acc + curr.expenses, 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-2">
                    $
                    {monthlyData.reduce((acc, curr) => acc + curr.savings, 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
