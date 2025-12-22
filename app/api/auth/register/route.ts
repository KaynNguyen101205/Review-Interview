import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

// Force dynamic rendering
export const dynamic = "force-dynamic"

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required").optional(),
  school: z.string().optional(),
  gradYear: z.number().optional(),
  major: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name || null,
        school: data.school || null,
        gradYear: data.gradYear || null,
        major: data.major || null,
        role: "USER",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}

