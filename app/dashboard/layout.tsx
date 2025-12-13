import type React from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 text-green-400">
        <Sidebar />
        <div className="lg:pl-64">
          <main className="p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
