import { type NextRequest, NextResponse } from "next/server"
import { invoiceService } from "@/lib/invoice-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("startDate") || "2000-01-01"
    const endDate = searchParams.get("endDate") || new Date().toISOString()

    const salesByProduct = invoiceService.getSalesByProduct(startDate, endDate)

    return NextResponse.json(salesByProduct)
  } catch (error) {
    console.error("Error fetching sales by product:", error)
    return NextResponse.json({ error: "Failed to fetch sales by product" }, { status: 500 })
  }
}
