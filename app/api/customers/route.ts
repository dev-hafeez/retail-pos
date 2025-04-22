import { type NextRequest, NextResponse } from "next/server"
import { customerService } from "@/lib/customer-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("query")

    let customers

    if (query) {
      customers = customerService.searchCustomers(query)
    } else {
      customers = customerService.getAllCustomers()
    }

    return NextResponse.json(customers)
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ error: "Customer name is required" }, { status: 400 })
    }

    const customer = customerService.createCustomer({
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}
