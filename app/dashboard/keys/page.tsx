"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { getCurrentUser, getUserData, updateUserData, type User, type UserData } from "@/lib/auth"
import { Key, Copy, Check, RefreshCw, AlertCircle, Download, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

interface VPNKey {
  id: string
  type: "VLESS" | "VMess" | "Shadowsocks"
  config: string
  location: string
  createdAt: string
}

function parseVPNConfig(configString: string, index: number, userId: string): VPNKey {
  let type: "VLESS" | "VMess" | "Shadowsocks" = "VMess"
  let location = "Unknown"

  // Determine protocol type from prefix
  if (configString.startsWith("vless://")) {
    type = "VLESS"
  } else if (configString.startsWith("vmess://")) {
    type = "VMess"
  } else if (configString.startsWith("ss://")) {
    type = "Shadowsocks"
  }

  // Extract location from the config string
  try {
    if (type === "VMess") {
      // VMess: decode base64 after vmess://
      const base64Data = configString.replace("vmess://", "")
      const decoded = JSON.parse(atob(base64Data))
      location = decoded.ps || "Unknown"
    } else if (type === "VLESS") {
      // VLESS: location is in the URL fragment (after #)
      const hashIndex = configString.indexOf("#")
      if (hashIndex !== -1) {
        location = decodeURIComponent(configString.substring(hashIndex + 1))
      }
    } else if (type === "Shadowsocks") {
      // Shadowsocks: location is in the URL fragment (after #)
      const hashIndex = configString.indexOf("#")
      if (hashIndex !== -1) {
        location = decodeURIComponent(configString.substring(hashIndex + 1))
      }
    }

    location = location.replace(/\s*$$(VMess|VLESS|Shadowsocks)$$\s*$/i, "").trim()
  } catch (error) {
    console.error("Error parsing config:", error)
  }

  return {
    id: `${userId}_key_${index + 1}`,
    type,
    config: configString,
    location,
    createdAt: new Date().toISOString(),
  }
}

export default function KeysPage() {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      const userSpecificData = getUserData(currentUser.id)
      setUserData(userSpecificData)
    }
  }, [])

  const fetchKeys = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const keysArray = Array.isArray(data) ? data : []

        const transformedKeys: VPNKey[] = keysArray.map((configString: string, index: number) =>
          parseVPNConfig(configString, index, user.id),
        )

        updateUserData(user.id, {
          keys: transformedKeys,
        })

        setUserData((prev) => (prev ? { ...prev, keys: transformedKeys } : null))
      } else {
        // Fallback with mock data for demo - user-specific keys
        const mockKeys: VPNKey[] = [
          {
            id: `${user.id}_key_1`,
            type: "VLESS",
            location: "🇷🇴 Румыния",
            config: `vless://uuid@server1.opennet.vpn:443?encryption=none&security=tls&type=ws&host=server1.opennet.vpn&path=/vless#OpenNet-Demo-Vless`,
            createdAt: new Date().toISOString(),
          },
          {
            id: `${user.id}_key_2`,
            type: "VMess",
            location: "🇩🇪 Германия",
            config: `vmess://eyJ2IjoiMiIsInBzIjoiT3Blbk5ldC1EZW1vLVZtZXNzIiwiYWRkIjoic2VydmVyMi5vcGVubmV0LnZwbiIsInBvcnQiOjQ0NCwidHlwZSI6Im5vbmUiLCJpZCI6InV1aWQiLCJhaWQiOjAsIm5ldCI6IndzIiwicGF0aCI6Ii92bWVzcyIsImhvc3QiOiJzZXJ2ZXIyLm9wZW5uZXQudnBuIiwidGxzIjoidGxzIn0=`,
            createdAt: new Date().toISOString(),
          },
          {
            id: `${user.id}_key_3`,
            type: "Shadowsocks",
            location: "🇳🇱 Нидерланды",
            config: `ss://Y2hhY2hhMjAtaWV0Zi1wb2x5MTMwNTpwYXNzd29yZA==@server3.opennet.vpn:445#OpenNet-Demo-Shadowsocks`,
            createdAt: new Date().toISOString(),
          },
        ]

        updateUserData(user.id, {
          keys: mockKeys,
        })

        setUserData((prev) => (prev ? { ...prev, keys: mockKeys } : null))
      }
    } catch (error) {
      console.error("Error fetching keys:", error)
      // Fallback with mock data for demo - user-specific keys
      const mockKeys: VPNKey[] = [
        {
          id: `${user.id}_key_1`,
          type: "VLESS",
          location: "🇷🇴 Румыния",
          config: `vless://uuid@server1.opennet.vpn:443?encryption=none&security=tls&type=ws&host=server1.opennet.vpn&path=/vless#OpenNet-Demo-Vless`,
          createdAt: new Date().toISOString(),
        },
        {
          id: `${user.id}_key_2`,
          type: "VMess",
          location: "🇩🇪 Германия",
          config: `vmess://eyJ2IjoiMiIsInBzIjoiT3Blbk5ldC1EZW1vLVZtZXNzIiwiYWRkIjoic2VydmVyMi5vcGVubmV0LnZwbiIsInBvcnQiOjQ0NCwidHlwZSI6Im5vbmUiLCJpZCI6InV1aWQiLCJhaWQiOjAsIm5ldCI6IndzIiwicGF0aCI6Ii92bWVzcyIsImhvc3QiOiJzZXJ2ZXIyLm9wZW5uZXQudnBuIiwidGxzIjoidGxzIn0=`,
          createdAt: new Date().toISOString(),
        },
        {
          id: `${user.id}_key_3`,
          type: "Shadowsocks",
          location: "🇳🇱 Нидерланды",
          config: `ss://Y2hhY2hhMjAtaWV0Zi1wb2x5MTMwNTpwYXNzd29yZA==@server3.opennet.vpn:445#OpenNet-Demo-Shadowsocks`,
          createdAt: new Date().toISOString(),
        },
      ]

      updateUserData(user.id, {
        keys: mockKeys,
      })

      setUserData((prev) => (prev ? { ...prev, keys: mockKeys } : null))
    }
    setIsLoading(false)
  }

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text)
    setCopied(keyId)
    setTimeout(() => setCopied(null), 2000)
  }

  const toggleKeyVisibility = (keyId: string) => {
    const newVisibleKeys = new Set(visibleKeys)
    if (newVisibleKeys.has(keyId)) {
      newVisibleKeys.delete(keyId)
    } else {
      newVisibleKeys.add(keyId)
    }
    setVisibleKeys(newVisibleKeys)
  }

  const downloadKey = (key: VPNKey) => {
    const element = document.createElement("a")
    const file = new Blob([key.config], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `opennet-${key.type.toLowerCase()}-${user?.username}-${key.id}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const getProtocolColor = (protocol: string) => {
    switch (protocol) {
      case "VLESS":
        return "bg-blue-600 text-white"
      case "VMess":
        return "bg-purple-600 text-white"
      case "Shadowsocks":
        return "bg-orange-600 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  const isSubscriptionActive =
    userData?.subscription?.isActive &&
    userData?.subscription?.expiresAt &&
    new Date(userData.subscription.expiresAt) > new Date()

  if (!isSubscriptionActive) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-mono font-bold text-green-400 mb-2">VPN Keys</h1>
          <p className="text-green-300/80">Access your VPN configuration keys</p>
        </div>

        <Card className="bg-slate-900/50 border-green-900/30">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-400 mb-2">No Active Subscription</h3>
            <p className="text-green-300/80 mb-6">You need an active subscription to access VPN keys.</p>
            <Link href="/dashboard/order">
              <Button className="bg-green-600 hover:bg-green-700 text-black font-semibold">
                Purchase Subscription
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const keys = userData?.keys || []

  const groupedByLocation = keys.reduce(
    (acc, key) => {
      if (!acc[key.location]) {
        acc[key.location] = []
      }
      acc[key.location].push(key)
      return acc
    },
    {} as Record<string, VPNKey[]>,
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold text-green-400 mb-2">VPN Keys</h1>
          <p className="text-green-300/80">Your VPN configuration keys for all supported protocols</p>
        </div>
        <Button
          onClick={fetchKeys}
          disabled={isLoading}
          variant="outline"
          className="border-green-700 text-green-400 hover:bg-green-900/20 bg-transparent"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Keys
        </Button>
      </div>

      {/* Protocol Info */}
      <Card className="bg-slate-900/50 border-green-900/30">
        <CardHeader>
          <CardTitle className="text-green-400">Supported Protocols</CardTitle>
          <CardDescription className="text-green-300/80">
            OpenNet supports multiple VPN protocols for maximum compatibility
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-green-900/20">
              <Badge className="bg-blue-600 text-white mb-2">VLESS</Badge>
              <p className="text-green-300/80 text-sm">Modern, lightweight protocol with excellent performance</p>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-green-900/20">
              <Badge className="bg-purple-600 text-white mb-2">VMess</Badge>
              <p className="text-green-300/80 text-sm">Versatile protocol with advanced features and encryption</p>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-green-900/20">
              <Badge className="bg-orange-600 text-white mb-2">Shadowsocks</Badge>
              <p className="text-green-300/80 text-sm">
                Fast and secure proxy protocol, great for bypassing censorship
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {keys.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(groupedByLocation).map(([location, locationKeys]) => (
            <Card
              key={location}
              className="bg-slate-900/50 border-green-900/30 hover:border-green-700/50 transition-all"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-green-400" />
                    <CardTitle className="text-green-400 text-lg">{location}</CardTitle>
                  </div>
                  <Badge className="bg-green-600 text-black">Active</Badge>
                </div>
              </CardHeader>
              <CardDescription className="text-green-300/80">
                {locationKeys.length} protocol{locationKeys.length !== 1 ? "s" : ""} available
              </CardDescription>
              <CardContent className="space-y-4">
                {locationKeys.map((key) => (
                  <div key={key.id} className="space-y-2 p-3 bg-slate-800/50 rounded-lg border border-green-900/20">
                    <div className="flex items-center justify-between">
                      <Badge className={getProtocolColor(key.type)}>{key.type}</Badge>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleKeyVisibility(key.id)}
                          className="text-green-400 hover:bg-green-900/20 h-7 w-7 p-0"
                        >
                          {visibleKeys.has(key.id) ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(key.config, key.id)}
                          className="text-green-400 hover:bg-green-900/20 h-7 w-7 p-0"
                        >
                          {copied === key.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadKey(key)}
                          className="text-green-400 hover:bg-green-900/20 h-7 w-7 p-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <Input
                      value={visibleKeys.has(key.id) ? key.config : "•".repeat(40)}
                      readOnly
                      className="bg-slate-800 border-green-900/30 text-green-400 font-mono text-xs h-8"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-slate-900/50 border-green-900/30">
          <CardContent className="p-8 text-center">
            <Key className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-400 mb-2">No Keys Available</h3>
            <p className="text-green-300/80 mb-6">
              {isLoading ? "Loading your VPN keys..." : "Click refresh to load your VPN keys."}
            </p>
            {!isLoading && (
              <Button onClick={fetchKeys} className="bg-green-600 hover:bg-green-700 text-black font-semibold">
                <RefreshCw className="w-4 h-4 mr-2" />
                Load Keys
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Usage Instructions */}
      <Card className="bg-slate-900/50 border-green-900/30">
        <CardHeader>
          <CardTitle className="text-green-400">How to Use Your Keys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-green-300/80">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-600 text-black rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
              1
            </div>
            <div>
              <p className="font-semibold text-green-400">Copy or Download</p>
              <p>Copy the configuration key or download it as a file for your VPN client.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-600 text-black rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
              2
            </div>
            <div>
              <p className="font-semibold text-green-400">Import to VPN Client</p>
              <p>Import the configuration into your preferred VPN client (v2rayN, Clash, Shadowrocket, etc.).</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-600 text-black rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
              3
            </div>
            <div>
              <p className="font-semibold text-green-400">Connect</p>
              <p>Select the server and connect to start using your secure VPN connection.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
