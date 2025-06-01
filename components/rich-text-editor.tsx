// components/rich-text-editor.tsx
"use client"

import { useCallback, useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Bold, Italic, List, ListOrdered, Quote, 
  Link, Heading2, Heading3, Eye, EyeOff, Type,
  Undo, Redo, AlignLeft, AlignCenter, AlignRight,
  Strikethrough, Code, Minus, Image, Palette
} from "lucide-react"
import { RichTextDisplay } from "./rich-text-display"
import { cn } from "@/lib/utils"

interface ToolbarButton {
  icon: any
  command?: string
  value?: string
  title: string
  group: string
  action?: () => void
  prompt?: string
}

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
  const [showColorPicker, setShowColorPicker] = useState(false)

  // Predefined colors for text highlighting
  const highlightColors = [
    { name: 'Yellow', value: '#fef3c7', text: '#92400e' },
    { name: 'Blue', value: '#dbeafe', text: '#1e40af' },
    { name: 'Green', value: '#d1fae5', text: '#065f46' },
    { name: 'Pink', value: '#fce7f3', text: '#be185d' },
    { name: 'Purple', value: '#e9d5ff', text: '#7c2d12' },
    { name: 'Orange', value: '#fed7aa', text: '#c2410c' },
  ]

  // Set initial content and update when value changes externally
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      // Only update if the content is different and not currently focused
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value
      }
    }
  }, [value])

  const executeCommand = useCallback((command: string, value?: string | null) => {
    if (typeof document !== 'undefined') {
      document.execCommand(command, false, value || undefined)
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

  const insertHorizontalRule = useCallback(() => {
    executeCommand('insertHorizontalRule')
  }, [executeCommand])

  const insertImage = useCallback(() => {
    const url = prompt('Enter image URL:')
    if (url) {
      executeCommand('insertImage', url)
    }
  }, [executeCommand])

  const applyHighlight = useCallback((color: string) => {
    executeCommand('hiliteColor', color)
    setShowColorPicker(false)
  }, [executeCommand])

  const removeFormatting = useCallback(() => {
    executeCommand('removeFormat')
  }, [executeCommand])

  // Enhanced toolbar with more formatting options
  const toolbarButtons = [
    // Format group
    { icon: Bold, command: 'bold', title: 'Bold (Ctrl+B)', group: 'format' },
    { icon: Italic, command: 'italic', title: 'Italic (Ctrl+I)', group: 'format' },
    { icon: Strikethrough, command: 'strikeThrough', title: 'Strikethrough', group: 'format' },
    { icon: Code, command: 'formatBlock', value: 'code', title: 'Inline Code', group: 'format' },
    
    // Structure group
    { icon: Heading2, command: 'formatBlock', value: 'h2', title: 'Heading 2', group: 'structure' },
    { icon: Heading3, command: 'formatBlock', value: 'h3', title: 'Heading 3', group: 'structure' },
    { icon: Type, command: 'formatBlock', value: 'p', title: 'Normal Text', group: 'structure' },
    { icon: Quote, action: insertBlockquote, title: 'Quote Block', group: 'structure' },
    
    // Alignment group
    { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left', group: 'align' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center', group: 'align' },
    { icon: AlignRight, command: 'justifyRight', title: 'Align Right', group: 'align' },
    
    // Lists group
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List', group: 'list' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List', group: 'list' },
    
    // Insert group
    { icon: Link, command: 'createLink', title: 'Insert Link', prompt: 'Enter URL:', group: 'insert' },
    { icon: Image, action: insertImage, title: 'Insert Image', group: 'insert' },
    { icon: Minus, action: insertHorizontalRule, title: 'Horizontal Rule', group: 'insert' },
    
    // Actions group
    { icon: Undo, command: 'undo', title: 'Undo (Ctrl+Z)', group: 'action' },
    { icon: Redo, command: 'redo', title: 'Redo (Ctrl+Y)', group: 'action' },
  ]

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Allow common formatting shortcuts that are in our toolbar
    if ((e.ctrlKey || e.metaKey)) {
      switch (e.key.toLowerCase()) {
        case 'b': // Bold
        case 'i': // Italic
        case 'z': // Undo
        case 'y': // Redo
          return // Allow these shortcuts
      }
    }
    
    // Prevent manual formatting shortcuts that aren't in our toolbar
    const forbiddenShortcuts = [
      'KeyU', // Underline
      'KeyE', // Center align (we have our own)
      'KeyL', // Left align (we have our own)
      'KeyR', // Right align (we have our own)
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
            {/* Enhanced Toolbar - organized by groups */}
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
                        if (value) executeCommand(button.command || '', value)
                      } else {
                        executeCommand(button.command || '', button.value || undefined)
                      }
                    }}
                  >
                    <button.icon className="h-4 w-4" />
                  </Button>
                ))}
                
                {/* Color Highlight Tool */}
                <div className="relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Highlight Text"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  >
                    <Palette className="h-4 w-4" />
                  </Button>
                  
                  {showColorPicker && (
                    <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <div className="text-xs text-gray-500 mb-2">Highlight:</div>
                      <div className="grid grid-cols-3 gap-1">
                        {highlightColors.map((color) => (
                          <button
                            key={color.name}
                            className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                            onClick={() => applyHighlight(color.value)}
                          />
                        ))}
                        <button
                          className="w-6 h-6 rounded border border-gray-300 bg-white hover:scale-110 transition-transform flex items-center justify-center"
                          title="Remove Highlight"
                          onClick={() => applyHighlight('')}
                        >
                          <span className="text-xs">×</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  title="Clear Formatting"
                  onClick={removeFormatting}
                >
                  Clear
                </Button>
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
                        executeCommand(button.command || '', button.value || undefined)
                      }
                    }}
                  >
                    <button.icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>

              {/* Alignment */}
              <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200">
                <span className="text-xs text-gray-500 mr-2 self-center">Align:</span>
                {toolbarButtons.filter(btn => btn.group === 'align').map((button, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title={button.title}
                    onClick={() => executeCommand(button.command || '')}
                  >
                    <button.icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>

              {/* Lists, Insert, and Actions */}
              <div className="flex flex-wrap gap-1 p-2">
                <span className="text-xs text-gray-500 mr-2 self-center">Lists & Insert:</span>
                {toolbarButtons.filter(btn => ['list', 'insert'].includes(btn.group)).map((button, index) => (
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
                        if (value) executeCommand(button.command || '', value)
                      } else {
                        executeCommand(button.command || '', button.value || undefined)
                      }
                    }}
                  >
                    <button.icon className="h-4 w-4" />
                  </Button>
                ))}
                
                <div className="border-l border-gray-300 mx-2"></div>
                
                <span className="text-xs text-gray-500 mr-2 self-center">Actions:</span>
                {toolbarButtons.filter(btn => btn.group === 'action').map((button, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title={button.title}
                    onClick={() => executeCommand(button.command || '')}
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
                // New styles for enhanced features
                "prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono",
                "prose-hr:border-gray-300 prose-hr:my-8",
                "prose-img:rounded-lg prose-img:max-w-full prose-img:h-auto prose-img:mx-auto prose-img:shadow-md",
                "[&_s]:line-through [&_s]:text-gray-500", // Strikethrough
                "[&_.text-center]:text-center [&_.text-right]:text-right [&_.text-left]:text-left", // Alignment
                "[&:empty]:before:content-[attr(data-placeholder)]",
                "[&:empty]:before:text-gray-400"
              )}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              data-placeholder={placeholder}
              suppressContentEditableWarning={true}
              onClick={() => setShowColorPicker(false)} // Close color picker when clicking in editor
            />
          </>
        ) : (
          /* Preview */
          <div className="border border-gray-200 rounded-md p-4 min-h-[300px] bg-gray-50">
            <div className="mb-2 text-sm font-medium text-gray-600">Preview:</div>
            <RichTextDisplay content={value || `<p class="text-gray-400">${placeholder}</p>`} />
          </div>
        )}

        {/* Enhanced Helper Text */}
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Formatting Guidelines:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Text Formatting:</strong> Use bold, italic, strikethrough, and highlighting for emphasis</li>
            <li><strong>Structure:</strong> H2 for main sections, H3 for subsections, quotes for references</li>
            <li><strong>Alignment:</strong> Left, center, or right align your content as needed</li>
            <li><strong>Lists:</strong> Use bullet points or numbered lists for organization</li>
            <li><strong>Media:</strong> Insert images and horizontal rules to enhance your content</li>
            <li><strong>Shortcuts:</strong> Ctrl+B (bold), Ctrl+I (italic), Ctrl+Z (undo), Ctrl+Y (redo)</li>
            <li><strong>Paste:</strong> Content will be converted to plain text automatically</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}