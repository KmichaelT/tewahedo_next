// components/admin-answer-form.tsx
"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { RichTextEditor } from "./rich-text-editor"

interface AdminAnswerFormProps {
  questionId: number
  onSuccess?: () => void
}

export function AdminAnswerForm({ questionId, onSuccess }: AdminAnswerFormProps) {
  const [content, setContent] = useState("")
  const { data: session } = useSession()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const submitAnswer = useMutation({
    mutationFn: async (answerData: { questionId: number; content: string }) => {
      const response = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answerData),
      })
      if (!response.ok) throw new Error("Failed to submit answer")
      return response.json()
    },
    onSuccess: () => {
      toast({ title: "Answer submitted successfully!" })
      setContent("")
      queryClient.invalidateQueries({ queryKey: ["answers", questionId] })
      queryClient.invalidateQueries({ queryKey: ["questions"] })
      onSuccess?.()
    },
    onError: (error) => {
      toast({ 
        title: "Failed to submit answer", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      toast({ 
        title: "Please enter an answer", 
        variant: "destructive" 
      })
      return
    }

    submitAnswer.mutate({ questionId, content })
  }

  if (!session?.user?.isAdmin) {
    return null
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <RichTextEditor
        value={content}
        onChange={setContent}
        placeholder="Provide a detailed, helpful answer to this question. Use formatting to make your response clear and easy to read."
        label="Your Answer"
      />
      
      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => setContent("")}
          disabled={submitAnswer.isPending}
        >
          Clear
        </Button>
        <Button 
          type="submit"
          disabled={submitAnswer.isPending || !content.trim()}
        >
          {submitAnswer.isPending ? "Submitting..." : "Submit Answer"}
        </Button>
      </div>
    </form>
  )
}