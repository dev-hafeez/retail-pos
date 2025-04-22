"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, CreditCard, Download, Printer, RefreshCcw, Search, User } from "lucide-react"

// Mock invoice data
const mockInvoices = [
  {
    id: "INV-001",
    date: "2023-04-15",
    customer: "John Doe",
    total: 159.97,
    status: "paid",
    paymentMethod: "cash",
    items: [
      { id: 1, name: "T-Shirt", price: 19.99, quantity: 2 },
      { id: 3, name: "Sneakers", price: 59.99, quantity: 2 },
    ],
  },
  {
    id: "INV-002",
    date: "2023-04-16",
    customer: "Jane Smith",
    total: 89.97,
    status: "paid",
    paymentMethod: "card",
    items: [
      { id: 2, name: "Jeans", price: 39.99, quantity: 1 },
      { id: 4, name: "Backpack", price: 29.99, quantity: 1 },
      { id: 5, name: "Water Bottle", price: 9.99, quantity: 2 },
    ],
  },
  {
    id: "INV-003",
    date: "2023-04-17",
    customer: "Bob Johnson",
    total: 119.98,
    status: "refunded",
    paymentMethod: "card",
    items: [{ id: 3, name: "Sneakers", price: 59.99, quantity: 2 }],
  },
  {
    id: "INV-004",
    date: "2023-04-18",
    customer: "Alice Brown",
    total: 49.98,
    status: "paid",
    paymentMethod: "cash",
    items: [{ id: 6, name: "Sunglasses", price: 24.99, quantity: 2 }],
  },
  {
    id: "INV-005",
    date: "2023-04-19",
    customer: "Charlie Wilson",
    total: 79.96,
    status: "paid",
    paymentMethod: "card",
    items: [
      { id: 7, name: "Hat", price: 14.99, quantity: 2 },
      { id: 8, name: "Socks", price: 7.99, quantity: 5 },
      { id: 5, name: "Water Bottle", price: 9.99, quantity: 1 },
    ],
  },
]

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all")
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false)

  // Filter invoices based on search query, status, and payment method
  const filteredInvoices = mockInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = selectedStatus === "all" || invoice.status === selectedStatus
    const matchesPaymentMethod = selectedPaymentMethod === "all" || invoice.paymentMethod === selectedPaymentMethod

    return matchesSearch && matchesStatus && matchesPaymentMethod
  })

  // View invoice details
  const viewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice)
    setIsInvoiceDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Sales History</CardTitle>
          <CardDescription>View and manage all your sales transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by invoice number or customer"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
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
                      Invoice
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Customer
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Payment
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                      No invoices found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <div className="font-medium">{invoice.id}</div>
                        <div className="text-sm text-muted-foreground">{invoice.date}</div>
                      </TableCell>
                      <TableCell>{invoice.customer}</TableCell>
                      <TableCell className="capitalize">{invoice.paymentMethod}</TableCell>
                      <TableCell className="text-right font-medium">${invoice.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={invoice.status === "paid" ? "outline" : "destructive"}>
                          {invoice.status === "paid" ? "Paid" : "Refunded"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => viewInvoice(invoice)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Details Dialog */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 py-4">
              <div className="rounded-md border p-4">
                <div className="text-center space-y-2 mb-4">
                  <h3 className="font-bold text-lg">RetailPOS</h3>
                  <p className="text-sm text-muted-foreground">123 Main Street, Anytown</p>
                  <p className="text-sm text-muted-foreground">Tel: (123) 456-7890</p>
                  <div className="text-sm">
                    <p>Invoice #: {selectedInvoice.id}</p>
                    <p>Date: {selectedInvoice.date}</p>
                    <p>Customer: {selectedInvoice.customer}</p>
                  </div>
                </div>

                <div className="border-t border-b py-2 my-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.items.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between font-bold pt-1">
                    <span>Total</span>
                    <span>${selectedInvoice.total.toFixed(2)}</span>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between">
                      <span>Payment Method</span>
                      <span className="capitalize">{selectedInvoice.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status</span>
                      <span className="capitalize">{selectedInvoice.status}</span>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-4 text-sm">
                  <p>Thank you for your business!</p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" size="sm">
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                {selectedInvoice.status === "paid" && (
                  <Button variant="outline" size="sm">
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Refund
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
