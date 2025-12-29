"use client"

import { useEffect } from "react"
import type { UseFormReturn } from "react-hook-form"
import { z } from "zod"

/**
 * Hook to handle keyboard shortcuts for forms
 * - Ctrl+S / Cmd+S: Submit form
 * - Esc: Cancel (only if not typing in input/textarea)
 */
export function useFormKeyboardShortcuts<T extends z.ZodType<any, any>>(
    formRef: React.RefObject<HTMLFormElement>,
    form: UseFormReturn<z.infer<T>>,
    handleSubmit: (data: z.infer<T>) => Promise<void>,
    handleCancel: () => void,
    isSubmitting: boolean
) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+S or Cmd+S to submit
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault()
                if (!isSubmitting && formRef.current) {
                    form.handleSubmit(handleSubmit)()
                }
            }
            // Esc to cancel (only if not typing in input/textarea)
            if (e.key === 'Escape') {
                const target = e.target as HTMLElement
                const isInputFocused = target.tagName === 'INPUT' || 
                                      target.tagName === 'TEXTAREA' || 
                                      target.isContentEditable

                if (!isInputFocused) {
                    handleCancel()
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isSubmitting, form, handleSubmit, handleCancel])
}

