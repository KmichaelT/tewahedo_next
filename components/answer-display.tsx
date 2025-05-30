// components/answer-display.tsx
"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RichTextDisplay } from "./rich-text-display"
import { Heart, MessageCircle, CheckCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

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
  onVote?: (answerId: number) => void
  onAccept?: (answerId: number) => void
  canAccept?: boolean
}

export function AnswerDisplay({ answer, onVote, onAccept, canAccept }: AnswerDisplayProps) {
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

        {/* Answer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onVote?.(answer.id)}
              className="flex items-center space-x-1 text-gray-600"
            >
              <Heart className="h-4 w-4" />
              <span>{answer.votes}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="flex items-center space-x-1 text-gray-600"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Reply</span>
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

