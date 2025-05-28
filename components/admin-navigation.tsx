"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, MessageSquare, Users } from "lucide-react"

export function AdminNavigation() {
  const pathname = usePathname()

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Questions", href: "/admin/questions", icon: MessageSquare },
    { name: "Users", href: "/admin/users", icon: Users },
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/admin" className="text-xl font-bold text-primary">
              Admin Dashboard
            </Link>

            <div className="hidden sm:flex sm:space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link key={item.name} href={item.href}>
                    <Button variant={isActive ? "default" : "ghost"} className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center">
            <Link href="/">
              <Button variant="outline">Back to Site</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
