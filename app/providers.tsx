"use client"

import type React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SessionProvider } from "next-auth/react"
import { useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  )

  return (
    <SessionProvider
      // Reduce refetch frequency to avoid overwhelming the API
      refetchInterval={5 * 60} // 5 minutes
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
      // Add base path for NextAuth
      basePath="/api/auth"
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SessionProvider>
  )
}
