"use client"

import { useState, useEffect } from "react"
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
import { Barcode, FileUp, Plus, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Define Product interface
interface Product {
  id: number
  barcode: string
  name: string
  price: number
  stock: number
  category: string
}

// Mock categories
const categories = ["All", "Clothing", "Footwear", "Accessories"]

function generateBarcode() {
  // Generates a random 13-digit number as a string
  return Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join("")
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [newProduct, setNewProduct] = useState({
    barcode: "",
    name: "",
    price: "",
    stock: "",
    category: "Clothing",
  })
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Fetch products on component mount and when filters change
  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, searchQuery])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      let url = "/api/products"
      const params = new URLSearchParams()
  
      if (searchQuery) {
        params.append("query", searchQuery)
      }
      if (selectedCategory !== "All") {
        params.append("category", selectedCategory)
      }
      params.append("page", page.toString())
  
      if (params.toString()) {
        url += `?${params.toString()}`
      }
  
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }
  
      // Expecting { products, total, totalPages, page, pageSize }
      const data = await response.json()
      if (Array.isArray(data)) {
        setProducts(data)
        setTotalPages(1) // or set to the correct value if you have it
      } else {
        setProducts(data.products || [])
        setTotalPages(data.totalPages || 1)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle adding a new product
  const handleAddProduct = async () => {
    const price = Number.parseFloat(newProduct.price)
    const stock = Number.parseInt(newProduct.stock)

    if (!newProduct.name || isNaN(price) || isNaN(stock)) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields with valid values",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barcode: newProduct.barcode,
          name: newProduct.name,
          price: price,
          stock: stock,
          category: newProduct.category,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        if (
          error.detail &&
          error.detail.toLowerCase().includes("barcode")
        ) {
          toast({
            title: "Duplicate Barcode",
            description: "Barcode already exists. Please try again.",
            variant: "destructive",
          })
          // Generate a new barcode for the user to try again
          setNewProduct({ ...newProduct, barcode: generateBarcode() })
          return
        }
        throw new Error("Failed to add product")
      }

      const addedProduct = await response.json()
      setProducts([...products, addedProduct])
      setIsAddProductOpen(false)

      toast({
        title: "Success",
        description: "Product added successfully",
      })

      // Reset form with a new barcode
      setNewProduct({
        barcode: generateBarcode(),
        name: "",
        price: "",
        stock: "",
        category: "Clothing",
      })
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      })
    }
  }

  // Edit button handler
  const handleEditClick = (product: Product) => {
    setEditProduct(product)
    setIsEditProductOpen(true)
  }

  // Save edited product
  const handleUpdateProduct = async () => {
    if (!editProduct) return
    const { id, barcode, name, price, stock, category } = editProduct

    if (!name || isNaN(Number(price)) || isNaN(Number(stock))) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields with valid values",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, barcode, name, price, stock, category }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        toast({
          title: "Error",
          description: error.detail || "Failed to update product",
          variant: "destructive",
        })
        return
      }

      const updated = await response.json()
      setProducts(products.map((p) => (p.id === updated.id ? updated : p)))
      setIsEditProductOpen(false)
      setEditProduct(null)
      toast({
        title: "Success",
        description: "Product updated successfully",
      })
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline">
            <FileUp className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Dialog
            open={isAddProductOpen}
            onOpenChange={(open) => {
              setIsAddProductOpen(open);
              if (open) {
                setNewProduct({
                  barcode: generateBarcode(),
                  name: "",
                  price: "",
                  stock: "",
                  category: "Clothing",
                });
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Enter the details of the new product.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <div className="relative">
                    <Barcode className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="barcode"
                      placeholder="Enter barcode"
                      className="pl-8"
                      value={newProduct.barcode}
                      readOnly
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter product name"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      placeholder="0"
                      min="0"
                      value={newProduct.stock}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, stock: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newProduct.category}
                    onValueChange={(value) =>
                      setNewProduct({ ...newProduct, category: value })
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddProductOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddProduct}>Add Product</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            Manage your products, prices, and inventory levels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name or barcode"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      Loading products...
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center h-24 text-muted-foreground"
                    >
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono">
                        {product.barcode}
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right">
                        ${product.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            product.stock < 10
                              ? "text-red-500  font-medium"
                              : "text-green-500 font-medium"
                          }
                        >
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(product)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <div className="flex items-center justify-center gap-1 py-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNumber) => (
              <Button
                key={pageNumber}
                variant={pageNumber === page ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(pageNumber)}
                className="w-8"
              >
                {pageNumber}
              </Button>
            )
          )}

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </Card>

      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the details of the product.
            </DialogDescription>
          </DialogHeader>
          {editProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-barcode">Barcode</Label>
                <Input id="edit-barcode" value={editProduct.barcode} readOnly />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Product Name</Label>
                <Input
                  id="edit-name"
                  value={editProduct.name}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">Price ($)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editProduct.price}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-stock">Stock</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    min="0"
                    value={editProduct.stock}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        stock: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editProduct.category}
                  onValueChange={(value) =>
                    setEditProduct({ ...editProduct, category: value })
                  }
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditProductOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateProduct}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
