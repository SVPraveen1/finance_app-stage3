import TransactionList from "@/components/transaction-list"
import TransactionForm from "@/components/transaction-form"
import Dashboard from "@/components/dashboard"
import BudgetManager from "@/components/budget-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BudgetComparisonChart from "@/components/budget-comparison-chart"
import SpendingInsights from "@/components/spending-insights"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Personal Finance Visualizer - Stage 3</h1>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Dashboard />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-8">
          <TransactionForm />
          <TransactionList />
        </TabsContent>

        <TabsContent value="budgets">
          <BudgetManager />
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BudgetComparisonChart />
            <SpendingInsights />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}

