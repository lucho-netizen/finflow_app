"use client"

import { useState, useEffect, JSX } from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CarIcon,
  CoffeeIcon,
  HomeIcon,
  ShoppingBagIcon,
  WalletIcon,
  SearchIcon,
  FilterIcon,
  DownloadIcon,
} from "lucide-react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { exportToPdf } from "@/lib/export-pdf"

const iconMap = {
  Salary: <WalletIcon className="h-4 w-4 text-emerald-500" />,
  Freelance: <WalletIcon className="h-4 w-4 text-emerald-500" />,
  Bonus: <WalletIcon className="h-4 w-4 text-emerald-500" />,
  Investment: <WalletIcon className="h-4 w-4 text-emerald-500" />,
  Food: <ShoppingBagIcon className="h-4 w-4 text-rose-500" />,
  Entertainment: <CoffeeIcon className="h-4 w-4 text-rose-500" />,
  Housing: <HomeIcon className="h-4 w-4 text-rose-500" />,
  Transportation: <CarIcon className="h-4 w-4 text-rose-500" />,
  Shopping: <ShoppingBagIcon className="h-4 w-4 text-rose-500" />,
  Utilities: <HomeIcon className="h-4 w-4 text-rose-500" />,
}

export function RecentTransactions({ showAll = false, newTransaction = null }) {
  const [transactions, setTransactions] = useState([])
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState([])
  const [typeFilter, setTypeFilter] = useState([])

  useEffect(() => {
    fetch("http://localhost:8000/dashboard/", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data.transactions || [])
        setTotalTransactions(data.total_transactions || 0)
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (newTransaction) {
      setTransactions((prev) => [newTransaction, ...prev])
    }
  }, [newTransaction])

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter.length === 0 || categoryFilter.includes(transaction.category)
    const matchesType = typeFilter.length === 0 || typeFilter.includes(transaction.type)

    return matchesSearch && matchesCategory && matchesType
  })

  const displayTransactions = showAll ? filteredTransactions : filteredTransactions.slice(0, 5)
  const categories = [...new Set(transactions.map((t) => t.category))]

  return (
    <div className="space-y-4">
      {showAll && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <FilterIcon className="h-3.5 w-3.5" />
                  <span>Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <div className="p-2 font-medium">Categories</div>
                {categories.map((category) => (
                  <DropdownMenuCheckboxItem
                    key={category}
                    checked={categoryFilter.includes(category)}
                    onCheckedChange={(checked) => {
                      setCategoryFilter((prev) =>
                        checked ? [...prev, category] : prev.filter((c) => c !== category)
                      )
                    }}
                  >
                    {category}
                  </DropdownMenuCheckboxItem>
                ))}
                <div className="p-2 font-medium">Type</div>
                <DropdownMenuCheckboxItem
                  checked={typeFilter.includes("income")}
                  onCheckedChange={(checked) => {
                    setTypeFilter((prev) =>
                      checked ? [...prev, "income"] : prev.filter((t) => t !== "income")
                    )
                  }}
                >
                  Income
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={typeFilter.includes("expense")}
                  onCheckedChange={(checked) => {
                    setTypeFilter((prev) =>
                      checked ? [...prev, "expense"] : prev.filter((t) => t !== "expense")
                    )
                  }}
                >
                  Expense
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1"
              onClick={() => exportToPdf(filteredTransactions)}
            >
              <DownloadIcon className="h-3.5 w-3.5" />
              <span>Export</span>
            </Button>
          </div>
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {totalTransactions === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  Bienvenido/a, aún no tienes movimientos. Empieza agregando tu primera transacción.
                </TableCell>
              </TableRow>
            ) : displayTransactions.length > 0 ? (
              displayTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.date.slice(0, 10)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {iconMap[transaction.category] || <WalletIcon className="h-4 w-4" />}
                      <span>{transaction.description}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {transaction.type === "income" ? (
                        <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 text-rose-500" />
                      )}
                      <span className={transaction.type === "income" ? "text-emerald-500" : "text-rose-500"}>
                        ${transaction.amount.toFixed(2)}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
