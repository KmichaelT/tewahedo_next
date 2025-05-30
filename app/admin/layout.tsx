import type React from "react"
import { AuthGuard } from "@/components/auth-guard"
import { AdminNavigation } from "@/components/admin-navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requireAdmin>
      <div className="min-h-screen bg-gray-50">
        <AdminNavigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border min-h-[calc(100vh-12rem)]">
            <div className="p-6 sm:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}