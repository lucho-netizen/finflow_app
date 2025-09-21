"use client"

import { useState, useEffect, ChangeEvent, FormEvent } from "react"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

type TransactionType = "income" | "expense"

interface Category {
  id: number
  name: string
  type: string
}

interface FormData {
  description: string
  amount: string
  type: TransactionType | ""
  category_id: string
  date: string
}

interface AddTransactionButtonProps {
  onTransactionAdded?: () => void
}

export function AddTransactionButton({ onTransactionAdded }: AddTransactionButtonProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState<FormData>({
    description: "",
    amount: "",
    type: "",
    category_id: "",
    date: new Date().toISOString().split("T")[0],
  })

  // 🔄 Traer categorías
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:8000/categories", {
          credentials: "include",
        })
        if (!res.ok) throw new Error("Failed to fetch categories")
        const data = await res.json()
        setCategories(data)
      } catch (error) {
        console.error(error)
        toast({
          title: "Error",
          description: "Could not load categories",
          variant: "destructive",
        })
      }
    }
    fetchCategories()
  }, [toast])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!formData.description || !formData.amount || !formData.type || !formData.category_id) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("http://localhost:8000/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          description: formData.description,
          amount: parseFloat(formData.amount),
          type: formData.type,
          category_id: parseInt(formData.category_id),
          date: formData.date,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || "Failed to create transaction")
      }

      await response.json()

      toast({
        title: "Transaction added",
        description: `${formData.type === "income" ? "Income" : "Expense"} of $${formData.amount} has been added.`,
      })

      // Reset form
      setFormData({
        description: "",
        amount: "",
        type: "",
        category_id: "",
        date: new Date().toISOString().split("T")[0],
      })

      setOpen(false)

      if (onTransactionAdded) onTransactionAdded()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1">
          <PlusIcon className="h-4 w-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
            <DialogDescription>Enter the details of your transaction below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Description */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            {/* Amount */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            {/* Type */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                <SelectTrigger id="type" className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Category */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category_id" className="text-right">Category</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleSelectChange("category_id", value)}
              >
                <SelectTrigger id="category_id" className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((c) => c.type.toLowerCase() === formData.type)
                    .map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {/* Date */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Transaction</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddTransactionButton
