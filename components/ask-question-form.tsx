"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export function AskQuestionForm() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState<string>("")
  const router = useRouter()
  const { toast } = useToast()

  const submitQuestion = useMutation({
    mutationFn: async (questionData: { title: string; content: string; category: string }) => {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to submit question")
      }
      
      return response.json()
    },
    onSuccess: () => {
      toast({
        title: "Question submitted successfully!",
        description: "Your question is pending review and will be published soon.",
      })
      // Reset form
      setTitle("")
      setContent("")
      setCategory("")
      // Redirect to home page
      router.push("/")
    },
    onError: (error) => {
      toast({
        title: "Failed to submit question",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!title.trim()) {
      toast({
        title: "Title is required",
        description: "Please enter a title for your question",
        variant: "destructive",
      })
      return
    }
    
    if (title.length < 5) {
      toast({
        title: "Title too short",
        description: "Title must be at least 5 characters long",
        variant: "destructive",
      })
      return
    }
    
    if (!content.trim()) {
      toast({
        title: "Content is required",
        description: "Please provide details for your question",
        variant: "destructive",
      })
      return
    }
    
    if (content.length < 10) {
      toast({
        title: "Content too short",
        description: "Question content must be at least 10 characters long",
        variant: "destructive",
      })
      return
    }
    
    if (!category) {
      toast({
        title: "Category is required",
        description: "Please select a category for your question",
        variant: "destructive",
      })
      return
    }

    submitQuestion.mutate({ title, content, category })
  }

  const categories = [
    { value: "Faith", label: "Faith & Doctrine" },
    { value: "Practices", label: "Church Practices" },
    { value: "Theology", label: "Theology" },
    { value: "History", label: "Church History" },
    { value: "General", label: "General Questions" },
  ]

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Ask Your Question</CardTitle>
        <p className="text-sm text-muted-foreground">
          Share your question about the Ethiopian Orthodox Tewahedo Church with our community.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Question Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="What would you like to know?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={5}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/200 characters (minimum 5)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Question Details</Label>
            <Textarea
              id="content"
              placeholder="Provide more details about your question..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              required
              minLength={10}
              maxLength={5000}
            />
            <p className="text-xs text-muted-foreground">
              {content.length}/5000 characters (minimum 10)
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Tips for asking good questions:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Be specific and clear about what you want to know</li>
              <li>• Provide context to help others understand your question</li>
              <li>• Search existing questions to avoid duplicates</li>
              <li>• Be respectful and follow church teachings</li>
            </ul>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-orange-600 hover:bg-orange-700" 
            disabled={submitQuestion.isPending}
          >
            {submitQuestion.isPending ? "Submitting..." : "Submit Question"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}