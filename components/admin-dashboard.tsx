"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Users, CheckCircle, Clock } from "lucide-react"

export function AdminDashboard() {
  const { data: questions } = useQuery({
    queryKey: ["admin-questions"],
    queryFn: async () => {
      const response = await fetch("/api/admin/questions")
      if (!response.ok) throw new Error("Failed to fetch questions")
      return response.json()
    },
  })

  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users")
      if (!response.ok) throw new Error("Failed to fetch users")
      return response.json()
    },
  })

  const stats = {
    totalQuestions: questions?.length || 0,
    publishedQuestions: questions?.filter((q: any) => q.status === "published").length || 0,
    pendingQuestions: questions?.filter((q: any) => q.status === "pending").length || 0,
    totalUsers: users?.length || 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your forum content and users</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuestions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedQuestions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingQuestions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Questions</CardTitle>
            <CardDescription>Latest questions submitted to the forum</CardDescription>
          </CardHeader>
          <CardContent>
            {questions?.slice(0, 5).map((question: any) => (
              <div key={question.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex-1">
                  <p className="font-medium truncate">{question.title}</p>
                  <p className="text-sm text-gray-500">by {question.author}</p>
                </div>
                <div className="text-sm text-gray-500">{question.status}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Newest members of the community</CardDescription>
          </CardHeader>
          <CardContent>
            {users?.slice(0, 5).map((user: any) => (
              <div key={user.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex-1">
                  <p className="font-medium">{user.displayName}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="text-sm text-gray-500">{user.isAdmin ? "Admin" : "User"}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
