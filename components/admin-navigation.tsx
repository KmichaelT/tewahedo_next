"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, MessageSquare, Users, ArrowLeft } from "lucide-react"

export function AdminNavigation() {
  const pathname = usePathname()

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (pathname === "/admin") return "dashboard"
    if (pathname === "/admin/questions") return "questions"
    if (pathname === "/admin/users") return "users"
    return "dashboard"
  }

  const navItems = [
    { 
      id: "dashboard", 
      name: "Dashboard", 
      href: "/admin", 
      icon: Home,
      description: "Overview & Stats"
    },
    { 
      id: "questions", 
      name: "Questions", 
      href: "/admin/questions", 
      icon: MessageSquare,
      description: "Manage Q&A"
    },
    { 
      id: "users", 
      name: "Users", 
      href: "/admin/users", 
      icon: Users,
      description: "User Management"
    },
  ]

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with title and back button */}
        <div className="flex items-center justify-between h-16 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
              Admin Dashboard
            </h1>
            <h1 className="text-lg font-bold text-gray-900 sm:hidden">
              Admin
            </h1>
          </div>

          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Site</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
        </div>

        {/* Tabs Navigation */}
        <div className="py-4">
          <Tabs value={getActiveTab()} className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex lg:h-auto lg:p-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.id} href={item.href} className="w-full lg:w-auto">
                    <TabsTrigger 
                      value={item.id}
                      className="w-full lg:w-auto flex items-center justify-center lg:justify-start space-x-2 px-3 py-2 lg:px-4 lg:py-3 text-sm font-medium transition-all duration-200 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 data-[state=active]:border-orange-200"
                    >
                      <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
                      <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-2">
                        <span className="text-xs lg:text-sm font-medium">
                          {item.name}
                        </span>
                        <span className="hidden xl:block text-xs text-gray-500">
                          {item.description}
                        </span>
                      </div>
                    </TabsTrigger>
                  </Link>
                )
              })}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Mobile-optimized bottom border with active indicator */}
      <div className="block sm:hidden">
        <div className="relative">
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200"></div>
          <div 
            className="absolute bottom-0 h-0.5 bg-orange-500 transition-all duration-300 ease-in-out"
            style={{
              width: '33.333%',
              left: getActiveTab() === 'dashboard' ? '0%' : 
                    getActiveTab() === 'questions' ? '33.333%' : '66.666%'
            }}
          ></div>
        </div>
      </div>
    </nav>
  )
}