import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Question {
  id: number
  title: string
  content: string
  category: string
  author: string
  authorDisplayName?: string
  authorImage?: string
  answerCount: number
  votes: number
  createdAt: string
}

interface QuestionCardProps {
  question: Question
}

const getCategoryColor = (category: string) => {
  const colors = {
    'Faith': 'bg-blue-100 text-blue-800 border-blue-200',
    'Practices': 'bg-green-100 text-green-800 border-green-200', 
    'Theology': 'bg-purple-100 text-purple-800 border-purple-200',
    'History': 'bg-orange-100 text-orange-800 border-orange-200',
    'General': 'bg-gray-100 text-gray-800 border-gray-200'
  }
  return colors[category as keyof typeof colors] || colors.General
}

const truncateText = (text: string, maxLength: number = 150) => {
  const strippedText = text.replace(/<[^>]*>/g, "") // Remove HTML tags
  if (strippedText.length <= maxLength) return strippedText
  return strippedText.substring(0, maxLength) + "..."
}

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <Card className="flex w-full flex-col justify-between gap-10 rounded-[.5rem] border bg-background p-5 hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex w-full flex-col justify-between gap-4 p-0 lg:flex-row lg:items-start">
        <CardTitle className="flex w-fit items-start justify-start gap-2.5">
          <h2 className="text-xl leading-tight font-bold tracking-tight line-clamp-2">
            {question.title}
          </h2>
        </CardTitle>
        <Badge className={getCategoryColor(question.category)}>
          <p className="text-sm">{question.category}</p>
        </Badge>
      </CardHeader>
      
      <CardContent className="p-0">
        <p className="max-w-full text-base leading-[1.4] font-medium text-muted-foreground">
          {truncateText(question.content)}
        </p>
      </CardContent>
      
      <CardFooter className="flex w-full items-end justify-between gap-5 p-0 lg:flex-row">
        <div className="flex-1">
          <Link href={`/questions/${question.id}`}>
            <Button size="sm" className="rounded-full bg-orange-600 hover:bg-orange-700">
              <span className="flex items-center gap-2">
                {question.answerCount > 0 ? "See Answer" : "Be First to Answer"}
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </Link>
        </div>
        <div className="h-8 w-8">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={question.authorImage} 
              alt={question.authorDisplayName || question.author || "User"} 
            />
            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-400 text-white text-sm font-medium">
              {(question.authorDisplayName || question.author || "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </CardFooter>
    </Card>
  )
}