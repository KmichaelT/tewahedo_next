"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { RichTextEditor } from "./rich-text-editor"
import { RichTextDisplay } from "./rich-text-display"
import { CheckCircle, Trash2, Edit, MessageSquare, ChevronDown, ChevronRight, User, Heart, MessageCircle, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
      tags: ""
    })
  }

  const openAnswerModal = async (question: Question) => {
    setAnsweringQuestion(question)
    
    if (question.answerCount > 0) {
      setIsEditingAnswer(true)
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

  const getCategoryColor = (category: string) => {
    const colors = {
      'Faith': 'bg-blue-100 text-blue-800 border-blue-200',
      'Practices': 'bg-green-100 text-green-800 border-green-200', 
      'Theology': 'bg-purple-100 text-purple-800 border-purple-200',
      'History': 'bg-orange-100 text-orange-800 border-orange-200',
      'General': 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[category as keyof typeof colors] || colors.General
  }

  const handleUpdateStatus = (id: number, status: "pending" | "published") => {
    updateQuestionMutation.mutate({ id, data: { status } })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Manage Questions</h1>
          <p className="text-gray-600">Review, edit, answer, and moderate forum questions</p>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <span className="ml-3 text-gray-600">Loading questions...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8"> 

      {/* Questions List */}
      <div className="space-y-6">
        {questions?.map((question: Question) => {
          const isExpanded = expandedQuestions.has(question.id)
          
          return (
            <Card key={question.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4">
                {/* Question Header */}
                <div className="space-y-4">
                  {/* Top Row: Expand Button, Title, Category, Status and Actions */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleQuestionExpansion(question.id)}
                        className="flex-shrink-0 h-8 w-8 p-0"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="min-w-0 flex-1 flex items-center gap-3">
                        <CardTitle 
                          className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-orange-600 transition-colors truncate flex-1"
                          onClick={() => toggleQuestionExpansion(question.id)}
                          title={question.title}
                        >
                          {question.title}
                        </CardTitle>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge 
                        variant={getStatusBadgeVariant(question.status)}
                        className={cn(
                          "font-medium",
                          question.status === "published" && "bg-green-100 text-green-800 border-green-200",
                          question.status === "pending" && "bg-yellow-100 text-yellow-800 border-yellow-200"
                        )}
                      >
                        {question.status}
                      </Badge>
                      
                      {/* Actions Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => openEditModal(question)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Question
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openAnswerModal(question)}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            {question.answerCount > 0 ? "Edit Answer" : "Add Answer"}
                          </DropdownMenuItem>
                          {question.status !== "published" && (
                            <DropdownMenuItem 
                              onClick={() => handleUpdateStatus(question.id, "published")}
                              disabled={question.answerCount === 0}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Publish
                              {question.answerCount === 0 && (
                                <span className="ml-1 text-xs text-gray-500">(Needs Answer)</span>
                              )}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => deleteQuestionMutation.mutate(question.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Question
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Author Row */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 ml-11">
                    <User className="h-4 w-4" />
                    <span>By {question.author || "Unknown"}</span>
                  </div>

                  {/* Content Preview */}
                  <div className="bg-gray-50 p-4 rounded-lg ml-11">
                    <p className="text-gray-700 line-clamp-3">
                      {question.content.replace(/<[^>]*>/g, "")}
                    </p>
                  </div>

                  {/* Stats Row - Always at bottom */}
                  <div className="flex items-center gap-6 text-sm text-gray-600 ml-11 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{question.votes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{question.commentCount}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Created {new Date(question.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardHeader>

              {/* Expanded Content */}
              {isExpanded && (
                <CardContent className="border-t pt-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Full Question Content</h4>
                      <div className="bg-white border rounded-lg p-4">
                        <RichTextDisplay content={question.content} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Status:</span>
                          <span className="text-gray-900">{question.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Has Answer:</span>
                          <span className="text-gray-900">{question.answerCount > 0 ? "Yes" : "No"}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Created:</span>
                          <span className="text-gray-900">{new Date(question.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Updated:</span>
                          <span className="text-gray-900">{new Date(question.updatedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}

        {questions?.length === 0 && (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions to review</h3>
              <p className="text-gray-600">Questions will appear here when users submit them.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Question Dialog */}
      <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Title</label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Question title"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Content</label>
              <Textarea
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                placeholder="Question content"
                rows={8}
                className="w-full"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
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
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category</label>
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
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tags (comma-separated)</label>
              <Input
                value={editForm.tags}
                onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                placeholder="tag1, tag2, tag3"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setEditingQuestion(null)}>
                Cancel
              </Button>
              <Button 
                onClick={() => editingQuestion && updateQuestionMutation.mutate({ 
                  id: editingQuestion.id, 
                  data: editForm 
                })}
                disabled={updateQuestionMutation.isPending}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {updateQuestionMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Answer Question Dialog */}
      <Dialog open={!!answeringQuestion} onOpenChange={() => setAnsweringQuestion(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {isEditingAnswer ? "Edit Answer" : "Answer Question"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-900 mb-3">Question:</h4>
              <h5 className="font-medium text-gray-800 mb-2">{answeringQuestion?.title}</h5>
              <RichTextDisplay content={answeringQuestion?.content || ""} />
            </div>
            
            <RichTextEditor
              value={answerForm.content}
              onChange={(content) => setAnswerForm({ ...answerForm, content })}
              placeholder="Provide a detailed, helpful answer to this question..."
              label="Your Answer"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category</label>
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
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                <Input
                  value={answerForm.tags}
                  onChange={(e) => setAnswerForm({ ...answerForm, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> {isEditingAnswer 
                  ? "Updating this answer will save your changes." 
                  : "When you submit this answer, the question will automatically be published regardless of its current status."
                }
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setAnsweringQuestion(null)}>
                Cancel
              </Button>
              <Button 
                onClick={() => answeringQuestion && submitAnswerMutation.mutate({ 
                  questionId: answeringQuestion.id, 
                  data: answerForm 
                })}
                disabled={submitAnswerMutation.isPending || !answerForm.content.trim()}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {submitAnswerMutation.isPending ? "Submitting..." : 
                 isEditingAnswer ? "Update Answer" : "Submit Answer & Publish"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}