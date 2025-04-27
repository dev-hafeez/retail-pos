import { NextRequest, NextResponse } from "next/server"

export async function GET(_: NextRequest, context: { params: { barcode: string } }) {
  try {
    const { params } = await context;
    const barcode = params.barcode; // just access from params
    const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000"
    const response = await fetch(`${FASTAPI_URL}/products/barcode/${barcode}`)

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }
      throw new Error("Failed to fetch product by barcode")
    }

    const product = await response.json()
    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product by barcode:", error)
    return NextResponse.json({ error: "Failed to fetch product by barcode" }, { status: 500 })
  }
}
