'use client'
import { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Bar
} from 'recharts'

const months = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

export default function Overview() {
  const [data, setData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('http://localhost:8000/dashboard/overview', {
        method: "GET",
        credentials: 'include',
      })
      const json = await res.json()
      const formatted = json.map(item => ({
        name: months[item.month],
        income: item.income,
        expense: item.expense,
      }))
      setData(formatted)
    }

    fetchData()
  }, [])

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} />
        <YAxis stroke="#888888" fontSize={12} tickFormatter={v => `$${v}`} />
        <Bar dataKey="income" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
