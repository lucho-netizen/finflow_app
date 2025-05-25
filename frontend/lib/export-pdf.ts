import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

export function exportToPdf(data, title = "Financial Report") {
  const doc = new jsPDF()

  // Add title
  doc.setFontSize(18)
  doc.text(title, 14, 22)

  doc.setFontSize(11)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

  // Determine what type of data we're exporting and format accordingly
  if (data[0]?.description) {
    // Transaction data
    autoTable(doc, {
      startY: 40,
      head: [["Date", "Description", "Category", "Amount", "Type"]],
      body: data.map((item) => [
        item.date,
        item.description,
        item.category,
        `$${item.amount.toFixed(2)}`,
        item.type.charAt(0).toUpperCase() + item.type.slice(1),
      ]),
    })
  } else if (data[0]?.month) {
    // Monthly summary data
    autoTable(doc, {
      startY: 40,
      head: [["Month", "Income", "Expenses", "Savings", "Savings Rate"]],
      body: data.map((item) => [
        item.month,
        `$${item.income.toFixed(2)}`,
        `$${item.expenses.toFixed(2)}`,
        `$${item.savings.toFixed(2)}`,
        `${((item.savings / item.income) * 100).toFixed(1)}%`,
      ]),
    })
  } else {
    // Category data (pie chart data)
    autoTable(doc, {
      startY: 40,
      head: [["Category", "Amount", "Percentage"]],
      body: data.map((item) => {
        const total = data.reduce((sum, i) => sum + i.value, 0)
        const percentage = ((item.value / total) * 100).toFixed(1)
        return [item.name, `$${item.value.toFixed(2)}`, `${percentage}%`]
      }),
    })
  }

  // Save the PDF
  doc.save(`${title.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`)
}
