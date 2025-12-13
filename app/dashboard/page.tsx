"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser, getUserData, type User, type UserData } from "@/lib/auth"
import { Shield, Clock, ExternalLink, Plus } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      const userSpecificData = getUserData(currentUser.id)
      setUserData(userSpecificData)
    }
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getDaysRemaining = (dateString: string) => {
    const now = new Date()
    const expiry = new Date(dateString)
    const diff = expiry.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 3600 * 24))
  }

  const isTrialSubscription = userData?.subscription?.plan === "3-day trial"

  const isSubscriptionActive =
    userData?.subscription?.isActive &&
    userData?.subscription?.expiresAt &&
    new Date(userData.subscription.expiresAt) > new Date()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-mono font-bold text-green-400 mb-2">Dashboard</h1>
        <p className="text-green-300/80">Welcome back, {user?.username}</p>
      </div>

      {/* Subscription Status */}
      <Card className="bg-slate-900/50 border-green-900/30">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isSubscriptionActive && userData?.subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 font-semibold">
                    {isTrialSubscription ? "Free Trial Active" : "Active Subscription"}
                  </p>
                  <p className="text-green-300/80 text-sm">{userData.subscription.plan}</p>
                </div>
                <Badge
                  className={`${isTrialSubscription ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"} text-black`}
                >
                  {isTrialSubscription ? "Trial" : "Active"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-green-300/80">
                <Clock className="w-4 h-4" />
                <span>
                  Expires on {formatDate(userData.subscription.expiresAt)} (
                  {getDaysRemaining(userData.subscription.expiresAt)} days remaining)
                </span>
              </div>
              {isTrialSubscription && (
                <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                  <p className="text-blue-300 text-sm mb-3">
                    🎉 You're on a free 3-day trial! Upgrade to continue enjoying OpenNet VPN after your trial expires.
                  </p>
                  <Link href="/dashboard/order">
                    <Button className="bg-green-600 hover:bg-green-700 text-black font-semibold">
                      <Plus className="w-4 h-4 mr-2" />
                      Upgrade Now
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-400 font-semibold">No Active Subscription</p>
                  <p className="text-green-300/80 text-sm">You don't have an active subscription</p>
                </div>
                <Badge variant="destructive">Inactive</Badge>
              </div>
              <Link href="/dashboard/order">
                <Button className="bg-green-600 hover:bg-green-700 text-black font-semibold">
                  <Plus className="w-4 h-4 mr-2" />
                  Buy Subscription
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connection Test */}
      <Card className="bg-slate-900/50 border-green-900/30">
        <CardHeader>
          <CardTitle className="text-green-400">Connection Test</CardTitle>
          <CardDescription className="text-green-300/80">
            Verify your VPN connection is working properly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 font-semibold mb-1">Test your connection</p>
              <p className="text-green-300/80 text-sm">Check if your VPN is working at DoesMyVPN.work</p>
            </div>
            <Button
              variant="outline"
              className="border-green-700 text-green-400 hover:bg-green-900/20 bg-transparent"
              onClick={() => window.open("https://DoesMyVPN.work", "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/50 border-green-900/30">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-green-400 mb-1">3</div>
              <p className="text-green-300/80 text-sm">Supported Protocols</p>
              <p className="text-xs text-green-400 mt-2">Vless • Vmess • Shadowsocks</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-green-900/30">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-green-400 mb-1">5</div>
              <p className="text-green-300/80 text-sm">Max Devices</p>
              <p className="text-xs text-green-400 mt-2">Simultaneous connections</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-green-900/30">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-green-400 mb-1">SOL</div>
              <p className="text-green-300/80 text-sm">Payment Method</p>
              <p className="text-xs text-green-400 mt-2">Crypto payments only</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-slate-900/50 border-green-900/30">
        <CardHeader>
          <CardTitle className="text-green-400">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-green-900/20">
              <div>
                <p className="text-green-300 text-sm">Account created</p>
                <p className="text-green-300/60 text-xs">Welcome to OpenNet</p>
              </div>
              <span className="text-green-400 text-xs">{user?.createdAt ? formatDate(user.createdAt) : "Today"}</span>
            </div>
            {isTrialSubscription && (
              <div className="flex items-center justify-between py-2 border-b border-green-900/20">
                <div>
                  <p className="text-green-300 text-sm">3-day trial activated</p>
                  <p className="text-green-300/60 text-xs">Free trial started automatically</p>
                </div>
                <span className="text-green-400 text-xs">Today</span>
              </div>
            )}
            {isSubscriptionActive && userData?.subscription && !isTrialSubscription && (
              <div className="flex items-center justify-between py-2 border-b border-green-900/20">
                <div>
                  <p className="text-green-300 text-sm">Subscription activated</p>
                  <p className="text-green-300/60 text-xs">{userData.subscription.plan}</p>
                </div>
                <span className="text-green-400 text-xs">Recent</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
