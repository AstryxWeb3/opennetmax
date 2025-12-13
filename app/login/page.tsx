"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authenticateUser, setCurrentUser } from "@/lib/auth"

export default function LoginPage() {
  const [accessCode, setAccessCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")

    // Add hyphens automatically
    if (value.length > 4) {
      value = value.slice(0, 4) + "-" + value.slice(4)
    }
    if (value.length > 9) {
      value = value.slice(0, 9) + "-" + value.slice(9)
    }
    if (value.length > 14) {
      value = value.slice(0, 14) + "-" + value.slice(14, 18)
    }

    setAccessCode(value)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!accessCode.trim()) {
      setError("Access code is required")
      return
    }

    setIsLoading(true)

    try {
      const result = await authenticateUser(accessCode)

      if (!result.success) {
        setError(result.error || "Login failed")
        return
      }

      if (result.user) {
        setCurrentUser(result.user)
        router.push("/dashboard")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-green-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <img src="/images/design-mode/KSFLvLJ(1).png" alt="OpenNet" className="w-8 h-8" />
            <span className="text-2xl font-mono font-bold text-green-400">OpenNet</span>
          </Link>
        </div>

        <Card className="bg-slate-900/50 border-green-900/30">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-mono text-green-400">Welcome Back</CardTitle>
            <CardDescription className="text-green-300/80">Enter your access code to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-900/20 border border-red-900/30 text-red-400 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="accessCode" className="text-green-400">
                  Access Code
                </Label>
                <Input
                  id="accessCode"
                  type="text"
                  value={accessCode}
                  onChange={handleCodeChange}
                  className="bg-slate-800 border-green-900/30 text-green-400 focus:border-green-600 font-mono text-lg tracking-wider text-center"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  required
                  maxLength={19}
                  autoComplete="off"
                />
                <p className="text-green-300/60 text-xs text-center">Enter your 16-character access code</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-black font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-green-300/80 text-sm">
                Don't have a code?{" "}
                <Link href="/register" className="text-green-400 hover:text-green-300 font-semibold">
                  Get one now
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
