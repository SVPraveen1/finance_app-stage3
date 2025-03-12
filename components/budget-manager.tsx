"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Edit, Trash2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import type { Budget, Transaction } from "@/lib/types"
import { CATEGORIES } from "@/lib/constants"

const formSchema = z.object({
  category: z.string({
    required_error: "Please select a category",
  }),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number" }),
})

export default function BudgetManager() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [deletingBudgetId, setDeletingBudgetId] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      amount: undefined,
    },
  })

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

  const openDialog = (budget?: Budget) => {
    if (budget) {
      setEditingBudget(budget)
      form.reset({
        category: budget.category,
        amount: budget.amount,
      })
    } else {
      setEditingBudget(null)
      form.reset({
        category: "",
        amount: undefined,
      })
    }
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingBudget(null)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (editingBudget) {
        // Update existing budget
        const response = await fetch(`/api/budgets/${editingBudget._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        })

        if (!response.ok) {
          throw new Error("Failed to update budget")
        }

        const updatedBudget = await response.json()
        setBudgets(budgets.map((b) => (b._id === updatedBudget._id ? updatedBudget : b)))
        toast({
          title: "Budget updated",
          description: "Your budget has been updated successfully.",
        })
      } else {
        // Check if budget for this category already exists
        if (budgets.some((b) => b.category === values.category)) {
          toast({
            title: "Budget already exists",
            description: "A budget for this category already exists. Please edit the existing budget instead.",
            variant: "destructive",
          })
          return
        }

        // Create new budget
        const response = await fetch("/api/budgets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        })

        if (!response.ok) {
          throw new Error("Failed to create budget")
        }

        const newBudget = await response.json()
        setBudgets([...budgets, newBudget])
        toast({
          title: "Budget created",
          description: "Your budget has been created successfully.",
        })
      }

      closeDialog()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save budget. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!deletingBudgetId) return

    try {
      const response = await fetch(`/api/budgets/${deletingBudgetId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete budget")
      }

      setBudgets(budgets.filter((b) => b._id !== deletingBudgetId))
      toast({
        title: "Budget deleted",
        description: "The budget has been deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete budget. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingBudgetId(null)
    }
  }

  // Calculate spent amount for each category
  const calculateSpentAmount = (category: string) => {
    return transactions.filter((t) => t.category === category).reduce((sum, t) => sum + t.amount, 0)
  }

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

  // Get categories that don't have budgets yet
  const availableCategories = CATEGORIES.filter(
    (category) => !budgets.some((budget) => budget.category === category.value),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Monthly Budgets</h2>
        <Button onClick={() => openDialog()}>Add Budget</Button>
      </div>

      {budgets.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-10">
              <p>No budgets found. Create your first budget by clicking the "Add Budget" button.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const categoryObj = CATEGORIES.find((c) => c.value === budget.category)
            const spentAmount = calculateSpentAmount(budget.category)
            const percentage = Math.min(Math.round((spentAmount / budget.amount) * 100), 100)
            const isOverBudget = spentAmount > budget.amount

            return (
              <Card key={budget._id} className={isOverBudget ? "border-red-300" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{categoryObj?.label || budget.category}</CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openDialog(budget)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingBudgetId(budget._id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>Monthly budget: ${budget.amount.toFixed(2)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Spent: ${spentAmount.toFixed(2)}</span>
                      <span className={isOverBudget ? "text-red-500 font-medium" : ""}>{percentage}%</span>
                    </div>
                    <Progress
                      value={percentage}
                      className={isOverBudget ? "bg-red-100" : ""}
                      indicatorClassName={isOverBudget ? "bg-red-500" : ""}
                    />
                    {isOverBudget && (
                      <p className="text-xs text-red-500 font-medium">
                        Over budget by ${(spentAmount - budget.amount).toFixed(2)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBudget ? "Edit Budget" : "Create Budget"}</DialogTitle>
            <DialogDescription>Set a monthly budget limit for a specific category.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!editingBudget}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(editingBudget
                          ? CATEGORIES.filter((c) => c.value === editingBudget.category)
                          : availableCategories
                        ).map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Budget Amount ($)</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription>Set your monthly spending limit for this category</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button variant="outline" type="button" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button type="submit">{editingBudget ? "Save Changes" : "Create Budget"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingBudgetId} onOpenChange={(open) => !open && setDeletingBudgetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the budget.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

