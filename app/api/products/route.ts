import { NextRequest, NextResponse } from "next/server"

let cachedProducts: any[] | null = null
let cacheTimestamp: number | null = null
const CACHE_TTL = 60 * 1000 // 1 minute in milliseconds
const PAGE_SIZE = 20

export async function GET(request: NextRequest) {
  try {
    const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000"
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")
    const category = searchParams.get("category")
    const page = searchParams.get("page") || "1"

    let response;
    let url = `${FASTAPI_URL}/products?page=${page}&page_size=${PAGE_SIZE}`

    // If searching by barcode (all digits)
    if (query && /^\d+$/.test(query)) {
      url = `${FASTAPI_URL}/products/barcode/${query}?page=${page}&page_size=${PAGE_SIZE}`
    }
    // If searching by name (not all digits)
    else if (query && query.trim() !== "") {
      url = `${FASTAPI_URL}/products/name/${encodeURIComponent(query)}?page=${page}&page_size=${PAGE_SIZE}`
    }
    // If filtering by category
    else if (category && category !== "All") {
      url = `${FASTAPI_URL}/products/category/${encodeURIComponent(category)}?page=${page}&page_size=${PAGE_SIZE}`
    }

    response = await fetch(url)
    if (!response.ok) {
      if (response.status === 404) return NextResponse.json([], { status: 200 })
      throw new Error("Failed to fetch products")
    }
    const products = await response.json()
    return NextResponse.json(Array.isArray(products) ? products : [products])
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000"
    const body = await request.json()

    const response = await fetch(`${FASTAPI_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: "Failed to add product", detail: error.detail || response.statusText },
        { status: response.status }
      )
    }

    // Invalidate cache on successful add
    cachedProducts = null
    cacheTimestamp = null

    const product = await response.json()
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error adding product:", error)
    return NextResponse.json({ error: "Failed to add product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000"
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const response = await fetch(`${FASTAPI_URL}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: "Failed to update product", detail: error.detail || response.statusText },
        { status: response.status }
      )
    }

    // Invalidate cache on successful update
    cachedProducts = null
    cacheTimestamp = null

    const product = await response.json()
    return NextResponse.json(product)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}
