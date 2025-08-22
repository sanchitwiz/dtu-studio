"use client"

import type React from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/login")
      return
    }

    if (requireAdmin && session.user.role !== "admin") {
      router.push("/schedule")
      return
    }

    // ✅ REMOVED the forcePasswordChange redirect
    // This allows users to access any page, including change-password
    
  }, [session, status, router, requireAdmin])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session || (requireAdmin && session.user.role !== "admin")) {
    return null
  }

  // ✅ REMOVED the forcePasswordChange check here too
  return <>{children}</>
}
