"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Users, CheckCircle, Clock, TrendingUp, Eye } from "lucide-react"

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
    adminUsers: users?.filter((u: any) => u.isAdmin).length || 0,
    regularUsers: users?.filter((u: any) => !u.isAdmin).length || 0,
  }

  const recentQuestions = questions?.slice(0, 5) || []
  const recentUsers = users?.slice(0, 5) || []

  return (
    <div className="space-y-8">
 

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Questions</CardTitle>
            <MessageSquare className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">{stats.totalQuestions}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">{stats.publishedQuestions}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalQuestions > 0 ? Math.round((stats.publishedQuestions / stats.totalQuestions) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">{stats.pendingQuestions}</div>
            <p className="text-xs text-gray-500 mt-1">Needs attention</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</div>
            <p className="text-xs text-gray-500 mt-1">Community members</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Admins</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">{stats.adminUsers}</div>
            <p className="text-xs text-gray-500 mt-1">Admin users</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Regular Users</CardTitle>
            <Eye className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">{stats.regularUsers}</div>
            <p className="text-xs text-gray-500 mt-1">Community members</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-gray-600" />
              <span>Recent Questions</span>
            </CardTitle>
            <CardDescription>Latest questions submitted to the forum</CardDescription>
          </CardHeader>
          <CardContent>
            {recentQuestions.length > 0 ? (
              <div className="space-y-3">
                {recentQuestions.map((question: any) => (
                  <div key={question.id} className="flex items-start justify-between p-3 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate text-sm">{question.title}</p>
                      <p className="text-sm text-gray-500">by {question.author || "Unknown"}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(question.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        question.status === 'published' 
                          ? 'bg-gray-100 text-gray-700 border border-gray-200'
                          : question.status === 'pending'
                          ? 'bg-gray-50 text-gray-600 border border-gray-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {question.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6 text-sm">No questions yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-gray-600" />
              <span>Recent Users</span>
            </CardTitle>
            <CardDescription>Newest members of the community</CardDescription>
          </CardHeader>
          <CardContent>
            {recentUsers.length > 0 ? (
              <div className="space-y-3">
                {recentUsers.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                        <span className="text-gray-600 text-sm font-medium">
                          {(user.displayName || user.name || user.email)?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{user.displayName || user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.isAdmin 
                          ? 'bg-gray-100 text-gray-700 border border-gray-200'
                          : 'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}>
                        {user.isAdmin ? "Admin" : "User"}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6 text-sm">No users yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}