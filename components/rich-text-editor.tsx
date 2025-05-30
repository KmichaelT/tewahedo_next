// components/rich-text-editor.tsx
"use client"

import { useCallback, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Bold, Italic, List, ListOrdered, Quote, 
  Link, Heading3, Table, Code, Undo, Redo,
  Eye, EyeOff
} from "lucide-react"
import { RichTextDisplay } from "./rich-text-display"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  label?: string
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Write your answer...",
  className,
  label = "Answer Content"
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [showPreview, setShowPreview] = useState(false)

  const executeCommand = useCallback((command: string, value?: string) => {
    if (typeof document !== 'undefined') {
      document.execCommand(command, false, value)
    }
    editorRef.current?.focus()
    
    // Update parent with new content
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const insertTable = useCallback(() => {
    const tableHTML = `
      <table>
        <tr>
          <th>Column 1</th>
          <th>Column 2</th>
        </tr>
        <tr>
          <td>Cell 1</td>
          <td>Cell 2</td>
        </tr>
      </table>
    `
    if (typeof document !== 'undefined') {
      document.execCommand('insertHTML', false, tableHTML)
    }
    handleInput()
  }, [handleInput])

  const insertBlockquote = useCallback(() => {
    executeCommand('formatBlock', 'blockquote')
  }, [executeCommand])

  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: 'Bold (Ctrl+B)' },
    { icon: Italic, command: 'italic', title: 'Italic (Ctrl+I)' },
    { icon: Heading3, command: 'formatBlock', value: 'h3', title: 'Heading 3' },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { icon: Quote, action: insertBlockquote, title: 'Quote' },
    { icon: Link, command: 'createLink', title: 'Insert Link', prompt: 'Enter URL:' },
    { icon: Table, action: insertTable, title: 'Insert Table' },
    { icon: Code, command: 'formatBlock', value: 'pre', title: 'Code Block' },
    { icon: Undo, command: 'undo', title: 'Undo' },
    { icon: Redo, command: 'redo', title: 'Redo' },
  ]

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{label}</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="ml-1">{showPreview ? 'Edit' : 'Preview'}</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {!showPreview ? (
          <>
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 border border-gray-200 rounded-t-md bg-gray-50">
              {toolbarButtons.map((button, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title={button.title}
                  onClick={() => {
                    if (button.action) {
                      button.action()
                    } else if (button.prompt) {
                      const value = prompt(button.prompt)
                      if (value) executeCommand(button.command, value)
                    } else {
                      executeCommand(button.command, button.value)
                    }
                  }}
                >
                  <button.icon className="h-4 w-4" />
                </Button>
              ))}
            </div>

            {/* Editor */}
            <div
              ref={editorRef}
              contentEditable
              className={cn(
                "min-h-[300px] p-4 border border-gray-200 rounded-b-md",
                "prose prose-sm max-w-none focus:outline-none focus:ring-2 focus:ring-orange-500",
                "prose-headings:text-gray-900 prose-p:text-gray-700",
                "prose-strong:text-gray-900 prose-em:text-gray-800",
                "prose-blockquote:border-l-4 prose-blockquote:border-orange-500",
                "prose-blockquote:bg-orange-50 prose-blockquote:pl-4",
                "[&:empty]:before:content-[attr(data-placeholder)]",
                "[&:empty]:before:text-gray-400"
              )}
              dangerouslySetInnerHTML={{ __html: value }}
              onInput={handleInput}
              data-placeholder={placeholder}
              suppressContentEditableWarning={true}
            />
          </>
        ) : (
          /* Preview */
          <div className="border border-gray-200 rounded-md p-4 min-h-[300px] bg-gray-50">
            <div className="mb-2 text-sm font-medium text-gray-600">Preview:</div>
            <RichTextDisplay content={value || `<p class="text-gray-400">${placeholder}</p>`} />
          </div>
        )}

        {/* Helper Text */}
        <div className="text-xs text-gray-500">
          <strong>Formatting tips:</strong> Use the toolbar buttons above or keyboard shortcuts. 
          Ctrl+B for bold, Ctrl+I for italic. Click Preview to see how your answer will appear.
        </div>
      </CardContent>
    </Card>
  )
}

