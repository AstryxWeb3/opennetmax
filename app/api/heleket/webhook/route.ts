import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"

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

      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error("[v0] Missing Supabase credentials")
        return NextResponse.json({ error: "Database not configured" }, { status: 500 })
      }

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      )

      // Calculate expiration date based on period
      const now = new Date()
      let expiresAt = new Date(now)
      let planName = "1 Month"

      switch (period) {
        case 1:
          expiresAt.setMonth(now.getMonth() + 1)
          planName = "1 Month"
          break
        case 6:
          expiresAt.setMonth(now.getMonth() + 6)
          planName = "6 Months"
          break
        case 12:
          expiresAt.setMonth(now.getMonth() + 12)
          planName = "12 Months"
          break
        default:
          expiresAt.setMonth(now.getMonth() + 1)
      }

      // Create or update subscription
      const { data: subscription, error: subError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: user_id,
          plan: planName,
          expires_at: expiresAt.toISOString(),
          is_active: true,
        })
        .select()
        .single()

      if (subError) {
        console.error("[v0] Error creating subscription:", subError)
        return NextResponse.json({ error: "Failed to activate subscription" }, { status: 500 })
      }

      console.log("[v0] Subscription activated:", subscription.id)
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
