// components/rich-text-editor.tsx
"use client"

import { useCallback, useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Bold, Italic, List, ListOrdered, Quote, 
  Link, Heading2, Heading3, Eye, EyeOff, Type
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

  // Set initial content and update when value changes externally
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      // Only update if the content is different and not currently focused
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value
      }
    }
  }, [value])

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
      const newContent = editorRef.current.innerHTML
      // Only update if content actually changed to prevent cursor jumping
      if (newContent !== value) {
        onChange(newContent)
      }
    }
  }, [onChange, value])

  const insertBlockquote = useCallback(() => {
    executeCommand('formatBlock', 'blockquote')
  }, [executeCommand])

  // Restricted toolbar with only approved formatting options
  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: 'Bold (Ctrl+B)', group: 'format' },
    { icon: Italic, command: 'italic', title: 'Italic (Ctrl+I)', group: 'format' },
    { icon: Heading2, command: 'formatBlock', value: 'h2', title: 'Heading 2', group: 'structure' },
    { icon: Heading3, command: 'formatBlock', value: 'h3', title: 'Heading 3', group: 'structure' },
    { icon: Type, command: 'formatBlock', value: 'p', title: 'Normal Text', group: 'structure' },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List', group: 'list' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List', group: 'list' },
    { icon: Quote, action: insertBlockquote, title: 'Quote Block', group: 'structure' },
    { icon: Link, command: 'createLink', title: 'Insert Link', prompt: 'Enter URL:', group: 'link' },
  ]

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Prevent manual formatting shortcuts that aren't in our toolbar
    const forbiddenShortcuts = [
      'KeyU', // Underline
      'KeyE', // Center align
      'KeyL', // Left align  
      'KeyR', // Right align
      'KeyJ', // Justify
    ]
    
    if ((e.ctrlKey || e.metaKey) && forbiddenShortcuts.includes(e.code)) {
      e.preventDefault()
    }
    
    // Prevent font size changes
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
      e.preventDefault()
    }
  }, [])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    
    // Get plain text content only
    const text = e.clipboardData.getData('text/plain')
    
    // Insert as plain text
    if (typeof document !== 'undefined') {
      document.execCommand('insertText', false, text)
    }
    
    handleInput()
  }, [handleInput])

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
            {/* Toolbar - organized by groups */}
            <div className="border border-gray-200 rounded-t-md bg-gray-50">
              {/* Text Formatting */}
              <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200">
                <span className="text-xs text-gray-500 mr-2 self-center">Format:</span>
                {toolbarButtons.filter(btn => btn.group === 'format').map((button, index) => (
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

              {/* Structure */}
              <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200">
                <span className="text-xs text-gray-500 mr-2 self-center">Structure:</span>
                {toolbarButtons.filter(btn => btn.group === 'structure').map((button, index) => (
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
                      } else {
                        executeCommand(button.command, button.value)
                      }
                    }}
                  >
                    <button.icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>

              {/* Lists and Links */}
              <div className="flex flex-wrap gap-1 p-2">
                <span className="text-xs text-gray-500 mr-2 self-center">Lists & Links:</span>
                {toolbarButtons.filter(btn => ['list', 'link'].includes(btn.group)).map((button, index) => (
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
            </div>

            {/* Editor */}
            <div
              ref={editorRef}
              contentEditable
              className={cn(
                "min-h-[300px] p-4 border border-gray-200 rounded-b-md",
                "focus:outline-none focus:ring-2 focus:ring-orange-500",
                "prose prose-sm max-w-none",
                // Custom typography styles that match site design
                "prose-headings:text-gray-900 prose-headings:font-semibold",
                "prose-h2:text-xl prose-h2:font-bold prose-h2:mt-6 prose-h2:mb-4 prose-h2:text-gray-900",
                "prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-4 prose-h3:mb-3 prose-h3:text-gray-800",
                "prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4",
                "prose-strong:text-gray-900 prose-strong:font-semibold",
                "prose-em:text-gray-800 prose-em:italic",
                "prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4",
                "prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4",
                "prose-li:text-gray-700 prose-li:mb-2",
                "prose-blockquote:border-l-4 prose-blockquote:border-orange-500",
                "prose-blockquote:bg-orange-50 prose-blockquote:p-4 prose-blockquote:my-4",
                "prose-blockquote:italic prose-blockquote:text-orange-800",
                "prose-a:text-orange-600 prose-a:underline hover:prose-a:text-orange-800",
                "[&:empty]:before:content-[attr(data-placeholder)]",
                "[&:empty]:before:text-gray-400"
              )}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
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
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Formatting Guidelines:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Use the toolbar buttons for all formatting - manual shortcuts are disabled</li>
            <li>Paste content will be converted to plain text automatically</li>
            <li>Headings: Use H2 for main sections, H3 for subsections</li>
            <li>Use quote blocks for scripture or important references</li>
            <li>Bold and italic should be used sparingly for emphasis</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}