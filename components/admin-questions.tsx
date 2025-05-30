"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { RichTextEditor } from "./rich-text-editor"
import { RichTextDisplay } from "./rich-text-display"
import { CheckCircle, Trash2, Edit, MessageSquare, ChevronDown, ChevronRight, User, Calendar, MessageCircleIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface Question {
  id: number
  title: string
  content: string
  authorId: string
  status: "pending" | "published"
  category: string
  votes: number
  createdAt: string
  updatedAt: string
  author: string
  answerCount: number
  commentCount: number
}

interface EditQuestionForm {
  title: string
  content: string
  status: "pending" | "published"
  category: string
  tags: string
}

interface AnswerForm {
  content: string
  category: string
  tags: string
}

export function AdminQuestions() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // State management
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [answeringQuestion, setAnsweringQuestion] = useState<Question | null>(null)
  const [isEditingAnswer, setIsEditingAnswer] = useState(false)
  const [editForm, setEditForm] = useState<EditQuestionForm>({
    title: "",
    content: "",
    status: "pending",
    category: "",
    tags: ""
  })
  const [answerForm, setAnswerForm] = useState<AnswerForm>({
    content: "",
    category: "",
    tags: ""
  })

  // Fetch questions
  const { data: questions, isLoading } = useQuery({
    queryKey: ["admin-questions"],
    queryFn: async () => {
      const response = await fetch("/api/admin/questions")
      if (!response.ok) throw new Error("Failed to fetch questions")
      return response.json() as Promise<Question[]>
    },
  })

  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<EditQuestionForm> }) => {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to update question")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] })
      toast({ title: "Question updated successfully" })
      setEditingQuestion(null)
    },
    onError: (error) => {
      toast({ 
        title: "Failed to update question", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      })
    },
  })

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async ({ questionId, data }: { questionId: number; data: AnswerForm }) => {
      const response = await fetch(`/api/admin/questions/${questionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to submit answer")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] })
      toast({ 
        title: isEditingAnswer ? "Answer updated successfully!" : "Answer submitted and question published!" 
      })
      setAnsweringQuestion(null)
      setAnswerForm({ content: "", category: "", tags: "" })
      setIsEditingAnswer(false)
    },
    onError: (error) => {
      toast({ 
        title: "Failed to submit answer", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      })
    },
  })

  // Delete question mutation
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
      toast({ 
        title: "Failed to delete question", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      })
    },
  })

  // Helper functions
  const toggleQuestionExpansion = (questionId: number) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId)
    } else {
      newExpanded.add(questionId)
    }
    setExpandedQuestions(newExpanded)
  }

  const openEditModal = (question: Question) => {
    setEditingQuestion(question)
    setEditForm({
      title: question.title,
      content: question.content,
      status: question.status,
      category: question.category,
      tags: "" // You might want to fetch tags from the question
    })
  }

  const openAnswerModal = async (question: Question) => {
    setAnsweringQuestion(question)
    
    // Check if question already has an answer
    if (question.answerCount > 0) {
      setIsEditingAnswer(true)
      // Fetch existing answer to populate the form
      try {
        const response = await fetch(`/api/admin/questions/${question.id}/answer`)
        if (response.ok) {
          const answers = await response.json()
          if (answers.length > 0) {
            setAnswerForm({
              content: answers[0].content,
              category: question.category,
              tags: ""
            })
          }
        }
      } catch (error) {
        console.error("Failed to fetch existing answer:", error)
        // Fallback to empty form
        setAnswerForm({
          content: "",
          category: question.category,
          tags: ""
        })
      }
    } else {
      setIsEditingAnswer(false)
      setAnswerForm({
        content: "",
        category: question.category,
        tags: ""
      })
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "published": return "default"
      case "pending": return "secondary"
      default: return "secondary"
    }
  }

  const handleUpdateStatus = (id: number, status: "pending" | "published") => {
    updateQuestionMutation.mutate({ id, data: { status } })
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading questions...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Questions</h1>
        <p className="text-gray-600">Review, edit, answer, and moderate forum questions</p>
      </div>

      <div className="space-y-4">
        {questions?.map((question: Question) => {
          const isExpanded = expandedQuestions.has(question.id)
          
          return (
            <Card key={question.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleQuestionExpansion(question.id)}
                        className="h-auto p-1"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <CardTitle className="text-lg cursor-pointer" onClick={() => toggleQuestionExpansion(question.id)}>
                        {question.title}
                      </CardTitle>
                      <Badge variant={getStatusBadgeVariant(question.status)}>
                        {question.status}
                      </Badge>
                    </div>
                    
                    {/* Question Preview */}
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {question.content.replace(/<[^>]*>/g, "").substring(0, 150)}...
                    </p>

                    {/* Question Metadata */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>By {question.author || "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircleIcon className="h-3 w-3" />
                        <span>{question.answerCount} answers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>💬 {question.commentCount} comments</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>👍 {question.votes} votes</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    {question.status !== "published" && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(question.id, "published")}
                        disabled={updateQuestionMutation.isPending || question.answerCount === 0}
                        className={cn(
                          "bg-green-600 hover:bg-green-700",
                          question.answerCount === 0 && "opacity-50 cursor-not-allowed"
                        )}
                        title={question.answerCount === 0 ? "Cannot publish without an official answer" : "Publish question"}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Publish
                        {question.answerCount === 0 && (
                          <span className="ml-1 text-xs">(Needs Answer)</span>
                        )}
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(question)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openAnswerModal(question)}
                      className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {question.answerCount > 0 ? "Edit Answer" : "Answer"}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={deleteQuestionMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Question</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this question? This will also delete all answers and comments. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteQuestionMutation.mutate(question.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>

              {/* Expanded Question Details */}
              {isExpanded && (
                <CardContent className="border-t pt-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Full Question Content:</h4>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <RichTextDisplay content={question.content} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold">Category:</span> {question.category}
                      </div>
                      <div>
                        <span className="font-semibold">Created:</span> {new Date(question.createdAt).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-semibold">Updated:</span> {new Date(question.updatedAt).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-semibold">Author ID:</span> {question.authorId}
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}

        {questions?.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No questions to review</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Question Dialog */}
      <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Question title"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                placeholder="Question content"
                rows={6}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={editForm.status} onValueChange={(value: any) => setEditForm({ ...editForm, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={editForm.category} onValueChange={(value) => setEditForm({ ...editForm, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Faith">Faith</SelectItem>
                    <SelectItem value="Practices">Practices</SelectItem>
                    <SelectItem value="Theology">Theology</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Tags (comma-separated)</label>
              <Input
                value={editForm.tags}
                onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                placeholder="tag1, tag2, tag3"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingQuestion(null)}>
                Cancel
              </Button>
              <Button 
                onClick={() => editingQuestion && updateQuestionMutation.mutate({ 
                  id: editingQuestion.id, 
                  data: editForm 
                })}
                disabled={updateQuestionMutation.isPending}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Answer Question Dialog */}
      <Dialog open={!!answeringQuestion} onOpenChange={() => setAnsweringQuestion(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditingAnswer ? "Edit Answer" : "Answer Question"}: {answeringQuestion?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-semibold mb-2">Question:</h4>
              <RichTextDisplay content={answeringQuestion?.content || ""} />
            </div>
            
            <RichTextEditor
              value={answerForm.content}
              onChange={(content) => setAnswerForm({ ...answerForm, content })}
              placeholder="Provide a detailed, helpful answer to this question..."
              label="Your Answer"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={answerForm.category} onValueChange={(value) => setAnswerForm({ ...answerForm, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Faith">Faith</SelectItem>
                    <SelectItem value="Practices">Practices</SelectItem>
                    <SelectItem value="Theology">Theology</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  value={answerForm.tags}
                  onChange={(e) => setAnswerForm({ ...answerForm, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> {isEditingAnswer 
                  ? "Updating this answer will save your changes." 
                  : "When you submit this answer, the question will automatically be published regardless of its current status."
                }
              </p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setAnsweringQuestion(null)}>
                Cancel
              </Button>
              <Button 
                onClick={() => answeringQuestion && submitAnswerMutation.mutate({ 
                  questionId: answeringQuestion.id, 
                  data: answerForm 
                })}
                disabled={submitAnswerMutation.isPending || !answerForm.content.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isEditingAnswer ? "Update Answer" : "Submit Answer & Publish Question"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}