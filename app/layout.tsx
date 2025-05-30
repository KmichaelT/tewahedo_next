import type React from "react"
import type { Metadata } from "next"
import { Work_Sans } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"

const workSans = Work_Sans({ 
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-work-sans"
})

export const metadata: Metadata = {
  title: "Tewahedo Answers - Ethiopian Orthodox Forum",
  description: "A community forum for Ethiopian Orthodox Tewahedo Church questions and answers",
  keywords: ["Ethiopian Orthodox", "Tewahedo", "Christianity", "Forum", "Questions", "Answers"],
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
      </head>
      <body className={workSans.className} suppressHydrationWarning={true}>
        <Providers>
          <div className="min-h-screen  flex flex-col">
            <Navbar />
            <main className="flex-1 bg-gray-50">
              <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {children}
              </div>
              </main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}