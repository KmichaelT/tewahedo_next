"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, Trash2 } from "lucide-react"

export function AdminQuestions() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: questions, isLoading } = useQuery({
    queryKey: ["admin-questions"],
    queryFn: async () => {
      const response = await fetch("/api/admin/questions")
      if (!response.ok) throw new Error("Failed to fetch questions")
      return response.json()
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      // Fixed: Use the correct admin endpoint
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error("Failed to update question")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] })
      toast({ title: "Question updated successfully" })
    },
    onError: (error) => {
      console.error("Update error:", error)
      toast({ 
        title: "Failed to update question", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      })
    },
  })

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete question")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] })
      toast({ title: "Question deleted successfully" })
    },
    onError: (error) => {
      console.error("Delete error:", error)
      toast({ 
        title: "Failed to delete question", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      })
    },
  })

  if (isLoading) {
    return <div>Loading questions...</div>
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "published":
        return "default"
      case "pending":
        return "secondary"
      case "rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Questions</h1>
        <p className="text-gray-600">Review and moderate forum questions</p>
      </div>

      <div className="space-y-4">
        {questions?.map((question: any) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{question.title}</CardTitle>
                <Badge variant={getStatusBadgeVariant(question.status)}>
                  {question.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {question.content.replace(/<[^>]*>/g, "")}
              </p>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  By {question.author || "Unknown"} • {question.answerCount} answers • {question.commentCount} comments
                </div>

                <div className="flex items-center space-x-2">
                  {question.status !== "published" && (
                    <Button
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({ id: question.id, status: "published" })}
                      disabled={updateStatusMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Publish
                    </Button>
                  )}

                  {question.status !== "rejected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatusMutation.mutate({ id: question.id, status: "rejected" })}
                      disabled={updateStatusMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this question? This will also delete all answers and comments.")) {
                        deleteQuestionMutation.mutate(question.id)
                      }
                    }}
                    disabled={deleteQuestionMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {questions?.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No questions to review</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}