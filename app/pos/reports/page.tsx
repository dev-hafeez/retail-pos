"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDown, ArrowUp, BarChart3, Calendar, Download, LineChart, Package, Printer, User } from "lucide-react"

// Mock sales data
const mockSalesByDay = [
  { date: "2023-04-15", sales: 459.94, transactions: 5, profit: 183.98 },
  { date: "2023-04-16", sales: 689.91, transactions: 8, profit: 275.96 },
  { date: "2023-04-17", sales: 529.92, transactions: 6, profit: 211.97 },
  { date: "2023-04-18", sales: 349.95, transactions: 4, profit: 139.98 },
  { date: "2023-04-19", sales: 779.9, transactions: 9, profit: 311.96 },
  { date: "2023-04-20", sales: 599.93, transactions: 7, profit: 239.97 },
  { date: "2023-04-21", sales: 419.94, transactions: 5, profit: 167.98 },
]

// Mock sales by product
const mockSalesByProduct = [
  { id: 1, name: "T-Shirt", category: "Clothing", quantity: 15, sales: 299.85, profit: 119.94 },
  { id: 3, name: "Sneakers", category: "Footwear", quantity: 8, sales: 479.92, profit: 191.97 },
  { id: 2, name: "Jeans", category: "Clothing", quantity: 10, sales: 399.9, profit: 159.96 },
  { id: 4, name: "Backpack", category: "Accessories", quantity: 7, sales: 209.93, profit: 83.97 },
  { id: 6, name: "Sunglasses", category: "Accessories", quantity: 9, sales: 224.91, profit: 89.96 },
  { id: 5, name: "Water Bottle", category: "Accessories", quantity: 12, sales: 119.88, profit: 47.95 },
  { id: 7, name: "Hat", category: "Clothing", quantity: 11, sales: 164.89, profit: 65.96 },
  { id: 8, name: "Socks", category: "Clothing", quantity: 20, sales: 159.8, profit: 63.92 },
]

// Mock sales by cashier
const mockSalesByCashier = [
  { id: 1, name: "John Smith", transactions: 25, sales: 1289.75, profit: 515.9 },
  { id: 2, name: "Jane Doe", transactions: 18, sales: 959.82, profit: 383.93 },
  { id: 3, name: "Bob Johnson", transactions: 22, sales: 1079.78, profit: 431.91 },
]

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("week")

  // Calculate totals
  const totalSales = mockSalesByDay.reduce((sum, day) => sum + day.sales, 0)
  const totalTransactions = mockSalesByDay.reduce((sum, day) => sum + day.transactions, 0)
  const totalProfit = mockSalesByDay.reduce((sum, day) => sum + day.profit, 0)

  // Calculate averages
  const avgSalesPerDay = totalSales / mockSalesByDay.length
  const avgTransactionsPerDay = totalTransactions / mockSalesByDay.length
  const avgSalesPerTransaction = totalSales / totalTransactions

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Custom Range
          </Button>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 flex items-center">
                <ArrowUp className="mr-1 h-3 w-3" />
                12.5%
              </span>{" "}
              from last {dateRange}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalProfit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 flex items-center">
                <ArrowUp className="mr-1 h-3 w-3" />
                8.2%
              </span>{" "}
              from last {dateRange}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500 flex items-center">
                <ArrowDown className="mr-1 h-3 w-3" />
                3.1%
              </span>{" "}
              from last {dateRange}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Sale</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgSalesPerTransaction.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 flex items-center">
                <ArrowUp className="mr-1 h-3 w-3" />
                5.4%
              </span>{" "}
              from last {dateRange}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="cashiers">Cashiers</TabsTrigger>
        </TabsList>

        {/* Daily Sales Tab */}
        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Sales Report</CardTitle>
              <CardDescription>View your sales performance by day.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Sales</TableHead>
                      <TableHead className="text-right">Transactions</TableHead>
                      <TableHead className="text-right">Avg. Sale</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockSalesByDay.map((day) => (
                      <TableRow key={day.date}>
                        <TableCell>{day.date}</TableCell>
                        <TableCell className="text-right">${day.sales.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{day.transactions}</TableCell>
                        <TableCell className="text-right">${(day.sales / day.transactions).toFixed(2)}</TableCell>
                        <TableCell className="text-right">${day.profit.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Product</CardTitle>
              <CardDescription>View your best-selling products.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Quantity Sold</TableHead>
                      <TableHead className="text-right">Sales</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockSalesByProduct.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-right">{product.quantity}</TableCell>
                        <TableCell className="text-right">${product.sales.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${product.profit.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cashiers Tab */}
        <TabsContent value="cashiers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Cashier</CardTitle>
              <CardDescription>View performance by cashier.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cashier</TableHead>
                      <TableHead className="text-right">Transactions</TableHead>
                      <TableHead className="text-right">Sales</TableHead>
                      <TableHead className="text-right">Avg. Sale</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockSalesByCashier.map((cashier) => (
                      <TableRow key={cashier.id}>
                        <TableCell className="font-medium">{cashier.name}</TableCell>
                        <TableCell className="text-right">{cashier.transactions}</TableCell>
                        <TableCell className="text-right">${cashier.sales.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          ${(cashier.sales / cashier.transactions).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">${cashier.profit.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
