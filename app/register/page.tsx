"use client"

import type React from "react"
import type { User } from "@/lib/auth"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createUser, setCurrentUser } from "@/lib/auth"
import { Copy, Check } from "lucide-react"

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [createdUser, setCreatedUser] = useState<User | null>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await createUser()

      if (!result.success) {
        setError(result.error || "Registration failed")
        return
      }

      if (result.user && result.accessCode) {
        setGeneratedCode(result.accessCode)
        setCreatedUser(result.user)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyCode = async () => {
    if (generatedCode) {
      await navigator.clipboard.writeText(generatedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleProceed = () => {
    if (createdUser) {
      setCurrentUser(createdUser)
      router.push("/dashboard")
    }
  }

  if (generatedCode) {
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
              <CardTitle className="text-2xl font-mono text-green-400">Your Access Code</CardTitle>
              <CardDescription className="text-green-300/80">
                Save this code securely - you'll need it to log in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-800/50 border-2 border-green-600/50 rounded-lg p-6 text-center">
                <div className="text-3xl font-mono font-bold text-green-400 tracking-wider mb-4 select-all">
                  {generatedCode}
                </div>
                <Button
                  onClick={handleCopyCode}
                  variant="outline"
                  className="w-full border-green-600/50 text-green-400 hover:bg-green-600/10 bg-transparent"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                <p className="text-yellow-400 text-sm font-semibold mb-2">⚠️ Important:</p>
                <ul className="text-yellow-300/80 text-xs space-y-1">
                  <li>• This code will only be shown once</li>
                  <li>• Store it in a safe place</li>
                  <li>• You'll need it to access your account</li>
                  <li>• If you lose it, you'll lose access to your account</li>
                </ul>
              </div>

              <Button
                onClick={handleProceed}
                className="w-full bg-green-600 hover:bg-green-700 text-black font-semibold"
              >
                I've Saved My Code - Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
            <CardTitle className="text-2xl font-mono text-green-400">Create Account</CardTitle>
            <CardDescription className="text-green-300/80">
              Get your anonymous access code for secure VPN access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <div className="bg-red-900/20 border border-red-900/30 text-red-400 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="bg-slate-800/50 border border-green-900/30 rounded-lg p-4 space-y-2">
                <p className="text-green-400 font-semibold text-sm">🔒 Maximum Anonymity</p>
                <p className="text-green-300/80 text-xs">
                  We'll generate a unique 16-character access code for you. No username, no email, no personal
                  information required.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-black font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Generating your code..." : "Generate Access Code"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-green-300/80 text-sm">
                Already have a code?{" "}
                <Link href="/login" className="text-green-400 hover:text-green-300 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
