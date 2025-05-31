"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, User, Settings, LogOut, Shield, AlertCircle } from "lucide-react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Use useSession hook properly at the top level
  const { data: session, status } = useSession()

  const handleSignIn = async () => {
    try {
      setAuthError(null)
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: window.location.href,
      })

      if (result?.error) {
        console.error("Sign in error:", result.error)
        setAuthError("Sign in failed")
      }
    } catch (error) {
      console.error("Sign in error:", error)
      setAuthError("Authentication unavailable")
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut({
        redirect: false,
        callbackUrl: "/",
      })
    } catch (error) {
      console.error("Sign out error:", error)
      window.location.href = "/"
    }
  }

  return (
    <nav className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <img 
                src="/ta_logo.svg" 
                alt="Tewahedo Answers" 
                className="h-10 w-auto" 
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium">
              Home
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium">
              About
            </Link>
            {session && (
              <Link href="/ask" className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium">
                Ask Question
              </Link>
            )}

            {/* Auth Section */}
            {authError ? (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Auth Error</span>
              </div>
            ) : status === "loading" ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                      <AvatarFallback>
                        {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {session.user.name && <p className="font-medium">{session.user.name}</p>}
                      {session.user.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">{session.user.email}</p>
                      )}
                      {session.user.isAdmin && <p className="text-xs text-orange-600 font-medium">Administrator</p>}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {/* <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem> */}
                  {session.user.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {/* <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onSelect={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleSignIn} className="bg-orange-600 hover:bg-orange-700">
                Sign In with Google
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-orange-600 focus:outline-none focus:text-orange-600"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              <Link
                href="/"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              {session && (
                <Link
                  href="/ask"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600"
                  onClick={() => setIsOpen(false)}
                >
                  Ask Question
                </Link>
              )}
              {session?.user?.isAdmin && (
                <Link
                  href="/admin"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600"
                  onClick={() => setIsOpen(false)}
                >
                  Admin
                </Link>
              )}
              <div className="pt-4 pb-3 border-t border-gray-200">
                {authError ? (
                  <div className="px-3 py-2 text-red-600 text-sm">Authentication Error</div>
                ) : session ? (
                  <div className="space-y-1">
                    <div className="px-3 py-2">
                      <div className="text-base font-medium text-gray-800">{session.user.name}</div>
                      <div className="text-sm font-medium text-gray-500">{session.user.email}</div>
                      {session.user.isAdmin && <div className="text-xs text-orange-600 font-medium">Administrator</div>}
                    </div>
                    <Button
                      onClick={handleSignOut}
                      variant="ghost"
                      className="w-full justify-start px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600"
                    >
                      Sign out
                    </Button>
                  </div>
                ) : (
                  <div className="px-3 py-2">
                    <Button onClick={handleSignIn} className="w-full bg-orange-600 hover:bg-orange-700">
                      Sign In
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
