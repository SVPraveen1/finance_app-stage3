"use client"

import { useEffect, useState } from "react"
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, type TooltipProps } from "recharts"
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Transaction } from "@/lib/types"

interface DailyExpense {
  date: string
  amount: number
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md shadow-sm p-2 text-sm">
        <p className="font-medium">{format(parseISO(label), "MMM d, yyyy")}</p>
        <p className="text-primary">${payload[0].value?.toString()}</p>
      </div>
    )
  }

  return null
}

export default function ExpensesChart() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [chartData, setChartData] = useState<DailyExpense[]>([])
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

    // Get the current month's date range
    const today = new Date()
    const firstDayOfMonth = startOfMonth(today)
    const lastDayOfMonth = endOfMonth(today)

    // Create an array of all days in the current month
    const daysInMonth = eachDayOfInterval({
      start: firstDayOfMonth,
      end: lastDayOfMonth,
    })

    // Initialize chart data with zero amounts for all days
    const initialChartData = daysInMonth.map((day) => ({
      date: format(day, "yyyy-MM-dd"),
      amount: 0,
    }))

    // Sum transaction amounts for each day
    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date)

      // Only include transactions from the current month
      if (transactionDate >= firstDayOfMonth && transactionDate <= lastDayOfMonth) {
        const dayIndex = initialChartData.findIndex((day) => isSameDay(parseISO(day.date), transactionDate))

        if (dayIndex !== -1) {
          initialChartData[dayIndex].amount += transaction.amount
        }
      }
    })

    setChartData(initialChartData)
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

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-10">
            <p>No transactions found. Add transactions to see your monthly expenses chart.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Expenses</CardTitle>
        <CardDescription>Daily expense breakdown for {format(new Date(), "MMMM yyyy")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => format(parseISO(date), "d")}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

