"use client"

import { useQuery } from "@tanstack/react-query"
import { QuestionDisplay } from "./question-display"
import { AnswerDisplay } from "./answer-display"
import { AdminAnswerForm } from "./admin-answer-form"
import { useSession } from "next-auth/react"

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

  if (!question) return <div>Loading...</div>

  return (
    <div className="space-y-8">
      {/* Question */}
      <QuestionDisplay question={question} showFullContent={true} />
      
      {/* Admin Answer Form */}
      {session?.user?.isAdmin && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Provide an Answer</h3>
          <AdminAnswerForm questionId={questionId} />
        </div>
      )}

      {/* Answers */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">
          Answers ({answers?.length || 0})
        </h3>
        
        {answers?.map((answer: any) => (
          <AnswerDisplay
            key={answer.id}
            answer={{
              ...answer,
              author: {
                id: answer.authorId,
                name: answer.authorName || "Anonymous",
                image: answer.authorImage,
                isAdmin: answer.authorIsAdmin
              }
            }}
          />
        ))}
        
        {(!answers || answers.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            No answers yet. Be the first to help answer this question!
          </div>
        )}
      </div>
    </div>
  )
}