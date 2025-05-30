// components/rich-text-display.tsx
"use client"

import { cn } from "@/lib/utils"

interface RichTextDisplayProps {
  content: string
  className?: string
}

export function RichTextDisplay({ content, className }: RichTextDisplayProps) {
  return (
    <div 
      className={cn(
        "prose prose-gray max-w-none",
        "prose-headings:text-gray-900 prose-headings:font-semibold",
        "prose-p:text-gray-700 prose-p:leading-relaxed",
        "prose-strong:text-gray-900 prose-strong:font-semibold",
        "prose-em:text-gray-800 prose-em:italic",
        "prose-ul:list-disc prose-ol:list-decimal",
        "prose-li:text-gray-700 prose-li:my-1",
        "prose-blockquote:border-l-4 prose-blockquote:border-orange-500",
        "prose-blockquote:bg-orange-50 prose-blockquote:p-4",
        "prose-blockquote:my-4 prose-blockquote:italic",
        "prose-blockquote:text-orange-800",
        "prose-table:border-collapse prose-table:w-full",
        "prose-th:border prose-th:border-gray-300 prose-th:bg-gray-100",
        "prose-th:p-2 prose-th:text-left prose-th:font-semibold",
        "prose-td:border prose-td:border-gray-300 prose-td:p-2",
        "prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3",
        "prose-a:text-orange-600 prose-a:underline hover:prose-a:text-orange-800",
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

