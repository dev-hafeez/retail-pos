import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/user-service"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const user = await userService.verifyCredentials(email, password)

    return NextResponse.json({
      user,
      message: "Login successful",
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}