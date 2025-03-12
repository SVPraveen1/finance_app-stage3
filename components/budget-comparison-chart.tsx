"use client"

import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts"
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Budget, Transaction } from "@/lib/types"
import { CATEGORIES } from "@/lib/constants"

interface BudgetComparisonData {
  category: string
  budget: number
  spent: number
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md shadow-sm p-2 text-sm">
        <p className="font-medium">{label}</p>
        <p className="text-blue-600">Budget: ${payload[0].value?.toString()}</p>
        <p className="text-green-600">Spent: ${payload[1].value?.toString()}</p>
      </div>
    )
  }

  return null
}

export default function BudgetComparisonChart() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [chartData, setChartData] = useState<BudgetComparisonData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch budgets
        const budgetsResponse = await fetch("/api/budgets")
        if (!budgetsResponse.ok) {
          throw new Error("Failed to fetch budgets")
        }
        const budgetsData = await budgetsResponse.json()
        setBudgets(budgetsData)

        // Fetch transactions
        const transactionsResponse = await fetch("/api/transactions")
        if (!transactionsResponse.ok) {
          throw new Error("Failed to fetch transactions")
        }
        const transactionsData = await transactionsResponse.json()
        setTransactions(transactionsData)
      } catch (err) {
        setError("Failed to load data. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (budgets.length === 0) return

    // Calculate spent amount for each category with a budget
    const data: BudgetComparisonData[] = budgets.map((budget) => {
      const categoryObj = CATEGORIES.find((c) => c.value === budget.category)
      const spent = transactions.filter((t) => t.category === budget.category).reduce((sum, t) => sum + t.amount, 0)

      return {
        category: categoryObj?.label || budget.category,
        budget: budget.amount,
        spent: spent,
      }
    })

    setChartData(data)
  }, [budgets, transactions])

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

  if (budgets.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-10">
            <p>No budgets found. Create budgets to see the comparison chart.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs. Actual</CardTitle>
        <CardDescription>Comparison of budgeted amounts versus actual spending</CardDescription>
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
              <XAxis dataKey="category" angle={-45} textAnchor="end" height={60} />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
              <Bar dataKey="spent" fill="#10b981" name="Spent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

