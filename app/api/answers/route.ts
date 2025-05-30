import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// GET method remains the same for fetching answers
export async function GET(request: NextRequest) {
  // This method can remain as it was for fetching answers
  // (keeping the existing GET functionality)
  return NextResponse.json({ error: "Method not implemented" }, { status: 501 })
}

// Prevent regular users from creating answers - only admins through admin panel
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" }, 
        { status: 401 }
      )
    }

    // Only allow admins, but redirect them to use the admin panel
    if (!session.user.isAdmin) {
      return NextResponse.json(
        { 
          error: "Only administrators can provide answers to questions",
          message: "Answers are provided by church leaders through the administrative review process"
        }, 
        { status: 403 }
      )
    }

    // Even for admins, direct them to use the admin panel
    return NextResponse.json(
      { 
        error: "Please use the admin dashboard to provide answers",
        message: "Answers should be submitted through the admin panel for proper workflow management",
        redirectTo: "/admin/questions"
      }, 
      { status: 403 }
    )

  } catch (error) {
    console.error("Error in answers route:", error)
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    )
  }
}