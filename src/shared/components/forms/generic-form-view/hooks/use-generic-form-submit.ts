"use client"

import { useState, useCallback, startTransition } from "react"
import { toast } from "sonner"
import { z } from "zod"
import type { UseFormReturn } from "react-hook-form"
import type { GenericFormViewProps } from "../types"

/**
 * Hook to handle form submission logic
 */
export function useGenericFormSubmit<T extends z.ZodType<any, any>>(
    _form: UseFormReturn<z.infer<T>>,
    {
        onSubmit,
        onSuccess,
        successMessage = "Lưu thành công",
        errorMessage = "Có lỗi xảy ra khi lưu dữ liệu",
        handleCancel,
    }: Pick<GenericFormViewProps<T>, "onSubmit" | "onSuccess" | "successMessage" | "errorMessage"> & {
        handleCancel: () => void
    }
) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = useCallback(
        async (data: z.infer<T>) => {
            if (isSubmitting) return // Prevent double submission

            setIsSubmitting(true)
            try {
                await onSubmit(data)

                // Show success message
                toast.success(successMessage)

                // Reset submitting state before navigation
                setIsSubmitting(false)

                // Call onSuccess callback if provided (for navigation)
                if (onSuccess) {
                    // Use startTransition for navigation to avoid blocking UI
                    startTransition(() => {
                        void onSuccess()
                    })
                } else {
                    handleCancel()
                }
            } catch (error: any) {
                console.error("Form submission error:", error)
                setIsSubmitting(false)

                // Show error message with better formatting
                let errorMsg = errorMessage
                if (error instanceof Error) {
                    errorMsg = error.message || errorMessage
                } else if (typeof error === 'string') {
                    errorMsg = error
                } else if (error?.message) {
                    errorMsg = error.message
                }

                toast.error(errorMsg, {
                    description: error?.details || 'Vui lòng kiểm tra lại thông tin và thử lại',
                    duration: 5000,
                })
            }
        },
        [isSubmitting, onSubmit, onSuccess, successMessage, errorMessage, handleCancel]
    )

    return {
        isSubmitting,
        handleSubmit,
    }
}

