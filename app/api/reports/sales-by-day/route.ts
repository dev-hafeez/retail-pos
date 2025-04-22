import { type NextRequest, NextResponse } from "next/server"
import { invoiceService } from "@/lib/invoice-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("startDate") || "2000-01-01"
    const endDate = searchParams.get("endDate") || new Date().toISOString()

    const salesByDay = invoiceService.getSalesByDay(startDate, endDate)

    return NextResponse.json(salesByDay)
  } catch (error) {
    console.error("Error fetching sales by day:", error)
    return NextResponse.json({ error: "Failed to fetch sales by day" }, { status: 500 })
  }
}
