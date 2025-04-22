import { type NextRequest, NextResponse } from "next/server"
import { productService } from "@/lib/product-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("query")
    const category = searchParams.get("category")

    let products

    if (query) {
      products = productService.searchProducts(query)
    } else if (category && category !== "All") {
      products = productService.getProductsByCategory(category)
    } else {
      products = productService.getAllProducts()
    }

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.barcode || !data.name || data.price === undefined || data.stock === undefined || !data.category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const product = productService.createProduct({
      barcode: data.barcode,
      name: data.name,
      price: Number.parseFloat(data.price),
      stock: Number.parseInt(data.stock),
      category: data.category,
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
