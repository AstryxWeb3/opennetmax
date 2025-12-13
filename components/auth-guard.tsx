"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getCurrentUser, type User } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/login")
      return
    }
    setUser(currentUser)
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen bg-slate-950 text-green-400 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="font-mono">Authenticating...</p>
          </div>
        </div>
      )
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
