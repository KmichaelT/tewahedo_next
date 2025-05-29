"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Question, Answer, Comment } from "@/lib/schema"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ThumbsUp, Clock, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { useState, useRef } from "react"
import { convertFirebaseUidToNumericId } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface QuestionDetailProps {
  questionId: number
}

export function QuestionDetail({ questionId }: QuestionDetailProps) {
  const { toast } = useToast()
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  // State for tracking likes and comments
  const [hasLiked, setHasLiked] = useState(false)
  const [likedAnswers, setLikedAnswers] = useState<Record<number, boolean>>({})
  const [likedComments, setLikedComments] = useState<Record<number, boolean>>({})
  const [commentText, setCommentText] = useState("")
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyDepth, setReplyDepth] = useState<number>(0)
  const commentInputRef = useRef<HTMLInputElement>(null)

  // Fetch question details
  const {
    data: question,
    isLoading: questionLoading,
    error,
  } = useQuery<Question>({
    queryKey: ["question", questionId],
    queryFn: async () => {
      const response = await fetch(`/api/questions/${questionId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch question")
      }
      return response.json()
    },
    enabled: !isNaN(questionId),
  })

  // Fetch answers for this question
  const { data: answers, isLoading: answersLoading } = useQuery<Answer[]>({
    queryKey: ["answers", questionId],
    queryFn: async () => {
      const response = await fetch(`/api/answers/${questionId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch answers")
      }
      return response.json()
    },
    enabled: !isNaN(questionId),
  })

  // Fetch comments for this question
  const { data: comments, isLoading: commentsLoading } = useQuery<Comment[]>({
    queryKey: ["comments", questionId],
    queryFn: async () => {
      const response = await fetch(`/api/questions/${questionId}/comments`)
      if (!response.ok) {
        throw new Error("Failed to fetch comments")
      }
      return response.json()
    },
    enabled: !isNaN(questionId),
  })

  // Like question mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/questions/${questionId}/like`, {
        method: "POST",
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to like question")
      }
      return response.json()
    },
    onSuccess: () => {
      setHasLiked(true)
      queryClient.invalidateQueries({ queryKey: ["question", questionId] })
      toast({
        title: "Liked!",
        description: "Your like has been recorded",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Unlike question mutation
  const unlikeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/questions/${questionId}/like`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to unlike question")
      }
      return response.json()
    },
    onSuccess: () => {
      setHasLiked(false)
      queryClient.invalidateQueries({ queryKey: ["question", questionId] })
      toast({
        title: "Unliked",
        description: "Your like has been removed",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (payload: { content: string; parentId?: number }) => {
      const response = await fetch(`/api/questions/${questionId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to add comment")
      }
      return response.json()
    },
    onSuccess: () => {
      setCommentText("")
      setReplyingTo(null)
      setReplyDepth(0)
      queryClient.invalidateQueries({ queryKey: ["comments", questionId] })
      queryClient.invalidateQueries({ queryKey: ["question", questionId] })
      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Handle like button click for questions
  const handleLike = () => {
    if (!session?.user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like questions",
        variant: "destructive",
      })
      return
    }

    if (hasLiked) {
      unlikeMutation.mutate()
    } else {
      likeMutation.mutate()
    }
  }

  // Handle starting a reply to a comment
  const handleStartReply = (commentId: number, depth = 0) => {
    setReplyingTo(commentId)
    setReplyDepth(depth)
    setCommentText("")

    setTimeout(() => {
      if (commentInputRef.current) {
        commentInputRef.current.focus()
      }
    }, 100)
  }

  // Cancel replying
  const cancelReply = () => {
    setReplyingTo(null)
    setReplyDepth(0)
    setCommentText("")
  }

  // Handle add comment (or reply)
  const handleAddComment = () => {
    if (!session?.user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add comments",
        variant: "destructive",
      })
      return
    }

    if (!commentText.trim()) {
      toast({
        title: "Empty Comment",
        description: "Please enter some text for your comment",
        variant: "destructive",
      })
      return
    }

    const payload: any = { content: commentText }

    if (replyingTo !== null) {
      payload.parentId = replyingTo
    }

    addCommentMutation.mutate(payload)
  }

  // Check if user can delete a comment
  const canDeleteComment = (comment: Comment): boolean => {
    if (!session?.user) return false

    // Admins can delete any comment
    if (session.user.isAdmin) return true

    // Convert the current user's ID to a numeric ID
    const numericUserId = convertFirebaseUidToNumericId(session.user.id)

    // Compare with the comment's authorId
    const isCommenter = comment.authorId === session.user.id

    // Check if comment is less than 1 hour old  
    const commentAge = Date.now() - new Date(comment.createdAt!).getTime()
    const ONE_HOUR_MS = 60 * 60 * 1000
    const isWithinTimeWindow = commentAge < ONE_HOUR_MS

    return isCommenter && isWithinTimeWindow
  }

  if (questionLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    )
  }

  if (error || !question) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">Question not found or failed to load.</p>
        </CardContent>
      </Card>
    )
  }

  const createdDate = new Date(question.createdAt!)
  const timeAgo = formatDistanceToNow(createdDate, { addSuffix: true })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-2xl font-bold flex-1 mr-4">{question.title}</CardTitle>
            {question.status && (
              <Badge variant={question.status === "published" ? "default" : "secondary"}>{question.status}</Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="prose max-w-none mb-6">
            <div dangerouslySetInnerHTML={{ __html: question.content }} />
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <ThumbsUp className="h-4 w-4" />
                <span>{question.votes} likes</span>
              </div>

              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{timeAgo}</span>
              </div>
            </div>

            {question.authorId && (
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>Asked by {question.authorId}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Answers section would go here */}
      <Card>
        <CardHeader>
          <CardTitle>Answers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">No answers yet. Be the first to answer this question!</p>
        </CardContent>
      </Card>
    </div>
  )
}
