"use client"

import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: React.ReactNode }) {
  // Always wrap with SessionProvider - it handles client-side rendering properly
  // The refetchInterval and refetchOnWindowFocus settings prevent unnecessary requests
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  )
}

