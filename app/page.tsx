import { HeroSection } from "@/components/hero-section"
import { QuestionsList } from "@/components/questions-list"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <QuestionsList />
    </div>
  )
}
