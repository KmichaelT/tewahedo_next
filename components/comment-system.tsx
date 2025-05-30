"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Heart, MessageCircle, Trash2, MoreVertical } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface Comment {
  id: number
  content: string
  authorId: string
  questionId?: number
  answerId?: number
  parentId?: number
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    image?: string
    isAdmin?: boolean
  }
  likes: number
  isLiked: boolean
  replies?: Comment[]
  level: number
}

interface CommentSystemProps {
  questionId: number
  answerId?: number
}

interface ReplyForm {
  parentId: number
  content: string
  isOpen: boolean
}

export function CommentSystem({ questionId, answerId }: CommentSystemProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // State management
  const [newComment, setNewComment] = useState("")
  const [replyForms, setReplyForms] = useState<Map<number, ReplyForm>>(new Map())
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch comments
  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", questionId, answerId],
    queryFn: async () => {
      const url = answerId 
        ? `/api/answers/${answerId}/comments`
        : `/api/questions/${questionId}/comments`
      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch comments")
      return response.json() as Promise<Comment[]>
    },
  })

  // Submit comment mutation
  const submitCommentMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: number }) => {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          questionId: answerId ? undefined : questionId,
          answerId,
          parentId,
        }),
      })
      if (!response.ok) throw new Error("Failed to submit comment")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", questionId, answerId] })
      setNewComment("")
      setReplyForms(new Map())
      toast({ title: "Comment posted successfully!" })
    },
    onError: (error) => {
      toast({ 
        title: "Failed to post comment", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      })
    },
  })

  // Like comment mutation
  const likeCommentMutation = useMutation({
    mutationFn: async ({ commentId, isLiked }: { commentId: number; isLiked: boolean }) => {
      const method = isLiked ? "DELETE" : "POST"
      const response = await fetch(`/api/comments/${commentId}/like`, { method })
      if (!response.ok) throw new Error("Failed to toggle like")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", questionId, answerId] })
    },
    onError: (error) => {
      toast({ 
        title: "Failed to toggle like", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      })
    },
  })

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const response = await fetch(`/api/comments/${commentId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete comment")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", questionId, answerId] })
      toast({ title: "Comment deleted successfully" })
    },
    onError: (error) => {
      toast({ 
        title: "Failed to delete comment", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      })
    },
  })

  // Helper functions
  const canDeleteComment = (comment: Comment): boolean => {
    if (!session?.user) return false
    
    // Admins can always delete
    if (session.user.isAdmin) return true
    
    // Authors can delete within 1 hour
    if (comment.author.id === session.user.id) {
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
      return new Date(comment.createdAt) > hourAgo
    }
    
    return false
  }

  const openReplyForm = (parentId: number) => {
    const newForms = new Map(replyForms)
    newForms.set(parentId, { parentId, content: "", isOpen: true })
    setReplyForms(newForms)
  }

  const closeReplyForm = (parentId: number) => {
    const newForms = new Map(replyForms)
    newForms.delete(parentId)
    setReplyForms(newForms)
  }

  const updateReplyContent = (parentId: number, content: string) => {
    const newForms = new Map(replyForms)
    const existing = newForms.get(parentId)
    if (existing) {
      newForms.set(parentId, { ...existing, content })
      setReplyForms(newForms)
    }
  }

  const submitReply = async (parentId: number) => {
    const replyForm = replyForms.get(parentId)
    if (!replyForm?.content.trim()) return

    await submitCommentMutation.mutateAsync({
      content: replyForm.content,
      parentId,
    })
  }

  const handleLike = (commentId: number, isLiked: boolean) => {
    if (!session?.user) {
      toast({ title: "Please sign in to like comments", variant: "destructive" })
      return
    }
    likeCommentMutation.mutate({ commentId, isLiked })
  }

  const handleDelete = (commentId: number) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate(commentId)
    }
  }

  // Build comment tree with proper nesting levels
  const buildCommentTree = (comments: Comment[], parentId: number | null = null, level: number = 0): Comment[] => {
    return comments
      .filter(comment => comment.parentId === parentId)
      .map(comment => ({
        ...comment,
        level,
        replies: level < 2 ? buildCommentTree(comments, comment.id, level + 1) : []
      }))
  }

  const renderComment = (comment: Comment) => {
    const replyForm = replyForms.get(comment.id)
    const maxLevel = 2 // 3 levels total (0, 1, 2)
    const replyCount = comment.replies?.length || 0
    
    return (
      <div key={comment.id} className="relative">
        {/* Connecting lines for nested comments */}
        {comment.level > 0 && (
          <div 
            className="absolute left-0 top-0 bottom-0 w-px bg-gray-200"
            style={{ left: `${(comment.level - 1) * 24 + 12}px` }}
          />
        )}
        
        <div 
          className={cn(
            "relative bg-white rounded-lg border p-4 mb-3",
            comment.level > 0 && "ml-6"
          )}
          style={{ marginLeft: comment.level > 0 ? `${comment.level * 24}px` : 0 }}
        >
          {/* Comment header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.author.image} alt={comment.author.name} />
                <AvatarFallback>
                  {comment.author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-sm">{comment.author.name}</span>
                  {comment.author.isAdmin && (
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                      Church Leader
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
            
            {canDeleteComment(comment) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(comment.id)}
                className="text-gray-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Comment content */}
          <div className="mb-3">
            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          </div>

          {/* Comment actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Like button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(comment.id, comment.isLiked)}
                className={cn(
                  "flex items-center space-x-1 text-gray-600 hover:text-red-600 p-1",
                  comment.isLiked && "text-red-600"
                )}
                disabled={!session?.user}
              >
                <Heart className={cn("h-4 w-4", comment.isLiked && "fill-current")} />
                <span className="text-sm">{comment.likes}</span>
              </Button>

              {/* Reply count */}
              {replyCount > 0 && (
                <div className="flex items-center space-x-1 text-gray-500">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">{replyCount}</span>
                </div>
              )}
            </div>

            {/* Reply button */}
            {session?.user && comment.level < maxLevel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openReplyForm(comment.id)}
                className="text-gray-600 hover:text-blue-600 text-sm"
              >
                Reply
              </Button>
            )}
          </div>

          {/* Reply form */}
          {replyForm?.isOpen && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <Textarea
                value={replyForm.content}
                onChange={(e) => updateReplyContent(comment.id, e.target.value)}
                placeholder="Write a reply..."
                rows={3}
                className="mb-3"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => closeReplyForm(comment.id)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => submitReply(comment.id)}
                  disabled={submitCommentMutation.isPending || !replyForm.content.trim()}
                >
                  Reply
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Render nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="relative">
            {comment.replies.map(reply => renderComment(reply))}
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading comments...</div>
  }

  const commentTree = buildCommentTree(comments || [])

  return (
    <div className="space-y-6">
      {/* New comment form */}
      {session?.user ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                <AvatarFallback>
                  {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="mb-3"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={() => submitCommentMutation.mutate({ content: newComment })}
                    disabled={submitCommentMutation.isPending || !newComment.trim()}
                  >
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-gray-600 mb-3">Please sign in to join the discussion</p>
            <Button onClick={() => window.location.href = "/auth/signin"}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Comments list */}
      <div className="space-y-1">
        {commentTree.length > 0 ? (
          <>
            <h4 className="font-semibold text-lg mb-4">
              Comments ({comments?.length || 0})
            </h4>
            {commentTree.map(comment => renderComment(comment))}
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No comments yet. Be the first to start the discussion!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}