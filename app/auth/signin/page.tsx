"use client"

import { signIn, getProviders } from "next-auth/react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chrome, AlertCircle } from "lucide-react"

export default function SignIn() {
  const [loading, setLoading] = useState(false)
  const [providers, setProviders] = useState<any>(null)
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const res = await getProviders()
        console.log("🔍 Available providers:", res)
        setProviders(res)
      } catch (error) {
        console.error("❌ Failed to load providers:", error)
      }
    }
    loadProviders()
  }, [])

  const handleSignIn = async () => {
    setLoading(true)
    console.log("🚀 Attempting sign in with Google...")

    try {
      const result = await signIn("google", {
        callbackUrl,
        redirect: false,
      })

      console.log("📝 Sign in result:", result)

      if (result?.error) {
        console.error("❌ Sign in error:", result.error)
      } else if (result?.url) {
        console.log("✅ Sign in successful, redirecting to:", result.url)
        if (typeof window !== 'undefined') {
          window.location.href = result.url
        }
      }
    } catch (error) {
      console.error("❌ Sign in exception:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Welcome to Tewahedo Answers
          </CardTitle>
          <CardDescription>Sign in to ask questions and participate in our community</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Authentication failed: {error}</span>
            </div>
          )}
{/* 
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <strong>Debug Info:</strong>
              <br />
              Providers loaded: {providers ? "Yes" : "No"}
              <br />
              Callback URL: {callbackUrl}
              <br />
              Error: {error || "None"}
            </p>
          </div> */}

          <Button
            onClick={handleSignIn}
            disabled={loading || !providers}
            className="w-full bg-orange-600 hover:bg-orange-700 flex items-center justify-center gap-2"
          >
            <Chrome className="h-5 w-5" />
            {loading ? "Signing in..." : "Sign in with Google"}
          </Button>

          {!providers && <p className="text-sm text-gray-500 text-center">Loading authentication providers...</p>}
        </CardContent>
      </Card>
    </div>
  )
}
