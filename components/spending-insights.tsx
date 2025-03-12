"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Budget, Transaction } from "@/lib/types"
import { CATEGORIES } from "@/lib/constants"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TrendingDown, TrendingUp, AlertTriangle, Info } from "lucide-react"

export default function SpendingInsights() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [insights, setInsights] = useState<string[]>([])

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
    if (budgets.length === 0 || transactions.length === 0) return

    const generatedInsights: string[] = []

    // Check for categories over budget
    budgets.forEach((budget) => {
      const categoryObj = CATEGORIES.find((c) => c.value === budget.category)
      const spent = transactions.filter((t) => t.category === budget.category).reduce((sum, t) => sum + t.amount, 0)

      const percentUsed = (spent / budget.amount) * 100

      if (spent > budget.amount) {
        generatedInsights.push(
          `You've exceeded your ${categoryObj?.label || budget.category} budget by $${(spent - budget.amount).toFixed(2)}.`,
        )
      } else if (percentUsed > 80) {
        generatedInsights.push(
          `You've used ${percentUsed.toFixed(0)}% of your ${categoryObj?.label || budget.category} budget.`,
        )
      }
    })

    // Find top spending category
    const categorySpending: { [key: string]: number } = {}
    transactions.forEach((transaction) => {
      if (transaction.category) {
        categorySpending[transaction.category] = (categorySpending[transaction.category] || 0) + transaction.amount
      }
    })

    if (Object.keys(categorySpending).length > 0) {
      const topCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0]

      const categoryObj = CATEGORIES.find((c) => c.value === topCategory[0])

      generatedInsights.push(
        `Your highest spending category is ${categoryObj?.label || topCategory[0]} at $${topCategory[1].toFixed(2)}.`,
      )
    }

    // Check for categories without budgets
    const categoriesWithTransactions = [...new Set(transactions.map((t) => t.category))]
    const categoriesWithoutBudgets = categoriesWithTransactions.filter(
      (category) => category && !budgets.some((b) => b.category === category),
    )

    if (categoriesWithoutBudgets.length > 0) {
      const categoryNames = categoriesWithoutBudgets
        .map((c) => {
          const categoryObj = CATEGORIES.find((cat) => cat.value === c)
          return categoryObj?.label || c
        })
        .join(", ")

      generatedInsights.push(`Consider setting budgets for these categories: ${categoryNames}.`)
    }

    // Check for recent large transactions
    const recentLargeTransactions = transactions
      .filter((t) => t.amount > 100)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 1)

    if (recentLargeTransactions.length > 0) {
      const transaction = recentLargeTransactions[0]
      generatedInsights.push(
        `Large transaction of $${transaction.amount.toFixed(2)} on ${format(new Date(transaction.date), "MMM d")} for "${transaction.description}".`,
      )
    }

    setInsights(generatedInsights)
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

  if (insights.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-10">
            <p>Add more transactions and budgets to see spending insights.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Insights</CardTitle>
        <CardDescription>Smart observations about your spending habits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => {
            let Icon = Info
            let variant = "default"

            if (insight.includes("exceeded")) {
              Icon = AlertTriangle
              variant = "destructive"
            } else if (insight.includes("highest spending")) {
              Icon = TrendingUp
              variant = "default"
            } else if (insight.includes("Consider setting")) {
              Icon = TrendingDown
              variant = "warning"
            } else if (insight.includes("Large transaction")) {
              Icon = Info
              variant = "info"
            }

            return (
              <Alert key={index} variant={variant as any}>
                <Icon className="h-4 w-4" />
                <AlertTitle>Insight</AlertTitle>
                <AlertDescription>{insight}</AlertDescription>
              </Alert>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

