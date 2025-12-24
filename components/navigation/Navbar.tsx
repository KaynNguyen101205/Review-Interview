"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import NotificationBell from "@/components/notifications/NotificationBell"

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Review Platform
        </Link>

        <div className="flex gap-4 items-center">
          <Link href="/companies" className="hover:text-primary">
            Companies
          </Link>
          <Link href="/reviews" className="hover:text-primary">
            Reviews
          </Link>
          {session ? (
            <>
              {(session.user as any)?.role === "ADMIN" && (
                <Link href="/admin" className="hover:text-primary">
                  Admin
                </Link>
              )}
              <NotificationBell />
              <Link href="/me" className="hover:text-primary">
                My Account
              </Link>
              <Button variant="ghost" onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

