"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RichTextDisplay } from "./rich-text-display"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export function QuestionsList() {
  const { data: questions, isLoading } = useQuery({
    queryKey: ["questions"],
    queryFn: async () => {
      const response = await fetch("/api/questions")
      if (!response.ok) throw new Error("Failed to fetch questions")
      return response.json()
    },
  })

  if (isLoading) return <div>Loading questions...</div>

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Recent Questions</h2>
      
      {questions?.map((question: any) => (
        <Card key={question.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-3">
              <Link 
                href={`/questions/${question.id}`}
                className="text-xl font-semibold text-gray-900 hover:text-orange-600"
              >
                {question.title}
              </Link>
              <Badge className={getCategoryColor(question.category)}>
                {question.category}
              </Badge>
            </div>
            
            {/* Preview of content - truncated rich text */}
            <RichTextDisplay 
              content={question.content.substring(0, 200) + "..."}
              className="text-sm mb-4"
            />
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span>By {question.author}</span>
                <span>{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>{question.votes} votes</span>
                <span>{question.answerCount} answers</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function getCategoryColor(category: string) {
  const colors = {
    'Faith': 'bg-blue-100 text-blue-800',
    'Practices': 'bg-green-100 text-green-800', 
    'Theology': 'bg-purple-100 text-purple-800',
    'History': 'bg-orange-100 text-orange-800',
    'General': 'bg-gray-100 text-gray-800'
  }
  return colors[category as keyof typeof colors] || colors.General
}