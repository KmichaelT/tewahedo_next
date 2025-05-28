"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export function AskQuestionForm() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Reset form
    setTitle("")
    setContent("")
    setIsSubmitting(false)

    alert("Question submitted successfully!")
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Ask Your Question</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Question Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="What would you like to know?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
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
            />
          </div>

          <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Question"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
