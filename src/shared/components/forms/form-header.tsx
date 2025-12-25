"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { ArrowLeft } from "lucide-react"
import { pageTitleClass, bodyTextClass } from "@/shared/utils/text-styles"
import { toolbarGapClass, actionButtonClass } from "@/shared/utils/toolbar-styles"
import { cn } from "@/lib/utils"

interface FormHeaderProps {
    title: string
    subtitle?: string
    onCancel: () => void
    submitLabel?: string
    isSubmitting?: boolean
}

/**
 * Component để render header của form view
 */
export function FormHeader({
    title,
    subtitle,
    onCancel,
    submitLabel = "Lưu thay đổi",
    isSubmitting = false
}: FormHeaderProps) {
    return (
        <div className="sticky top-0 z-40 -mx-4 px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b py-4 flex items-center justify-between transition-all shadow-sm">
            <div className="flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    type="button" 
                    onClick={onCancel} 
                    className="shrink-0 rounded-full h-8 w-8"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className={pageTitleClass("text-foreground")}>{title}</h1>
                    {subtitle && <p className={cn(bodyTextClass(), "text-muted-foreground")}>{subtitle}</p>}
                </div>
            </div>
            <div className={cn("flex items-center", toolbarGapClass())}>
                <Button variant="outline" type="button" className={actionButtonClass()} onClick={onCancel}>
                    Hủy bỏ
                </Button>
                <LoadingButton
                    type="submit"
                    isLoading={isSubmitting}
                    loadingText="Đang lưu..."
                    className={actionButtonClass()}
                >
                    {submitLabel}
                </LoadingButton>
            </div>
        </div>
    )
}

