import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

interface Transaction {
  date: string
  description: string
  category: string
  amount: number
  type: string
}

interface MonthlySummary {
  month: string
  income: number
  expenses: number
  savings: number
}

interface CategoryData {
  name: string
  value: number
}

type DataType = Transaction[] | MonthlySummary[] | CategoryData[]

export function exportToPdf(data: DataType, title: string = "Financial Report") {
  const doc = new jsPDF()

  // Add title
  doc.setFontSize(18)
  doc.text(title, 14, 22)

  doc.setFontSize(11)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

  if ((data as Transaction[])[0]?.description) {
    // Transaction data
    const transactions = data as Transaction[]
    autoTable(doc, {
      startY: 40,
      head: [["Date", "Description", "Category", "Amount", "Type"]],
      body: transactions.map((item) => [
        item.date,
        item.description,
        item.category,
        `$${item.amount.toFixed(2)}`,
        item.type.charAt(0).toUpperCase() + item.type.slice(1),
      ]),
    })
  } else if ((data as MonthlySummary[])[0]?.month) {
    // Monthly summary data
    const monthly = data as MonthlySummary[]
    autoTable(doc, {
      startY: 40,
      head: [["Month", "Income", "Expenses", "Savings", "Savings Rate"]],
      body: monthly.map((item) => [
        item.month,
        `$${item.income.toFixed(2)}`,
        `$${item.expenses.toFixed(2)}`,
        `$${item.savings.toFixed(2)}`,
        item.income > 0
          ? `${((item.savings / item.income) * 100).toFixed(1)}%`
          : "0.0%",
      ]),
    })
  } else {
    // Category data (pie chart data)
    const categories = data as CategoryData[]
    const total = categories.reduce((sum, i) => sum + i.value, 0)
    autoTable(doc, {
      startY: 40,
      head: [["Category", "Amount", "Percentage"]],
      body: categories.map((item) => {
        const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0"
        return [item.name, `$${item.value.toFixed(2)}`, `${percentage}%`]
      }),
    })
  }

  // Save the PDF
  doc.save(
    `${title.toLowerCase().replace(/\s+/g, "-")}-${new Date()
      .toISOString()
      .split("T")[0]}.pdf`
  )
}
