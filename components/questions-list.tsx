"use client"

import { useState, useMemo } from "react"
import { QuestionCard } from "./question-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"

// Mock data for preview
const mockQuestions = [
  {
    id: 1,
    title: "What is the significance of the Ethiopian Orthodox Tewahedo Church calendar?",
    content:
      "I would like to understand the unique aspects of our church calendar and how it differs from other Christian calendars. What are the main feast days and fasting periods?",
    author: {
      name: "Dawit Tekle",
      email: "dawit@example.com",
      image: "/placeholder.svg?height=40&width=40",
    },
    category: "Practices",
    likes: 15,
    answers: 3,
    createdAt: "2024-01-15T10:30:00Z",
    status: "approved",
  },
  {
    id: 2,
    title: "How do we understand the Trinity in Ethiopian Orthodox theology?",
    content:
      "Can someone explain the Ethiopian Orthodox understanding of the Holy Trinity and how it might differ from other Christian denominations?",
    author: {
      name: "Sara Haile",
      email: "sara@example.com",
      image: "/placeholder.svg?height=40&width=40",
    },
    category: "Theology",
    likes: 22,
    answers: 5,
    createdAt: "2024-01-14T14:20:00Z",
    status: "approved",
  },
  {
    id: 3,
    title: "What are the proper fasting guidelines for Hudadi (Lent)?",
    content:
      "I'm looking for detailed information about the fasting requirements during the Lenten season. What foods are permitted and what should be avoided?",
    author: {
      name: "Michael Gebru",
      email: "michael@example.com",
      image: "/placeholder.svg?height=40&width=40",
    },
    category: "Practices",
    likes: 18,
    answers: 7,
    createdAt: "2024-01-13T09:15:00Z",
    status: "approved",
  },
  {
    id: 4,
    title: "History of the Ark of the Covenant in Ethiopia",
    content:
      "What is the historical and theological significance of the Ark of the Covenant in Ethiopian Orthodox tradition?",
    author: {
      name: "Ruth Alemayehu",
      email: "ruth@example.com",
      image: "/placeholder.svg?height=40&width=40",
    },
    category: "History",
    likes: 31,
    answers: 4,
    createdAt: "2024-01-12T16:45:00Z",
    status: "approved",
  },
  {
    id: 5,
    title: "Understanding the role of Deacons in our church",
    content:
      "What are the responsibilities and spiritual significance of deacons in the Ethiopian Orthodox Tewahedo Church?",
    author: {
      name: "Yohannes Tadesse",
      email: "yohannes@example.com",
      image: "/placeholder.svg?height=40&width=40",
    },
    category: "Faith",
    likes: 12,
    answers: 2,
    createdAt: "2024-01-11T11:30:00Z",
    status: "pending",
  },
  {
    id: 6,
    title: "Proper way to receive Holy Communion",
    content: "What is the traditional and proper way to prepare for and receive Holy Communion in our church?",
    author: {
      name: "Hanna Wolde",
      email: "hanna@example.com",
      image: "/placeholder.svg?height=40&width=40",
    },
    category: "Practices",
    likes: 25,
    answers: 6,
    createdAt: "2024-01-10T08:20:00Z",
    status: "approved",
  },
]

export function QuestionsList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("latest")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const questionsPerPage = 4

  // Filter and sort questions
  const filteredAndSortedQuestions = useMemo(() => {
    const filtered = mockQuestions.filter((question) => {
      const matchesSearch =
        question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.content.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || question.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    // Sort questions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "popular":
          return b.likes - a.likes
        default:
          return 0
      }
    })

    return filtered
  }, [searchTerm, selectedCategory, sortBy])

  // Paginate questions
  const totalPages = Math.ceil(filteredAndSortedQuestions.length / questionsPerPage)
  const paginatedQuestions = filteredAndSortedQuestions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage,
  )

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
    setIsLoading(true)
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500)
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setCurrentPage(1)
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 300)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 300)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Community Questions</h2>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Faith">Faith</SelectItem>
                <SelectItem value="Practices">Practices</SelectItem>
                <SelectItem value="Theology">Theology</SelectItem>
                <SelectItem value="History">History</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="text-sm text-gray-600 mb-4">
          Showing {paginatedQuestions.length} of {filteredAndSortedQuestions.length} questions
          {searchTerm && ` for "${searchTerm}"`}
          {selectedCategory !== "all" && ` in ${selectedCategory}`}
        </div>
      </div>

      {/* Questions Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white rounded-lg border p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : paginatedQuestions.length > 0 ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {paginatedQuestions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <div className="flex space-x-1">
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                    className="w-10"
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No questions found</div>
          <div className="text-gray-400 text-sm">
            {searchTerm || selectedCategory !== "all"
              ? "Try adjusting your search or filters"
              : "Be the first to ask a question!"}
          </div>
        </div>
      )}
    </div>
  )
}
