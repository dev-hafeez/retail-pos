"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building, CreditCard, Printer, Receipt, Save, Settings2 } from "lucide-react"

export default function SettingsPage() {
  const [storeSettings, setStoreSettings] = useState({
    name: "RetailPOS Store",
    address: "123 Main Street, Anytown",
    phone: "(123) 456-7890",
    email: "info@retailpos.com",
    taxRate: "7.5",
    currency: "USD",
  })

  const [receiptSettings, setReceiptSettings] = useState({
    showLogo: true,
    showTaxDetails: true,
    footerText: "Thank you for your purchase!\nPlease come again.",
    emailReceipt: true,
  })

  const [printerSettings, setPrinterSettings] = useState({
    printerName: "Default Printer",
    paperSize: "80mm",
    autoPrint: true,
  })

  const [paymentSettings, setPaymentSettings] = useState({
    acceptCash: true,
    acceptCard: true,
    acceptMobile: true,
    cardProcessor: "stripe",
  })

  // Handle store settings change
  const handleStoreSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setStoreSettings({
      ...storeSettings,
      [name]: value,
    })
  }

  // Handle receipt settings change
  const handleReceiptToggle = (field: string, value: boolean) => {
    setReceiptSettings({
      ...receiptSettings,
      [field]: value,
    })
  }

  const handleFooterTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReceiptSettings({
      ...receiptSettings,
      footerText: e.target.value,
    })
  }

  // Handle payment method toggle
  const handlePaymentToggle = (field: string, value: boolean) => {
    setPaymentSettings({
      ...paymentSettings,
      [field]: value,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="store" className="space-y-4">
        <TabsList>
          <TabsTrigger value="store">
            <Building className="mr-2 h-4 w-4" />
            Store
          </TabsTrigger>
          <TabsTrigger value="receipt">
            <Receipt className="mr-2 h-4 w-4" />
            Receipt
          </TabsTrigger>
          <TabsTrigger value="printer">
            <Printer className="mr-2 h-4 w-4" />
            Printer
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="mr-2 h-4 w-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="system">
            <Settings2 className="mr-2 h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        {/* Store Settings */}
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Configure your store details that appear on receipts and reports.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="store-name">Store Name</Label>
                  <Input id="store-name" name="name" value={storeSettings.name} onChange={handleStoreSettingChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-phone">Phone Number</Label>
                  <Input
                    id="store-phone"
                    name="phone"
                    value={storeSettings.phone}
                    onChange={handleStoreSettingChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-address">Address</Label>
                <Input
                  id="store-address"
                  name="address"
                  value={storeSettings.address}
                  onChange={handleStoreSettingChange}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="store-email">Email</Label>
                  <Input
                    id="store-email"
                    name="email"
                    type="email"
                    value={storeSettings.email}
                    onChange={handleStoreSettingChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                  <Input
                    id="tax-rate"
                    name="taxRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={storeSettings.taxRate}
                    onChange={handleStoreSettingChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={storeSettings.currency}
                  onValueChange={(value) => setStoreSettings({ ...storeSettings, currency: value })}
                >
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Receipt Settings */}
        <TabsContent value="receipt">
          <Card>
            <CardHeader>
              <CardTitle>Receipt Settings</CardTitle>
              <CardDescription>Customize how receipts are displayed and printed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-logo">Show Store Logo</Label>
                  <p className="text-sm text-muted-foreground">Display your store logo at the top of receipts</p>
                </div>
                <Switch
                  id="show-logo"
                  checked={receiptSettings.showLogo}
                  onCheckedChange={(checked) => handleReceiptToggle("showLogo", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-tax">Show Tax Details</Label>
                  <p className="text-sm text-muted-foreground">Display tax breakdown on receipts</p>
                </div>
                <Switch
                  id="show-tax"
                  checked={receiptSettings.showTaxDetails}
                  onCheckedChange={(checked) => handleReceiptToggle("showTaxDetails", checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="footer-text">Receipt Footer Text</Label>
                <Textarea
                  id="footer-text"
                  placeholder="Enter text to appear at the bottom of receipts"
                  value={receiptSettings.footerText}
                  onChange={handleFooterTextChange}
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-receipt">Email Receipt Option</Label>
                  <p className="text-sm text-muted-foreground">Allow customers to receive receipts via email</p>
                </div>
                <Switch
                  id="email-receipt"
                  checked={receiptSettings.emailReceipt}
                  onCheckedChange={(checked) => handleReceiptToggle("emailReceipt", checked)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Printer Settings */}
        <TabsContent value="printer">
          <Card>
            <CardHeader>
              <CardTitle>Printer Settings</CardTitle>
              <CardDescription>Configure your receipt printer settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="printer-name">Printer Name</Label>
                <Select
                  value={printerSettings.printerName}
                  onValueChange={(value) => setPrinterSettings({ ...printerSettings, printerName: value })}
                >
                  <SelectTrigger id="printer-name">
                    <SelectValue placeholder="Select printer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Default Printer">Default Printer</SelectItem>
                    <SelectItem value="Receipt Printer">Receipt Printer</SelectItem>
                    <SelectItem value="Thermal Printer">Thermal Printer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paper-size">Paper Size</Label>
                <Select
                  value={printerSettings.paperSize}
                  onValueChange={(value) => setPrinterSettings({ ...printerSettings, paperSize: value })}
                >
                  <SelectTrigger id="paper-size">
                    <SelectValue placeholder="Select paper size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="58mm">58mm</SelectItem>
                    <SelectItem value="80mm">80mm</SelectItem>
                    <SelectItem value="A4">A4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-print">Auto-Print Receipts</Label>
                  <p className="text-sm text-muted-foreground">Automatically print receipt after each sale</p>
                </div>
                <Switch
                  id="auto-print"
                  checked={printerSettings.autoPrint}
                  onCheckedChange={(checked) => setPrinterSettings({ ...printerSettings, autoPrint: checked })}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Configure accepted payment methods and processors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="accept-cash">Accept Cash</Label>
                  <p className="text-sm text-muted-foreground">Allow cash payments</p>
                </div>
                <Switch
                  id="accept-cash"
                  checked={paymentSettings.acceptCash}
                  onCheckedChange={(checked) => handlePaymentToggle("acceptCash", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="accept-card">Accept Card</Label>
                  <p className="text-sm text-muted-foreground">Allow credit/debit card payments</p>
                </div>
                <Switch
                  id="accept-card"
                  checked={paymentSettings.acceptCard}
                  onCheckedChange={(checked) => handlePaymentToggle("acceptCard", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="accept-mobile">Accept Mobile Payments</Label>
                  <p className="text-sm text-muted-foreground">Allow mobile payment methods</p>
                </div>
                <Switch
                  id="accept-mobile"
                  checked={paymentSettings.acceptMobile}
                  onCheckedChange={(checked) => handlePaymentToggle("acceptMobile", checked)}
                />
              </div>
              {(paymentSettings.acceptCard || paymentSettings.acceptMobile) && (
                <div className="space-y-2">
                  <Label htmlFor="card-processor">Card Processor</Label>
                  <Select
                    value={paymentSettings.cardProcessor}
                    onValueChange={(value) => setPaymentSettings({ ...paymentSettings, cardProcessor: value })}
                  >
                    <SelectTrigger id="card-processor">
                      <SelectValue placeholder="Select processor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="manual">Manual (No Integration)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system-wide settings and database options.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="database-connection">Database Connection</Label>
                <div className="rounded-md bg-muted p-4">
                  <p className="text-sm font-mono">Ready to connect to SQL database</p>
                </div>
              </div>
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  Backup Database
                </Button>
              </div>
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  Export All Data
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
