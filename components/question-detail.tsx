"use client"

import { useQuery } from "@tanstack/react-query"
import { QuestionDisplay } from "./question-display"
import { AnswerDisplay } from "./answer-display"
import { CommentSystem } from "./comment-system"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"

export function QuestionDetail({ questionId }: { questionId: number }) {
  const { data: session } = useSession()
  
  const { data: question } = useQuery({
    queryKey: ["question", questionId],
    queryFn: async () => {
      const response = await fetch(`/api/questions/${questionId}`)
      if (!response.ok) throw new Error("Failed to fetch question")
      return response.json()
    },
  })

  const { data: answers } = useQuery({
    queryKey: ["answers", questionId],
    queryFn: async () => {
      const response = await fetch(`/api/answers/${questionId}`)
      if (!response.ok) throw new Error("Failed to fetch answers")
      return response.json()
    },
  })

  const { data: comments } = useQuery({
    queryKey: ["comments", questionId],
    queryFn: async () => {
      const response = await fetch(`/api/questions/${questionId}/comments`)
      if (!response.ok) throw new Error("Failed to fetch comments")
      return response.json()
    },
  })

  if (!question) return <div>Loading...</div>

  const hasOfficialAnswer = answers && answers.length > 0
  const commentCount = comments?.length || 0

  return (
    <div className="space-y-8">
      {/* Question */}
      <QuestionDisplay 
        question={question} 
        showFullContent={true} 
        commentCount={commentCount}
      />
      
      {/* Official Answer Section - Immediately after question */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Official Answer</h3>
        
        {hasOfficialAnswer ? (
          answers.map((answer: any) => (
            <AnswerDisplay
              key={answer.id}
              answer={{
                ...answer,
                author: {
                  id: answer.authorId,
                  name: answer.authorName || answer.authorDisplayName || "Church Leader",
                  image: answer.authorImage,
                  isAdmin: answer.authorIsAdmin
                }
              }}
            />
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-gray-500">
                <p className="text-lg mb-2">No official answer yet</p>
                <p className="text-sm">
                  This question is awaiting review and response from our church leaders. 
                  Official answers are provided through our administrative review process.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Discussion Section - Only show if there's an official answer */}
      {hasOfficialAnswer && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Discussion</h3>
          <CommentSystem questionId={questionId} />
        </div>
      )}

      {/* Message when discussion is disabled */}
      {!hasOfficialAnswer && (
        <div className="border-t pt-6">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6 text-center">
              <div className="text-yellow-800">
                <p className="font-medium mb-2">Discussion Not Available</p>
                <p className="text-sm">
                  Community discussion will be enabled once our church leaders provide an official answer to this question.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}