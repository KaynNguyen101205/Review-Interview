import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "./session"

export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return user
}

export async function requireAdmin(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || (user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return user
}

