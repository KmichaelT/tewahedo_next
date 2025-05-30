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
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to Admin Dashboard</h1>
        <p className="text-gray-600">Monitor and manage your Tewahedo Answers community</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Questions</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.totalQuestions}</div>
            <p className="text-xs text-blue-600 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.publishedQuestions}</div>
            <p className="text-xs text-green-600 mt-1">
              {stats.totalQuestions > 0 ? Math.round((stats.publishedQuestions / stats.totalQuestions) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{stats.pendingQuestions}</div>
            <p className="text-xs text-yellow-600 mt-1">Needs attention</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Total Users</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats.totalUsers}</div>
            <p className="text-xs text-purple-600 mt-1">Community members</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Admins</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{stats.adminUsers}</div>
            <p className="text-xs text-orange-600 mt-1">Admin users</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-800">Regular Users</CardTitle>
            <Eye className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.regularUsers}</div>
            <p className="text-xs text-gray-600 mt-1">Community members</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <span>Recent Questions</span>
            </CardTitle>
            <CardDescription>Latest questions submitted to the forum</CardDescription>
          </CardHeader>
          <CardContent>
            {recentQuestions.length > 0 ? (
              <div className="space-y-4">
                {recentQuestions.map((question: any) => (
                  <div key={question.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{question.title}</p>
                      <p className="text-sm text-gray-500">by {question.author || "Unknown"}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(question.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        question.status === 'published' 
                          ? 'bg-green-100 text-green-800'
                          : question.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {question.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No questions yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span>Recent Users</span>
            </CardTitle>
            <CardDescription>Newest members of the community</CardDescription>
          </CardHeader>
          <CardContent>
            {recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {(user.displayName || user.name || user.email)?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.displayName || user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isAdmin 
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
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
              <p className="text-gray-500 text-center py-4">No users yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}