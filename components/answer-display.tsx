// components/answer-display.tsx
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RichTextDisplay } from "./rich-text-display"
import { Heart, CheckCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Answer {
  id: number
  content: string
  votes: number
  isAccepted: boolean
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    image?: string
    isAdmin?: boolean
  }
}

interface AnswerDisplayProps {
  answer: Answer
  onAccept?: (answerId: number) => void
  canAccept?: boolean
}

export function AnswerDisplay({ answer, onAccept, canAccept }: AnswerDisplayProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // Local state for optimistic updates
  const [localVotes, setLocalVotes] = useState(answer.votes)
  const [isLiked, setIsLiked] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  
  // Mutation for liking/unliking answers
  const likeMutation = useMutation({
    mutationFn: async ({ answerId, isCurrentlyLiked }: { answerId: number; isCurrentlyLiked: boolean }) => {
      const method = isCurrentlyLiked ? "DELETE" : "POST"
      console.log(`[Frontend] ${method} /api/answers/like/${answerId}`, { isCurrentlyLiked })
      
      const response = await fetch(`/api/answers/like/${answerId}`, { 
        method,
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      console.log(`[Frontend] Response status: ${response.status}`)
      
      const result = await response.json()
      console.log(`[Frontend] Response data:`, result)
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`)
      }
      
      return result
    },
    onMutate: async ({ isCurrentlyLiked }) => {
      console.log(`[Frontend] Starting optimistic update`, { isCurrentlyLiked })
      // Optimistic update
      setIsLiking(true)
      const newLikedState = !isCurrentlyLiked
      const newVotes = newLikedState ? localVotes + 1 : localVotes - 1
      
      setIsLiked(newLikedState)
      setLocalVotes(newVotes)
    },
    onSuccess: (data, { isCurrentlyLiked }) => {
      console.log(`[Frontend] Mutation success:`, data)
      
      // Update with actual server response
      if (data.alreadyLiked) {
        setIsLiked(true)
      }
      
      if (data.newVotes !== undefined) {
        setLocalVotes(data.newVotes)
      }
    },
    onError: (error, { isCurrentlyLiked }) => {
      console.error(`[Frontend] Mutation error:`, error)
      
      // Revert optimistic update on error
      setIsLiked(isCurrentlyLiked)
      setLocalVotes(answer.votes)
      
      toast({ 
        title: "Failed to update like", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      })
    },
    onSettled: () => {
      console.log(`[Frontend] Mutation settled`)
      setIsLiking(false)
      queryClient.invalidateQueries({ queryKey: ["answers"] })
    },
  })

  // Check if user has liked this answer
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!session?.user) return
      
      try {
        const response = await fetch(`/api/answers/like/${answer.id}`)
        if (response.ok) {
          const data = await response.json()
          setIsLiked(data.isLiked || false)
        }
      } catch (error) {
        console.error("Error checking like status:", error)
      }
    }
    
    checkLikeStatus()
  }, [answer.id, session])

  const handleLike = () => {
    if (!session?.user) {
      toast({ title: "Please sign in to like answers", variant: "destructive" })
      return
    }
    
    likeMutation.mutate({ answerId: answer.id, isCurrentlyLiked: isLiked })
  }
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        {/* Answer Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={answer.author.image} alt={answer.author.name} />
              <AvatarFallback>
                {answer.author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900">
                  {answer.author.name}
                </span>
                {answer.author.isAdmin && (
                  <Badge variant="secondary" className="text-xs">
                    Church Leader
                  </Badge>
                )}
                {answer.isAccepted && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Accepted Answer
                  </Badge>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        {/* Rich Text Content */}
        <RichTextDisplay content={answer.content} className="mb-4" />

        {/* Answer Actions - Interactive like button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
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
          </div>

          {canAccept && !answer.isAccepted && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onAccept?.(answer.id)}
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Accept Answer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}