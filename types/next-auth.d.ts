import type { DefaultSession } from "next-auth"

type UserId = string

declare module "next-auth/jwt" {
  interface JWT {
    id: UserId
    isAdmin?: boolean
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: UserId
      isAdmin?: boolean
    } & DefaultSession["user"]
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      isAdmin?: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isAdmin?: boolean
  }
}
