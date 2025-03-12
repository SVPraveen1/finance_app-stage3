"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Transaction } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { getCategoryColor } from "@/lib/utils"
import CategoryChart from "./category-chart"

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [categoryBreakdown, setCategoryBreakdown] = useState<{ [key: string]: number }>({})

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

    // Calculate total expenses
    const total = transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
    setTotalExpenses(total)

    // Calculate category breakdown
    const breakdown: { [key: string]: number } = {}
    transactions.forEach((transaction) => {
      if (transaction.category) {
        breakdown[transaction.category] = (breakdown[transaction.category] || 0) + transaction.amount
      }
    })
    setCategoryBreakdown(breakdown)
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

  // Get recent transactions (top 5)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{transactions.length} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${transactions.length > 0 ? (totalExpenses / transactions.length).toFixed(2) : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(categoryBreakdown).length > 0 ? (
              <>
                <div className="text-2xl font-bold">
                  {Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0][0]}
                </div>
                <p className="text-xs text-muted-foreground">
                  $
                  {Object.entries(categoryBreakdown)
                    .sort((a, b) => b[1] - a[1])[0][1]
                    .toFixed(2)}
                </p>
              </>
            ) : (
              <div className="text-muted-foreground">No categories yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest 5 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction._id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.date), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">${transaction.amount.toFixed(2)}</span>
                      {transaction.category && (
                        <Badge variant="outline" className={`${getCategoryColor(transaction.category)}`}>
                          {transaction.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-6">
                <p>No transactions found</p>
              </div>
            )}
          </CardContent>
        </Card>

        <CategoryChart />
      </div>
    </div>
  )
}

