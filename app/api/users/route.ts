import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/user-service"

export async function GET(request: NextRequest) {
  try {
    const users = userService.getAllUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.email || !data.password || !data.role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const user = userService.createUser({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
