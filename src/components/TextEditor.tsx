import { useState, useEffect } from 'react'

interface TextEditorProps {
  onTextChange: (text: string) => void
}

export function TextEditor({ onTextChange }: TextEditorProps) {
  const [text, setText] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      onTextChange(text)
    }, 300)
    return () => clearTimeout(timer)
  }, [text, onTextChange])

  return (
    <div className="w-full">
      <label htmlFor="braille-input" className="block text-sm font-medium mb-2">
        Input Text
      </label>
      <textarea
        id="braille-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste text here..."
        className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Text input for braille conversion"
      />
      <p className="text-xs text-muted-foreground mt-1">
        {text.length} characters
      </p>
    </div>
  )
}
