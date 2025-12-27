"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { GenericFormView, FormSection } from "@/shared/components/forms/generic-form-view"
import { z } from "zod"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { useState, useRef, useEffect } from "react"

interface GenericFormDialogProps<T extends z.ZodType<any, any>> {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    subtitle?: string
    schema: T
    defaultValues?: any
    sections: FormSection[]
    onSubmit: (data: z.infer<T>) => Promise<void>
    onSuccess?: () => void
    submitLabel?: string
    successMessage?: string
    errorMessage?: string
    isLoading?: boolean
}

/**
 * Generic dialog component để thêm/sửa entity với form
 * Có thể tái sử dụng cho bất kỳ entity nào
 */
export function GenericFormDialog<T extends z.ZodType<any, any>>({
    open,
    onOpenChange,
    title,
    subtitle,
    schema,
    defaultValues,
    sections,
    onSubmit,
    onSuccess,
    submitLabel = "Lưu",
    successMessage = "Lưu thành công",
    errorMessage = "Có lỗi xảy ra khi lưu dữ liệu",
    isLoading = false
}: GenericFormDialogProps<T>) {
    const formRef = useRef<HTMLDivElement>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSuccess = async () => {
        if (onSuccess) {
            await onSuccess()
        }
        onOpenChange(false)
    }

    const handleSubmit = async (data: z.infer<T>) => {
        setIsSubmitting(true)
        try {
            await onSubmit(data)
            await handleSuccess()
        } catch (error) {
            console.error("Form submission error:", error)
            setIsSubmitting(false)
            throw error
        }
    }

    const handleCancel = () => {
        onOpenChange(false)
    }

    // Monitor form submission state
    useEffect(() => {
        if (!formRef.current || !open) return

        const form = formRef.current.querySelector('form')
        if (!form) return

        const checkState = () => {
            const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement
            if (submitBtn) {
                setIsSubmitting(submitBtn.disabled)
            }
        }

        checkState()

        const observer = new MutationObserver(checkState)
        const submitBtn = form.querySelector('button[type="submit"]')
        if (submitBtn) {
            observer.observe(submitBtn, { 
                attributes: true, 
                attributeFilter: ['disabled'],
                childList: false,
                subtree: false
            })
        }

        const handleSubmit = () => setIsSubmitting(true)
        form.addEventListener('submit', handleSubmit)

        return () => {
            observer.disconnect()
            form.removeEventListener('submit', handleSubmit)
        }
    }, [open])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent 
                className="!max-w-[1200px] !w-[90vw] max-w-[90vw] max-h-[95vh] p-0 flex flex-col"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
                    <DialogTitle className="text-xl">{title}</DialogTitle>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                    )}
                </DialogHeader>
                
                <div className="flex-1 overflow-hidden min-h-0">
                    <ScrollArea className="h-full">
                        <div className="px-6 py-4">
                            <div ref={formRef}>
                                <GenericFormView
                                    title=""
                                    subtitle=""
                                    schema={schema}
                                    defaultValues={defaultValues}
                                    sections={sections}
                                    onSubmit={handleSubmit}
                                    onSuccess={handleSuccess}
                                    onCancel={handleCancel}
                                    submitLabel={submitLabel}
                                    successMessage={successMessage}
                                    errorMessage={errorMessage}
                                    hideHeader={true}
                                    hideFooter={true}
                                />
                            </div>
                        </div>
                    </ScrollArea>
                </div>

                <DialogFooter className="px-6 py-4 border-t flex-shrink-0 bg-background">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleCancel}
                        disabled={isSubmitting || isLoading}
                    >
                        Hủy bỏ
                    </Button>
                    <LoadingButton 
                        type="button"
                        isLoading={isSubmitting || isLoading}
                        loadingText={submitLabel}
                        onClick={() => {
                            if (formRef.current) {
                                const form = formRef.current.querySelector('form') as HTMLFormElement
                                if (form) {
                                    setIsSubmitting(true)
                                    form.requestSubmit()
                                }
                            }
                        }}
                    >
                        {submitLabel}
                    </LoadingButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

