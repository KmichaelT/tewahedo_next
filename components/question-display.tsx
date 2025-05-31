// components/question-display.tsx
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RichTextDisplay } from "./rich-text-display"
import { Heart, Eye, MessageCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Question {
  id: number
  title: string
  content: string
  category: string
  votes: number
  views?: number
  createdAt: string
  // API returns flat author data, not nested
  author?: string
  authorDisplayName?: string
  authorImage?: string
}

interface QuestionDisplayProps {
  question: Question
  showFullContent?: boolean
  commentCount?: number
}

export function QuestionDisplay({ question, showFullContent = false, commentCount = 0 }: QuestionDisplayProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // Local state for optimistic updates
  const [localVotes, setLocalVotes] = useState(question.votes)
  const [isLiked, setIsLiked] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  
  // Mutation for liking/unliking questions
  const likeMutation = useMutation({
    mutationFn: async ({ questionId, isCurrentlyLiked }: { questionId: number; isCurrentlyLiked: boolean }) => {
      const method = isCurrentlyLiked ? "DELETE" : "POST"
      const response = await fetch(`/api/questions/${questionId}/like`, { method })
      if (!response.ok) throw new Error("Failed to toggle like")
      return response.json()
    },
    onMutate: async ({ isCurrentlyLiked }) => {
      // Optimistic update
      setIsLiking(true)
      const newLikedState = !isCurrentlyLiked
      const newVotes = newLikedState ? localVotes + 1 : localVotes - 1
      
      setIsLiked(newLikedState)
      setLocalVotes(newVotes)
    },
    onError: (error, { isCurrentlyLiked }) => {
      // Revert optimistic update on error
      setIsLiked(isCurrentlyLiked)
      setLocalVotes(question.votes)
      toast({ 
        title: "Failed to update like", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      })
    },
    onSettled: () => {
      setIsLiking(false)
      queryClient.invalidateQueries({ queryKey: ["question", question.id] })
    },
  })

  // Check if user has liked this question
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!session?.user) return
      
      try {
        const response = await fetch(`/api/questions/${question.id}/like`)
        if (response.ok) {
          const data = await response.json()
          setIsLiked(data.isLiked || false)
        }
      } catch (error) {
        console.error("Error checking like status:", error)
      }
    }
    
    checkLikeStatus()
  }, [question.id, session])

  const handleLike = () => {
    if (!session?.user) {
      toast({ title: "Please sign in to like questions", variant: "destructive" })
      return
    }
    
    likeMutation.mutate({ questionId: question.id, isCurrentlyLiked: isLiked })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'Faith': 'bg-blue-100 text-blue-800',
      'Practices': 'bg-green-100 text-green-800', 
      'Theology': 'bg-purple-100 text-purple-800',
      'History': 'bg-orange-100 text-orange-800',
      'General': 'bg-gray-100 text-gray-800'
    }
    return colors[category as keyof typeof colors] || colors.General
  }

  // Use authorDisplayName or author as fallback
  const authorName = question.authorDisplayName || question.author || "Anonymous"

  return (
    <div className="space-y-4">
      {/* Question Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{question.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Asked by {authorName}</span>
            <span>{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
            <Badge className={getCategoryColor(question.category)}>
              {question.category}
            </Badge>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="bg-white p-6 rounded-lg border">
        <RichTextDisplay 
          content={showFullContent ? question.content : question.content.substring(0, 300) + (question.content.length > 300 ? '...' : '')}
        />
      </div>

      {/* Question Stats - Interactive likes and functional counts */}
      <div className="flex items-center space-x-6 text-sm text-gray-600">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={isLiking || !session?.user}
          className={cn(
            "flex items-center space-x-1 p-1 h-auto text-gray-600 hover:text-red-600",
            isLiked && "text-red-600",
            !session?.user && "cursor-not-allowed opacity-50"
          )}
        >
          <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
          <span>{localVotes}</span>
        </Button>
        
        <div className="flex items-center space-x-1">
          <MessageCircle className="h-4 w-4" />
          <span>{commentCount}</span>
        </div>
        
        {question.views && (
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span>{question.views} views</span>
          </div>
        )}
      </div>
    </div>
  )
}