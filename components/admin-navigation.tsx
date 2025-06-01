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
      <section >
        <div className="flex flex-col items-center lg:px-16">

          
          <div className="w-full text-center">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <div className=" mb-6 flex min-w-fit flex-col items-left lg:mb-8  ">
                <TabsList className="gap-x-2 w-full md:w-1/2">
                  {adminSections.map((section) => {
                    const Icon = section.icon
                    return (
                      <TabsTrigger key={section.id} value={section.id} className="flex-1 items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span>{section.title}</span>
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
              </div>
            </Tabs>
          </div>
 
        </div>
      </section>
    </div>
  )
}