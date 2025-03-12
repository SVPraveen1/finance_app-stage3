"use client"

import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, type TooltipProps } from "recharts"
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Transaction } from "@/lib/types"
import { CATEGORIES } from "@/lib/constants"

interface CategoryTotal {
  name: string
  value: number
  color: string
}

const COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#6366f1", // indigo
  "#14b8a6", // teal
  "#f97316", // orange
  "#a855f7", // purple
]

const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md shadow-sm p-2 text-sm">
        <p className="font-medium">{payload[0].name}</p>
        <p className="text-primary">${payload[0].value?.toString()}</p>
      </div>
    )
  }

  return null
}

export default function CategoryChart() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [chartData, setChartData] = useState<CategoryTotal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("/api/transactions")
        if (!response.ok) {
          throw new Error("Failed to fetch transactions")
        }
        const data = await response.json()
        setTransactions(data)
      } catch (err) {
        setError("Failed to load transactions. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  useEffect(() => {
    if (transactions.length === 0) return

    // Create a map to store category totals
    const categoryTotals = new Map<string, number>()

    // Calculate total for each category
    transactions.forEach((transaction) => {
      if (transaction.category) {
        const currentTotal = categoryTotals.get(transaction.category) || 0
        categoryTotals.set(transaction.category, currentTotal + transaction.amount)
      }
    })

    // Convert map to array for chart data
    const chartData = Array.from(categoryTotals.entries()).map(([category, total], index) => {
      const categoryObj = CATEGORIES.find((c) => c.value === category)
      return {
        name: categoryObj?.label || category,
        value: total,
        color: COLORS[index % COLORS.length],
      }
    })

    setChartData(chartData)
  }, [transactions])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>
  }

  if (transactions.length === 0 || chartData.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-10">
            <p>No categorized transactions found. Add transactions with categories to see the breakdown.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
        <CardDescription>Breakdown of expenses by category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

