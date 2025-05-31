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
        
        <main className="container w-full lg:max-w-6xl mx-auto px-4 pb-8">
          <div className="rounded-lg shadow-sm border min-h-[calc(100vh-25rem)]">
            <div className="p-6 sm:p-8">
              <AdminNavigation />
              {children}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}