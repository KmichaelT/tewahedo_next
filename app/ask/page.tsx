
import { AskQuestionForm } from "@/components/ask-question-form"
import { Footer } from "@/components/footer"
import { AuthGuard } from "@/components/auth-guard"

export default function AskQuestion() {
  return (
    <AuthGuard>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8"> 
          <AskQuestionForm />
        </div>
      </div>
    </AuthGuard>
  )
}
