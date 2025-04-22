import { type NextRequest, NextResponse } from "next/server"
import { inventoryService } from "@/lib/inventory-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const productId = searchParams.get("productId")
    const type = searchParams.get("type") as "stock-in" | "stock-out" | null
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let transactions

    if (productId) {
      transactions = inventoryService.getTransactionsByProduct(Number.parseInt(productId))
    } else if (type) {
      transactions = inventoryService.getTransactionsByType(type)
    } else if (startDate && endDate) {
      transactions = inventoryService.getTransactionsByDateRange(startDate, endDate)
    } else {
      transactions = inventoryService.getAllTransactions()
    }

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching inventory transactions:", error)
    return NextResponse.json({ error: "Failed to fetch inventory transactions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.type || !data.product_id || data.quantity === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const transaction = inventoryService.createTransaction({
      date: data.date || new Date().toISOString(),
      type: data.type,
      product_id: data.product_id,
      quantity: data.quantity,
      notes: data.notes || null,
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error("Error creating inventory transaction:", error)
    return NextResponse.json({ error: "Failed to create inventory transaction" }, { status: 500 })
  }
}
