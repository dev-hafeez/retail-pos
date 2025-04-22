// app/api/auth/route.ts
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json()

    // 1) Normalize the role string to Title Case
    const normalizedRole =
      role.charAt(0).toUpperCase() +
      role.slice(1).toLowerCase()

    // 2) Build form‑urlencoded body for OAuth2PasswordRequestForm
    const form = new URLSearchParams({
      grant_type: "password",
      username:  email,
      password:  password,
      scope:     normalizedRole,   // must be exactly "Cashier" or "Admin"
    })

    // 3) POST to your FastAPI /login
    const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000"
    const res = await fetch(`${FASTAPI_URL}/login`, {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    form.toString(),
    })

    // 4) If Python returns a 400, 401, etc., grab its JSON to see the detail
    const payload = await res.json().catch(() => ({}))
    if (!res.ok) {
      // Try to surface the actual detail message
      const detail = payload.detail || payload.error || res.statusText
      return NextResponse.json(
        { error: "Authentication failed", detail },
        { status: res.status }
      )
    }

    // 5) On success, we get back { access_token, token_type, expires_in }
    const { access_token, expires_in } = payload as {
      access_token: string
      token_type:   "bearer"
      expires_in:   number
    }

    // 6) Return it (or set HttpOnly cookie, etc.)
    const response = NextResponse.json({
      message:      "Login successful",
      access_token,
      expires_in,
    })
    // Example if you want a cookie instead:
    // response.cookies.set("token", access_token, {
    //   httpOnly: true,
    //   path: "/",
    //   maxAge: expires_in,
    // })

    return response

  } catch (err) {
    console.error("Login error:", err)
    return NextResponse.json(
      { error: "Unexpected authentication error" },
      { status: 500 }
    )
  }
}
