"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Barcode, Minus, Plus, Printer, Trash2, User, DollarSign, Percent } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Define interfaces
interface Product {
  id: number
  barcode: string
  name: string
  price: number
  stock: number
  category: string
}

interface Customer {
  id: number
  name: string
  email: string | null
  phone: string | null
}

interface CartItem {
  id: number
  barcode: string
  name: string
  price: number
  quantity: number
}

export default function PosTerminal() {
  const [barcode, setBarcode] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string>("")
  const [discountPercent, setDiscountPercent] = useState<number>(0)
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<string>("cash")
  const [amountPaid, setAmountPaid] = useState<string>("")
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false)
  const [invoiceNumber, setInvoiceNumber] = useState<string>("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const { toast } = useToast()

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountValue = discountPercent > 0 ? (subtotal * discountPercent) / 100 : discountAmount
  const total = subtotal - discountValue
  const change = Number.parseFloat(amountPaid) - total > 0 ? Number.parseFloat(amountPaid) - total : 0

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers")

      if (!response.ok) {
        throw new Error("Failed to fetch customers")
      }

      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      console.error("Error fetching customers:", error)
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      })
    }
  }

  // Handle barcode scan/input
  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!barcode) return

    try {
      const response = await fetch(`/api/products/barcode/${barcode}`)

      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Product Not Found",
            description: `No product found with barcode: ${barcode}`,
            variant: "destructive",
          })
          return
        }
        throw new Error("Failed to fetch product")
      }

      const product: Product = await response.json()

      // Check if product already in cart
      const existingItem = cart.find((item) => item.barcode === barcode)

      if (existingItem) {
        // Increase quantity if already in cart
        setCart(cart.map((item) => (item.barcode === barcode ? { ...item, quantity: item.quantity + 1 } : item)))
      } else {
        // Add new item to cart
        setCart([
          ...cart,
          {
            id: product.id,
            barcode: product.barcode,
            name: product.name,
            price: product.price,
            quantity: 1,
          },
        ])
      }

      // Clear barcode input
      setBarcode("")
    } catch (error) {
      console.error("Error fetching product:", error)
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      })
    }
  }

  // Handle quantity change
  const updateQuantity = (barcode: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter((item) => item.barcode !== barcode))
    } else {
      setCart(cart.map((item) => (item.barcode === barcode ? { ...item, quantity: newQuantity } : item)))
    }
  }

  // Remove item from cart
  const removeItem = (barcode: string) => {
    setCart(cart.filter((item) => item.barcode !== barcode))
  }

  // Handle checkout
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to the cart before checkout",
        variant: "destructive",
      })
      return
    }

    setCheckoutDialogOpen(true)
  }

  // Handle payment
  const handlePayment = () => {
    setCheckoutDialogOpen(false)
    setPaymentDialogOpen(true)
  }

  // Complete transaction
  const completeTransaction = async () => {
    try {
      // Generate invoice number
      const newInvoiceNumber = `INV-${Date.now().toString().slice(-6)}`
      setInvoiceNumber(newInvoiceNumber)

      // Prepare invoice data
      const invoiceData = {
        id: newInvoiceNumber,
        date: new Date().toISOString(),
        customer_id: selectedCustomer === "0" ? null : selectedCustomer ? Number.parseInt(selectedCustomer) : null,
        subtotal: subtotal,
        discount_amount: discountValue,
        total: total,
        payment_method: paymentMethod,
        status: "paid",
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      }

      // Save invoice to database
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      })

      if (!response.ok) {
        throw new Error("Failed to save transaction")
      }

      // Close payment dialog and open receipt
      setPaymentDialogOpen(false)
      setReceiptDialogOpen(true)

      toast({
        title: "Success",
        description: "Transaction completed successfully",
      })
    } catch (error) {
      console.error("Error completing transaction:", error)
      toast({
        title: "Error",
        description: "Failed to complete transaction",
        variant: "destructive",
      })
    }
  }

  // Start new transaction
  const startNewTransaction = () => {
    setCart([])
    setSelectedCustomer("")
    setDiscountPercent(0)
    setDiscountAmount(0)
    setPaymentMethod("cash")
    setAmountPaid("")
    setReceiptDialogOpen(false)
  }

  // Auto-focus barcode input
  useEffect(() => {
    const barcodeInput = document.getElementById("barcode-input")
    if (barcodeInput) {
      barcodeInput.focus()
    }
  }, [cart])

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Left Column - Barcode Scanner and Cart */}
      <div className="lg:col-span-2">
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle>POS Terminal</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBarcodeSubmit} className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Barcode className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="barcode-input"
                  type="text"
                  placeholder="Scan barcode or enter product code"
                  className="pl-8"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <Button type="submit">Add</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Shopping Cart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                        Cart is empty. Scan products to add them.
                      </TableCell>
                    </TableRow>
                  ) : (
                    cart.map((item) => (
                      <TableRow key={item.barcode}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.barcode, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.barcode, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => removeItem(item.barcode)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Items: {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </p>
            </div>
            <Button disabled={cart.length === 0} onClick={handleCheckout}>
              Checkout
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Right Column - Customer and Order Summary */}
      <div>
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger className="pl-8">
                    <SelectValue placeholder="Select customer (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No customer</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span>-${discountValue.toFixed(2)}</span>
                </div>

                <Tabs defaultValue="percent" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="percent">Percentage</TabsTrigger>
                    <TabsTrigger value="amount">Amount</TabsTrigger>
                  </TabsList>
                  <TabsContent value="percent" className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <Percent className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="0"
                          className="pl-8"
                          value={discountPercent || ""}
                          onChange={(e) => {
                            const value = Number.parseFloat(e.target.value)
                            setDiscountPercent(isNaN(value) ? 0 : Math.min(value, 100))
                            setDiscountAmount(0)
                          }}
                        />
                      </div>
                      <Button variant="outline" onClick={() => setDiscountPercent(0)} disabled={discountPercent === 0}>
                        Clear
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="amount" className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="pl-8"
                          value={discountAmount || ""}
                          onChange={(e) => {
                            const value = Number.parseFloat(e.target.value)
                            setDiscountAmount(isNaN(value) ? 0 : Math.min(value, subtotal))
                            setDiscountPercent(0)
                          }}
                        />
                      </div>
                      <Button variant="outline" onClick={() => setDiscountAmount(0)} disabled={discountAmount === 0}>
                        Clear
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>Review order details before proceeding to payment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map((item) => (
                    <TableRow key={item.barcode}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>-${discountValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePayment}>Proceed to Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment</DialogTitle>
            <DialogDescription>Select payment method and enter amount.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="mobile">Mobile Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Total Amount</Label>
              <div className="text-2xl font-bold">${total.toFixed(2)}</div>
            </div>

            {paymentMethod === "cash" && (
              <div className="space-y-2">
                <Label htmlFor="amount-paid">Amount Paid</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount-paid"
                    type="number"
                    placeholder="0.00"
                    className="pl-8"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                  />
                </div>

                {Number.parseFloat(amountPaid) >= total && (
                  <div className="flex justify-between pt-2">
                    <span>Change</span>
                    <span className="font-medium">${change.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={completeTransaction}
              disabled={(paymentMethod === "cash" && Number.parseFloat(amountPaid) < total) || !paymentMethod}
            >
              Complete Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Receipt</DialogTitle>
            <DialogDescription>Transaction completed successfully.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-md border p-4">
              <div className="text-center space-y-2 mb-4">
                <h3 className="font-bold text-lg">RetailPOS</h3>
                <p className="text-sm text-muted-foreground">123 Main Street, Anytown</p>
                <p className="text-sm text-muted-foreground">Tel: (123) 456-7890</p>
                <div className="text-sm">
                  <p>Invoice #: {invoiceNumber}</p>
                  <p>Date: {new Date().toLocaleDateString()}</p>
                  <p>Time: {new Date().toLocaleTimeString()}</p>
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
                    {cart.map((item) => (
                      <TableRow key={item.barcode}>
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
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discountValue > 0 && (
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span>-${discountValue.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold pt-1">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between">
                    <span>Payment Method</span>
                    <span className="capitalize">{paymentMethod}</span>
                  </div>
                  {paymentMethod === "cash" && (
                    <>
                      <div className="flex justify-between">
                        <span>Amount Paid</span>
                        <span>${Number.parseFloat(amountPaid).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Change</span>
                        <span>${change.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="text-center mt-4 text-sm">
                <p>Thank you for your purchase!</p>
                <p className="text-muted-foreground">Please keep this receipt for returns.</p>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="sm:flex-1" onClick={startNewTransaction}>
              New Transaction
            </Button>
            <Button className="sm:flex-1">
              <Printer className="mr-2 h-4 w-4" />
              Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
