"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Home, RefreshCw } from "lucide-react"
import Link from "next/link"

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification token has expired or has already been used.",
  Default: "An error occurred during authentication.",
  Signin: "Try signing in with a different account.",
  OAuthSignin: "Try signing in with a different account.",
  OAuthCallback: "Try signing in with a different account.",
  OAuthCreateAccount: "Try signing in with a different account.",
  EmailCreateAccount: "Try signing in with a different account.",
  Callback: "Try signing in with a different account.",
  OAuthAccountNotLinked: "To confirm your identity, sign in with the same account you used originally.",
  EmailSignin: "The e-mail could not be sent.",
  CredentialsSignin: "Sign in failed. Check the details you provided are correct.",
  SessionRequired: "Please sign in to access this page.",
}

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  console.log("🚨 Auth error page loaded with error:", error)

  const errorMessage = error && errorMessages[error] ? errorMessages[error] : errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Authentication Error</CardTitle>
          <CardDescription className="text-center">
            {errorMessage}
            {error && <div className="mt-2 text-xs text-gray-500">Error code: {error}</div>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/signin">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
