import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { name: string } }) {
  try {
    const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000"
    const response = await fetch(`${FASTAPI_URL}/products/name/${params.name}`)

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }
      throw new Error("Failed to fetch product by name")
    }

    const product = await response.json()
    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product by name:", error)
    return NextResponse.json({ error: "Failed to fetch product by name" }, { status: 500 })
  }
}