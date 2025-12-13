import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency, order_id, user_id, period } = body

    console.log("[v0] Creating Heleket invoice:", { amount, currency, order_id })

    if (!process.env.HELEKET_MERCHANT_ID || !process.env.HELEKET_API_KEY) {
      console.error("[v0] Missing Heleket credentials")
      return NextResponse.json({ error: "Payment system not configured" }, { status: 500 })
    }

    const requestData = {
      amount: amount.toString(),
      currency: currency || "USD",
      order_id: order_id,
      url_callback: `${process.env.NEXT_PUBLIC_APP_URL || "https://opennetvpn.com"}/api/heleket/webhook`,
      url_success: `${process.env.NEXT_PUBLIC_APP_URL || "https://opennetvpn.com"}/dashboard`,
      url_return: `${process.env.NEXT_PUBLIC_APP_URL || "https://opennetvpn.com"}/dashboard/order`,
      additional_data: JSON.stringify({ user_id, period }),
      lifetime: 3600,
    }

    const requestBody = JSON.stringify(requestData).replace(/\//g, "\\/")
    console.log("[v0] Request body:", requestBody)

    const base64Body = Buffer.from(requestBody).toString("base64")
    const sign = crypto
      .createHash("md5")
      .update(base64Body + process.env.HELEKET_API_KEY)
      .digest("hex")

    console.log("[v0] Calling Heleket API with merchant:", process.env.HELEKET_MERCHANT_ID)

    const response = await fetch("https://api.heleket.com/v1/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        merchant: process.env.HELEKET_MERCHANT_ID,
        sign: sign,
      },
      body: requestBody,
    })

    const responseText = await response.text()
    console.log("[v0] Heleket API response status:", response.status)

    if (!response.ok) {
      console.error("[v0] Heleket API error:", responseText)
      return NextResponse.json(
        { error: "Failed to create invoice", details: responseText },
        { status: response.status },
      )
    }

    const responseData = JSON.parse(responseText)
    console.log("[v0] Heleket API full response:", JSON.stringify(responseData, null, 2))

    const invoiceData = responseData.result

    if (!invoiceData || !invoiceData.url) {
      console.error("[v0] Invalid invoice response:", responseData)
      return NextResponse.json({ error: "Invalid response from payment gateway" }, { status: 500 })
    }

    console.log("[v0] Invoice created successfully, UUID:", invoiceData.uuid)
    console.log("[v0] Payment URL:", invoiceData.url)

    return NextResponse.json({
      success: true,
      invoice: {
        uuid: invoiceData.uuid,
        order_id: invoiceData.order_id,
        amount: invoiceData.amount,
        currency: invoiceData.currency,
        payment_url: invoiceData.url,
        expired_at: invoiceData.expired_at,
      },
    })
  } catch (error) {
    console.error("[v0] Error creating Heleket invoice:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
