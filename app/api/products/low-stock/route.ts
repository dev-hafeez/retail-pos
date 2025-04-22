import { type NextRequest, NextResponse } from "next/server"
import { productService } from "@/lib/product-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const threshold = searchParams.get("threshold")

    const products = productService.getLowStockProducts(threshold ? Number.parseInt(threshold) : 10)

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching low stock products:", error)
    return NextResponse.json({ error: "Failed to fetch low stock products" }, { status: 500 })
  }
}
