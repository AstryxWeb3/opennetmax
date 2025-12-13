import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const body = JSON.parse(rawBody)

    console.log("[v0] Heleket webhook received:", body)

    const receivedSign = body.sign

    // Remove sign from body for verification
    const bodyWithoutSign = { ...body }
    delete bodyWithoutSign.sign

    // Escape slashes in JSON as per Heleket documentation
    const jsonBody = JSON.stringify(bodyWithoutSign, null, 0).replace(/\//g, "\\/")
    const base64Body = Buffer.from(jsonBody).toString("base64")
    const expectedSign = crypto
      .createHash("md5")
      .update(base64Body + process.env.HELEKET_API_KEY)
      .digest("hex")

    console.log("[v0] Received sign:", receivedSign)
    console.log("[v0] Expected sign:", expectedSign)

    if (receivedSign !== expectedSign) {
      console.error("[v0] Invalid webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    let additionalData
    try {
      additionalData =
        typeof body.additional_data === "string" ? JSON.parse(body.additional_data) : body.additional_data || {}
    } catch {
      additionalData = {}
    }

    const { user_id, period } = additionalData

    console.log("[v0] Webhook data:", {
      status: body.status,
      order_id: body.order_id,
      user_id,
      period,
      amount: body.payment_amount,
      currency: body.payer_currency,
      is_final: body.is_final,
    })

    if (body.status === "paid" || body.status === "paid_over") {
      console.log("[v0] Payment confirmed for user:", user_id)

      // TODO: Update database with subscription activation
      // For now, we just log the successful payment
      // In production, you would:
      // 1. Update user subscription in database
      // 2. Set expiration date based on period
      // 3. Generate VPN keys if needed
      // 4. Send confirmation email
    } else if (body.status === "cancel" || body.status === "fail") {
      console.log("[v0] Payment cancelled or failed:", body.order_id)
    }

    // Return success to acknowledge webhook
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error processing webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
