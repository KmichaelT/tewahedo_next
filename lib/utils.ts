import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert Firebase UID to numeric ID (simple hash function)
export function convertFirebaseUidToNumericId(uid: string): number {
  let hash = 0
  for (let i = 0; i < uid.length; i++) {
    const char = uid.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}
