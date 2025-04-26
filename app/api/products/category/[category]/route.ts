import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { category: string } }) {
  try {
    const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000"
    const response = await fetch(`${FASTAPI_URL}/products/category/${params.category}`)

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "No products found in this category" }, { status: 404 })
      }
      throw new Error("Failed to fetch products by category")
    }

    const products = await response.json()
    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products by category:", error)
    return NextResponse.json({ error: "Failed to fetch products by category" }, { status: 500 })
  }
}