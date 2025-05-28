import { QuestionDetail } from "@/components/question-detail"

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <QuestionDetail questionId={Number.parseInt(id)} />
      </div>
    </div>
  )
}