import { type NextRequest, NextResponse } from "next/server"
import { invoiceService } from "@/lib/invoice-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const customerId = searchParams.get("customerId")

    let invoices

    if (startDate && endDate) {
      invoices = invoiceService.getInvoicesByDateRange(startDate, endDate)
    } else if (customerId) {
      invoices = invoiceService.getInvoicesByCustomer(Number.parseInt(customerId))
    } else {
      invoices = invoiceService.getAllInvoices()
    }

    return NextResponse.json(invoices)
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json({ error: "Invoice items are required" }, { status: 400 })
    }

    const invoiceId = invoiceService.createInvoice(
      {
        date: data.date || new Date().toISOString(),
        customer_id: data.customer_id || null,
        subtotal: data.subtotal,
        discount_amount: data.discount_amount || 0,
        total: data.total,
        payment_method: data.payment_method,
        status: data.status || "paid",
      },
      data.items,
    )

    return NextResponse.json({ id: invoiceId }, { status: 201 })
  } catch (error) {
    console.error("Error creating invoice:", error)
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
}
