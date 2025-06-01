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
              {children}
            
      </div>
    </AuthGuard>
  )
}