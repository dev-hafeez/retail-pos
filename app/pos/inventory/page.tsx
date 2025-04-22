"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AlertTriangle, ArrowDownUp, Calendar, Package, Plus, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Mock product data
const mockProducts = [
  { id: 1, barcode: "8901234567890", name: "T-Shirt", price: 19.99, stock: 50, category: "Clothing" },
  { id: 2, barcode: "7890123456789", name: "Jeans", price: 39.99, stock: 30, category: "Clothing" },
  { id: 3, barcode: "6789012345678", name: "Sneakers", price: 59.99, stock: 20, category: "Footwear" },
  { id: 4, barcode: "5678901234567", name: "Backpack", price: 29.99, stock: 15, category: "Accessories" },
  { id: 5, barcode: "4567890123456", name: "Water Bottle", price: 9.99, stock: 5, category: "Accessories" },
  { id: 6, barcode: "3456789012345", name: "Sunglasses", price: 24.99, stock: 8, category: "Accessories" },
  { id: 7, barcode: "2345678901234", name: "Hat", price: 14.99, stock: 40, category: "Clothing" },
  { id: 8, barcode: "1234567890123", name: "Socks", price: 7.99, stock: 80, category: "Clothing" },
]

// Mock inventory transactions
const mockTransactions = [
  {
    id: 1,
    date: "2023-04-15",
    type: "stock-in",
    productId: 1,
    quantity: 20,
    notes: "Regular stock replenishment",
  },
  {
    id: 2,
    date: "2023-04-16",
    type: "stock-out",
    productId: 3,
    quantity: 5,
    notes: "Damaged items",
  },
  {
    id: 3,
    date: "2023-04-17",
    type: "stock-in",
    productId: 5,
    quantity: 30,
    notes: "New shipment",
  },
  {
    id: 4,
    date: "2023-04-18",
    type: "stock-out",
    productId: 2,
    quantity: 10,
    notes: "Returned to supplier",
  },
  {
    id: 5,
    date: "2023-04-19",
    type: "stock-in",
    productId: 4,
    quantity: 15,
    notes: "New inventory",
  },
]

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [isAddStockOpen, setIsAddStockOpen] = useState(false)
  const [newStock, setNewStock] = useState({
    productId: "",
    type: "stock-in",
    quantity: "",
    notes: "",
  })

  // Filter transactions based on search query and type
  const filteredTransactions = mockTransactions.filter((transaction) => {
    const product = mockProducts.find((p) => p.id === transaction.productId)

    if (!product) return false

    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.barcode.includes(searchQuery)

    const matchesType = selectedType === "all" || transaction.type === selectedType

    return matchesSearch && matchesType
  })

  // Get low stock products (less than 10 items)
  const lowStockProducts = mockProducts.filter((product) => product.stock < 10)

  // Handle adding new stock
  const handleAddStock = () => {
    const productId = Number.parseInt(newStock.productId)
    const quantity = Number.parseInt(newStock.quantity)

    if (!productId || isNaN(quantity) || quantity <= 0) {
      alert("Please fill all fields with valid values")
      return
    }

    // In a real app, you would update the database here
    alert(`Added ${quantity} items to inventory for product ID ${productId}`)
    setIsAddStockOpen(false)

    // Reset form
    setNewStock({
      productId: "",
      type: "stock-in",
      quantity: "",
      notes: "",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <Dialog open={isAddStockOpen} onOpenChange={setIsAddStockOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Stock
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Stock</DialogTitle>
              <DialogDescription>Add or remove stock from inventory.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="product">Product</Label>
                <Select
                  value={newStock.productId}
                  onValueChange={(value) => setNewStock({ ...newStock, productId: value })}
                >
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} (Stock: {product.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Transaction Type</Label>
                <Select value={newStock.type} onValueChange={(value) => setNewStock({ ...newStock, type: value })}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock-in">Stock In</SelectItem>
                    <SelectItem value="stock-out">Stock Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="0"
                  min="1"
                  value={newStock.quantity}
                  onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Add notes (optional)"
                  value={newStock.notes}
                  onChange={(e) => setNewStock({ ...newStock, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddStockOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddStock}>Add Stock</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
              <CardTitle className="text-orange-700 dark:text-orange-300">Low Stock Alert</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-950">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right text-red-500 font-medium">{product.stock}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          Restock
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Inventory Transactions</CardTitle>
          <CardDescription>Track all inventory movements.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product name or barcode"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="stock-in">Stock In</SelectItem>
                <SelectItem value="stock-out">Stock Out</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Date
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      <ArrowDownUp className="h-4 w-4 mr-2" />
                      Type
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      Product
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => {
                    const product = mockProducts.find((p) => p.id === transaction.productId)
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === "stock-in" ? "success" : "destructive"}>
                            {transaction.type === "stock-in" ? "Stock In" : "Stock Out"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{product?.name || "Unknown Product"}</TableCell>
                        <TableCell className="text-right">{transaction.quantity}</TableCell>
                        <TableCell>{transaction.notes}</TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
