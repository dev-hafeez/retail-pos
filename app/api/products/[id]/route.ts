import { type NextRequest, NextResponse } from "next/server"
import { productService } from "@/lib/product-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const product = productService.getProductById(id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const data = await request.json()

    // Prepare update data
    const updateData: any = {}
    if (data.name) updateData.name = data.name
    if (data.barcode) updateData.barcode = data.barcode
    if (data.price !== undefined) updateData.price = Number.parseFloat(data.price)
    if (data.stock !== undefined) updateData.stock = Number.parseInt(data.stock)
    if (data.category) updateData.category = data.category

    const success = productService.updateProduct(id, updateData)

    if (!success) {
      return NextResponse.json({ error: "Product not found or no changes made" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const success = productService.deleteProduct(id)

    if (!success) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
