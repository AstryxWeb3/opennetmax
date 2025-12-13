import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id } = body

    if (!user_id) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 })
    }

    console.log("[v0] API Route: Fetching keys for user:", user_id)

    // Make the request to the external API from the server side
    const response = await fetch("https://api.opennetvpn.com/keys", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id }),
    })

    console.log("[v0] API Route: External API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] API Route: External API error:", errorText)
      return NextResponse.json({ error: "Failed to fetch keys from external API" }, { status: response.status })
    }

    const data = await response.json()
    console.log("[v0] API Route: Received keys count:", Array.isArray(data) ? data.length : 0)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] API Route: Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
