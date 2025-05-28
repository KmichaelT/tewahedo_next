import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">About Tewahedo Answers</h1>
        <div className="prose max-w-none">
          <p className="text-lg mb-6">
            Welcome to Tewahedo Answers, a community-driven platform dedicated to answering questions about the
            Ethiopian Orthodox Tewahedo Church.
          </p>
          <p className="mb-6">
            Our mission is to provide accurate, thoughtful answers to questions about our faith, traditions, and
            practices, fostering understanding and spiritual growth within our community.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
