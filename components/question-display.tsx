// components/question-display.tsx
"use client"

import { Badge } from "@/components/ui/badge"
import { RichTextDisplay } from "./rich-text-display"
import { Heart, MessageCircle, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Question {
  id: number
  title: string
  content: string
  category: string
  votes: number
  answerCount: number
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
}

export function QuestionDisplay({ question, showFullContent = false }: QuestionDisplayProps) {
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

      {/* Question Stats */}
      <div className="flex items-center space-x-6 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <Heart className="h-4 w-4" />
          <span>{question.votes} votes</span>
        </div>
        <div className="flex items-center space-x-1">
          <MessageCircle className="h-4 w-4" />
          <span>{question.answerCount} answers</span>
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