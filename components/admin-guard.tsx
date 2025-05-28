"use client"

import type React from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    if (!session.user?.isAdmin) {
      router.push("/")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-64 mb-6" />
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!session || !session.user?.isAdmin) {
    return null
  }

  return <>{children}</>
}
