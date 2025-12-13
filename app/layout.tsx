import type React from "react"
import type { Metadata } from "next"
import { Inter, Space_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
})

export const metadata: Metadata = {
  title: "OpenNet VPN - Anonymous & Secure VPN Service",
  description:
    "OpenNet VPN provides maximum anonymity and security. No logs, no tracking, just privacy. Access blocked content and bypass censorship.",
  generator: "v0.app",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  other: {
    heleket: "f924bad3",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} ${spaceMono.variable}`}>
        <Suspense
          fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full"></div>
            </div>
          }
        >
          {children}
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
