import { NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL ?? 'http://localhost:8000';

export async function GET(request: Request, { params }: { params: { barcode: string } }) {
  const { barcode } = await params;

  try {
    const backendUrl = `${FASTAPI_URL}/products/exact-barcode/${barcode}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { detail: errorData.detail || `No product found with barcode: ${barcode}` },
        { status: response.status }
      );
    }

    const product = await response.json();
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error proxying request to FastAPI:', error);
    return NextResponse.json(
      { detail: 'Failed to fetch product from backend' },
      { status: 500 }
    );
  }
}