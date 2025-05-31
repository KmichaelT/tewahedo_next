"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Home, MessageSquare, Users } from "lucide-react"

const adminSections = [
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Overview of platform statistics and recent activity",
    icon: Home,
    href: "/admin",
  },
  {
    id: "questions",
    title: "Questions", 
    description: "Manage questions, provide answers, and moderate content",
    icon: MessageSquare,
    href: "/admin/questions",
  },
  {
    id: "users",
    title: "Users",
    description: "Manage user permissions and admin privileges", 
    icon: Users,
    href: "/admin/users",
  },
]

export function AdminNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  
  // Determine active tab based on current path
  const getActiveTab = () => {
    if (pathname === "/admin") return "dashboard"
    if (pathname === "/admin/questions") return "questions"
    if (pathname === "/admin/users") return "users"
    return "dashboard"
  }

  const activeTab = getActiveTab()
  const activeSection = adminSections.find(section => section.id === activeTab)

  const handleTabChange = (value: string) => {
    const section = adminSections.find(s => s.id === value)
    if (section) {
      router.push(section.href)
    }
  }

  return (
    <div className=" bg-gray-50">

      {/* Tab Navigation Header */}
      <section className="py-8">
        <div className="flex flex-col items-center lg:px-16">
          <div className="container flex flex-col items-center">
            <h2 className="mb-3 text-center text-2xl font-semibold md:mb-4 md:text-3xl lg:mb-6 lg:max-w-3xl">
              Platform Administration
            </h2>
            <p className="text-center text-gray-600 mb-8 max-w-2xl">
              Manage your Tewahedo Answers community with comprehensive tools for content moderation, user management, and platform oversight.
            </p>
          </div>
          
          <div className="w-full text-center">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <div className="relative">
                <div className="container mb-6 hidden min-w-fit flex-col items-center md:flex lg:mb-8 lg:max-w-5xl">
                  <TabsList className="gap-x-2">
                    {adminSections.map((section) => {
                      const Icon = section.icon
                      return (
                        <TabsTrigger key={section.id} value={section.id} className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span>{section.title}</span>
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>
                </div>
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-background)_0%,transparent_10%,transparent_90%,var(--color-background)_100%)] md:hidden" />
              </div>
              
              {/* Mobile Navigation Dots */}
              <div className="flex justify-center py-3 md:hidden">
                {adminSections.map((section) => (
                  <Button
                    key={section.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTabChange(section.id)}
                  >
                    <div
                      className={`size-2 rounded-full ${
                        section.id === activeTab ? "bg-primary" : "bg-input"
                      }`}
                    />
                  </Button>
                ))}
              </div>
            </Tabs>
          </div>

          {/* Active Section Header */}
          {activeSection && (
            <div className="container w-full lg:max-w-6xl">
              <div className="mb-6 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <activeSection.icon className="h-6 w-6 text-orange-600" />
                  <h3 className="text-xl font-semibold text-gray-900">{activeSection.title}</h3>
                </div>
                <p className="text-gray-600 max-w-2xl mx-auto">{activeSection.description}</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}