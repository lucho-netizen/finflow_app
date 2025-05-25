'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
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
      try {
        const { data: response } = await axios.get(
          'http://localhost:8000/dashboard/overview',
          { withCredentials: true }
        )

        const formatted = response.map((item: any) => ({
          name: months[item.month] ?? 'Unknown',
          income: item.income ?? 0,
          expense: item.expense ?? 0,
        }))

        setData(formatted)
      } catch (error) {
        console.error('Error fetching overview data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} />
        <YAxis stroke="#888888" fontSize={12} tickFormatter={(v) => `$${v}`} />
        <Bar dataKey="income" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
