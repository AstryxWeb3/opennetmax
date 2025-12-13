import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { order_id } = body

    if (!process.env.HELEKET_MERCHANT_ID || !process.env.HELEKET_API_KEY) {
      return NextResponse.json({ error: "Payment system not configured" }, { status: 500 })
    }

    // Generate signature for empty body
    const base64Body = Buffer.from("{}").toString("base64")
    const sign = require("crypto")
      .createHash("md5")
      .update(base64Body + process.env.HELEKET_API_KEY)
      .digest("hex")

    // Get payment information from Heleket
    const response = await fetch(`https://api.heleket.com/v1/payment/${order_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        merchant: process.env.HELEKET_MERCHANT_ID,
        sign: sign,
      },
      body: "{}",
    })

    if (!response.ok) {
      return NextResponse.json({ paid: false }, { status: 200 })
    }

    const paymentData = await response.json()

    return NextResponse.json({
      paid: paymentData.payment_status === "paid",
      status: paymentData.payment_status,
      amount: paymentData.payment_amount,
      currency: paymentData.payer_currency,
    })
  } catch (error) {
    console.error("[v0] Error checking payment:", error)
    return NextResponse.json({ paid: false }, { status: 200 })
  }
}
