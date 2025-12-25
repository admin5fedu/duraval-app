"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface RichTextEditorProps extends Omit<React.ComponentProps<typeof Textarea>, "onChange"> {
    value?: string
    onChange?: (value: string) => void
    placeholder?: string
    minHeight?: string
}

/**
 * Simple Rich Text Editor component
 * 
 * Note: For a full-featured rich text editor, consider using:
 * - Tiptap (https://tiptap.dev/)
 * - React Quill (https://github.com/zenoamaro/react-quill)
 * - Lexical (https://lexical.dev/)
 * 
 * This is a basic implementation using textarea.
 * For production, you should integrate a proper rich text editor library.
 */
export function RichTextEditor({
    value = "",
    onChange,
    placeholder = "Nhập nội dung...",
    minHeight = "200px",
    className,
    ...props
}: RichTextEditorProps) {
    return (
        <Textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className={cn("resize-none", className)}
            style={{ minHeight }}
            {...props}
        />
    )
}

