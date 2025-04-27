import { NextResponse, NextRequest } from "next/server";

let cachedProducts: any = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL = 60 * 1000 

export async function PATCH(request: NextRequest) {
    try {
      const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000";
      const body = await request.json();
      const { productId, stock } = body;
  
      if (typeof productId !== "number" || typeof stock !== "number") {
        return NextResponse.json(
          { error: "Product ID and stock must be numbers" },
          { status: 400 }
        );
      }
  
      if (stock < 0) {
        return NextResponse.json(
          { error: "Stock cannot be negative" },
          { status: 400 }
        );
      }
  
      const response = await fetch(`${FASTAPI_URL}/products/${productId}/stock`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock }),
      });
  
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return NextResponse.json(
          { error: "Failed to update product stock", detail: error.detail || response.statusText },
          { status: response.status }
        );
      }
  
      // Invalidate cache on successful stock update
      cachedProducts = null;
      cacheTimestamp = null;
  
      const updatedProduct = await response.json();
      return NextResponse.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product stock:", error);
      return NextResponse.json({ error: "Failed to update product stock" }, { status: 500 });
    }
  }