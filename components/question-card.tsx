import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Calendar, User } from "lucide-react"
import Link from "next/link"

interface Question {
  id: number
  title: string
  content: string
  author: {
    name: string
    email: string
    image?: string
  }
  category: string
  likes: number
  answers: number
  createdAt: string
  status: string
}

interface QuestionCardProps {
  question: Question
}

export function QuestionCard({ question }: QuestionCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Faith":
        return "bg-blue-100 text-blue-800"
      case "Practices":
        return "bg-purple-100 text-purple-800"
      case "Theology":
        return "bg-orange-100 text-orange-800"
      case "History":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={`/questions/${question.id}`} className="block">
              <h3 className="text-lg font-semibold text-gray-900 hover:text-orange-600 transition-colors line-clamp-2">
                {question.title}
              </h3>
            </Link>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className={getCategoryColor(question.category)}>
                {question.category}
              </Badge>
              <Badge variant="outline" className={getStatusColor(question.status)}>
                {question.status}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{question.content}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>{question.author.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(question.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600">
              <Heart className="h-4 w-4 mr-1" />
              <span>{question.likes}</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
              <MessageCircle className="h-4 w-4 mr-1" />
              <span>{question.answers}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
