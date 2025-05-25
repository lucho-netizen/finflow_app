"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Overview from "@/components/overview"
import { RecentTransactions } from "@/components/recent-transactions"
import { TransactionStats } from "@/components/transaction-stats"
import { AddTransactionButton } from "@/components/add-transaction-button"

interface DashboardData {
  ingresos: number
  egresos: number
  saldo: number
  balance_change?: number
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  const fetchDashboardData = () => {
    axios
      .get("http://localhost:8000/dashboard", {
        withCredentials: true,
      })
      .then((res) => setDashboardData(res.data))
      .catch((err) => console.error("Error fetching dashboard data:", err))
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">FinFlow Dashboard</h1>
          <AddTransactionButton onTransactionAdded={fetchDashboardData} />
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData ? (
                    <>
                      <div className="text-2xl font-bold">${dashboardData.saldo.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">Compared to last month</p>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">Loading...</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Income</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData ? (
                    <>
                      <div className="text-2xl font-bold text-emerald-500">${dashboardData.ingresos.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">This month's income</p>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">Loading...</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData ? (
                    <>
                      <div className="text-2xl font-bold text-rose-500">${dashboardData.egresos.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">This month's expenses</p>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">Loading...</div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview />
                </CardContent>
              </Card>
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>You made 10 transactions this month.</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentTransactions />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>View and manage all your transactions.</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentTransactions showAll />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Statistics</CardTitle>
                <CardDescription>Breakdown of your financial activity.</CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionStats />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
