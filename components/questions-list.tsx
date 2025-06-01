"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { SearchFilters, type SearchFilters as SearchFiltersType } from "./search-filters"

interface Question {
  id: number
  title: string
  content: string
  category: string
  author?: string
  authorDisplayName?: string
  authorImage?: string
  answerCount: number
  votes: number
  createdAt: string
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

export function QuestionsList() {
  const [filters, setFilters] = useState<SearchFiltersType>({
    search: "",
    category: "all",
    sortBy: "latest",
  })

  // Build query parameters
  const buildQueryParams = (filters: SearchFiltersType) => {
    const params = new URLSearchParams()
    
    if (filters.search) {
      params.append("search", filters.search)
    }
    
    if (filters.category && filters.category !== "all") {
      params.append("category", filters.category)
    }
    
    // Note: sortBy will be handled on the frontend since the API doesn't support it yet
    
    return params.toString()
  }

  const { data: questions, isLoading } = useQuery({
    queryKey: ["questions", filters],
    queryFn: async () => {
      const queryParams = buildQueryParams(filters)
      const url = `/api/questions${queryParams ? `?${queryParams}` : ""}`
      
      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch questions")
      return response.json() as Promise<Question[]>
    },
  })

  // Sort questions on the frontend (since API doesn't support sorting yet)
  const sortedQuestions = questions ? [...questions].sort((a, b) => {
    switch (filters.sortBy) {
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "popular":
        return b.votes - a.votes
      case "latest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  }) : []

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters)
  }

  return (
    <div className=" space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Questions</h2>
        <div className="text-sm text-muted-foreground">
          {questions && questions.length > 0 && (
            <span>{questions.length} question{questions.length !== 1 ? 's' : ''} found</span>
          )}
        </div>
      </div>
      
      {/* Search and Filter Controls */}
      <SearchFilters onFiltersChange={handleFiltersChange} />
      
      <div className="grid w-full grid-cols-1 grid-rows-[auto] gap-8 md:grid-cols-2">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={`skeleton-${i}`} className="flex w-full flex-col justify-between gap-10 rounded-[.5rem] border bg-background p-5">
              <CardHeader className="flex w-full flex-col justify-between gap-4 p-0 lg:flex-row lg:items-center">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
                </div>
              </CardContent>
              <CardFooter className="flex w-full items-end justify-between gap-5 p-0 lg:flex-row">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              </CardFooter>
            </Card>
          ))
        ) : sortedQuestions && sortedQuestions.length > 0 ? (
          sortedQuestions.map((question: Question) => (
            <Card
              key={`question-${question.id}`}
              className="flex w-full flex-col justify-between gap-4 rounded-[.5rem] border bg-background p-5 hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader className="flex w-full flex-col justify-between gap-4 p-0 lg:flex-row lg:items-start">
                <CardTitle className="flex w-full items-start justify-start gap-2.5">
                  <h2 className="text-xl leading-tight font-semibold tracking-tight line-clamp-2">
                    {question.title}
                  </h2>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="max-w-full text-base leading-[1.4] font-medium text-muted-foreground">
                  {truncateText(question.content)}
                </p>
              </CardContent>
              <CardFooter className="flex w-full items-end justify-between gap-5 p-0 lg:flex-row">
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
                <div className=" ">
                  <Link href={`/questions/${question.id}`}>
                    <Button size="sm" className="rounded-full bg-orange-600 hover:bg-orange-700">
                      <span className="flex items-center gap-2">
                        {question.answerCount > 0 ? "See Answer" : "Be First to Answer"}
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </Button>
                  </Link>
                </div>

              </CardFooter>
            </Card>
          ))
        ) : (
          // No questions state
          <div className="col-span-full">
            <Card className="flex w-full flex-col items-center justify-center gap-6 rounded-[.5rem] border bg-background p-12">
              <div className="text-center space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">
                  {filters.search || filters.category !== "all" ? "No Questions Found" : "No Questions Yet"}
                </h3>
                <p className="text-base text-muted-foreground max-w-md">
                  {filters.search || filters.category !== "all" 
                    ? "Try adjusting your search terms or filters to find what you're looking for."
                    : "Be the first to ask a question about the Ethiopian Orthodox Tewahedo faith and help build our community knowledge."
                  }
                </p>
              </div>
              <Link href="/ask">
                <Button className="rounded-full bg-orange-600 hover:bg-orange-700">
                  Ask a Question
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}