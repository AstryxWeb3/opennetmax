"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCurrentUser, updateUserData } from "@/lib/auth"
import { Check, Copy, CreditCard, Clock, AlertCircle, CheckCircle, XCircle, ExternalLink, QrCode } from "lucide-react"
import { useRouter } from "next/navigation"

interface PaymentResponse {
  payment_id: string
  amount: number
  address: string
}

interface Plan {
  period: number
  price: number
  popular?: boolean
  savings?: string
}

interface Notification {
  type: "success" | "error" | "info"
  message: string
}

interface InvoiceData {
  uuid: string
  order_id: string
  amount: string
  payer_amount: string
  currency: string
  payer_currency: string
  address: string
  network: string
  payment_url: string
  expired_at: number
  qr_code: string
}

const plans: Plan[] = [
  { period: 1, price: 5 },
  { period: 2, price: 8, popular: true, savings: "Save $2" },
  { period: 12, price: 35, savings: "Save $25" },
]

export default function OrderPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan>(plans[1])
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [notification, setNotification] = useState<Notification | null>(null)
  const user = getCurrentUser()
  const router = useRouter()

  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const createPayment = async () => {
    if (!user) return

    setIsLoading(true)
    setNotification(null)

    try {
      const orderId = `opennet_${user.id}_${Date.now()}`

      const response = await fetch("/api/heleket/create-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: selectedPlan.price,
          currency: "USD",
          order_id: orderId,
          user_id: user.id,
          period: selectedPlan.period,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setInvoiceData(data.invoice)
          showNotification(
            "success",
            "Invoice created! You can pay with any supported cryptocurrency. Click 'Open Payment Page' for more options.",
          )
        } else {
          showNotification("error", "Failed to create invoice. Please try again.")
        }
      } else {
        showNotification("error", "Failed to create invoice. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Error creating invoice:", error)
      showNotification("error", "Failed to create invoice. Please try again.")
    }
    setIsLoading(false)
  }

  const checkPayment = async () => {
    if (!invoiceData || !user) return

    setIsChecking(true)
    setNotification(null)

    try {
      const response = await fetch("/api/heleket/check-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: invoiceData.order_id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.paid) {
          const expiresAt = new Date()
          expiresAt.setMonth(expiresAt.getMonth() + selectedPlan.period)

          updateUserData(user.id, {
            subscription: {
              plan: `${selectedPlan.period} month${selectedPlan.period > 1 ? "s" : ""}`,
              expiresAt: expiresAt.toISOString(),
              isActive: true,
            },
          })

          showNotification("success", "Payment verified! Subscription activated successfully.")
          setTimeout(() => router.push("/dashboard"), 2000)
        } else {
          showNotification("error", "Payment not yet confirmed. Please wait and try again.")
        }
      } else {
        showNotification("error", "Failed to check payment status. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Error checking payment:", error)
      showNotification("error", "Failed to check payment status. Please try again.")
    }
    setIsChecking(false)
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-mono font-bold text-green-400 mb-2">Order Subscription</h1>
        <p className="text-green-300/80">Choose your plan and pay with SOL</p>
      </div>

      {notification && (
        <Card
          className={`${
            notification.type === "success"
              ? "bg-green-900/20 border-green-700/30"
              : notification.type === "error"
                ? "bg-red-900/20 border-red-700/30"
                : "bg-blue-900/20 border-blue-700/30"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {notification.type === "success" && <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />}
              {notification.type === "error" && <XCircle className="w-5 h-5 text-red-400 mt-0.5" />}
              {notification.type === "info" && <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />}
              <div>
                <p
                  className={`font-semibold text-sm ${
                    notification.type === "success"
                      ? "text-green-400"
                      : notification.type === "error"
                        ? "text-red-400"
                        : "text-blue-400"
                  }`}
                >
                  {notification.type === "success" ? "Success" : notification.type === "error" ? "Error" : "Info"}
                </p>
                <p
                  className={`text-sm ${
                    notification.type === "success"
                      ? "text-green-300/80"
                      : notification.type === "error"
                        ? "text-red-300/80"
                        : "text-blue-300/80"
                  }`}
                >
                  {notification.message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!invoiceData ? (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <Card
                key={plan.period}
                className={`cursor-pointer transition-all ${
                  selectedPlan.period === plan.period
                    ? "bg-green-900/30 border-green-600"
                    : "bg-slate-900/50 border-green-900/30 hover:border-green-700/50"
                }`}
                onClick={() => setSelectedPlan(plan)}
              >
                <CardHeader className="text-center">
                  {plan.popular && (
                    <Badge className="bg-green-600 text-black hover:bg-green-700 w-fit mx-auto mb-2">Popular</Badge>
                  )}
                  <CardTitle className="text-green-400">
                    {plan.period} Month{plan.period > 1 ? "s" : ""}
                  </CardTitle>
                  <div className="text-3xl font-bold text-green-400">${plan.price}</div>
                  {plan.savings && <p className="text-green-300/80 text-sm">{plan.savings}</p>}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-green-300/80">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span>All VPN protocols</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span>Up to 5 devices</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span>No logs policy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span>24/7 support</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-slate-900/50 border-green-900/30">
            <CardHeader>
              <CardTitle className="text-green-400">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-green-300">
                    OpenNet VPN - {selectedPlan.period} month{selectedPlan.period > 1 ? "s" : ""}
                  </span>
                  <span className="text-green-400 font-semibold">${selectedPlan.price}</span>
                </div>
                <div className="border-t border-green-900/30 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-green-300">Total</span>
                    <span className="text-green-400">${selectedPlan.price}</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={createPayment}
                disabled={isLoading}
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-black font-semibold"
              >
                {isLoading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Creating Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Proceed to Payment
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="space-y-6">
          <Card className="bg-slate-900/50 border-green-900/30">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Details
              </CardTitle>
              <CardDescription className="text-green-300/80">
                Pay with cryptocurrency - Multiple options available
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-green-400">Order ID</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={invoiceData.order_id}
                    readOnly
                    className="bg-slate-800 border-green-900/30 text-green-400 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(invoiceData.order_id, "order_id")}
                    className="border-green-700 text-green-400 hover:bg-green-900/20 bg-transparent"
                  >
                    {copied === "order_id" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {invoiceData.address && (
                <>
                  <div className="space-y-2">
                    <Label className="text-green-400">
                      Payment Address ({invoiceData.payer_currency} - {invoiceData.network})
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={invoiceData.address}
                        readOnly
                        className="bg-slate-800 border-green-900/30 text-green-400 font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(invoiceData.address, "address")}
                        className="border-green-700 text-green-400 hover:bg-green-900/20 bg-transparent"
                      >
                        {copied === "address" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-green-400">Amount to Pay</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={`${invoiceData.payer_amount} ${invoiceData.payer_currency}`}
                        readOnly
                        className="bg-slate-800 border-green-900/30 text-green-400 font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(invoiceData.payer_amount, "amount")}
                        className="border-green-700 text-green-400 hover:bg-green-900/20 bg-transparent"
                      >
                        {copied === "amount" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => window.open(invoiceData.payment_url, "_blank")}
                  variant="outline"
                  className="flex-1 border-green-700 text-green-400 hover:bg-green-900/20 bg-transparent"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Payment Page
                </Button>
                {invoiceData.qr_code && (
                  <Button
                    onClick={() => window.open(invoiceData.qr_code, "_blank")}
                    variant="outline"
                    className="border-green-700 text-green-400 hover:bg-green-900/20 bg-transparent"
                  >
                    <QrCode className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/20 border-blue-700/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-blue-400 font-semibold text-sm">Multiple Payment Options</p>
                  <p className="text-blue-300/80 text-sm">
                    Heleket accepts 33+ cryptocurrencies including BTC, ETH, USDT, SOL, XMR, DASH and more. Choose your
                    preferred currency on the payment page.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={checkPayment}
            disabled={isChecking}
            className="w-full bg-green-600 hover:bg-green-700 text-black font-semibold"
          >
            {isChecking ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Checking Payment...
              </>
            ) : (
              "Check Payment Status"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
