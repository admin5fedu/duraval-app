"use client"

import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { ArrowLeft } from "lucide-react"
import { pageTitleClass, bodyTextClass } from "@/shared/utils/text-styles"
import { toolbarGapClass, actionButtonClass } from "@/shared/utils/toolbar-styles"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

interface FormHeaderProps {
    title: string
    subtitle?: string
    onCancel: () => void
    submitLabel?: string
    isSubmitting?: boolean
}

/**
 * Component để render header của form view
 * Mobile-optimized: Better layout, larger buttons, responsive text sizes
 */
export function FormHeader({
    title,
    subtitle,
    onCancel,
    submitLabel = "Lưu thay đổi",
    isSubmitting = false
}: FormHeaderProps) {
    const isMobile = useIsMobile()
    
    return (
        <div className={cn(
            "sticky top-0 z-40",
            "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
            "border-b",
            "py-3 sm:py-4",
            "flex flex-col sm:flex-row sm:items-center sm:justify-between",
            "transition-all shadow-sm",
            "-mx-3 md:-mx-4 px-3 md:px-4",
            "gap-3 sm:gap-4"
        )}>
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    type="button" 
                    onClick={onCancel} 
                    className={cn(
                        "shrink-0 rounded-full",
                        isMobile ? "h-9 w-9" : "h-8 w-8"
                    )}
                >
                    <ArrowLeft className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
                </Button>
                <div className="min-w-0 flex-1">
                    <h1 className={cn(
                        pageTitleClass("text-foreground truncate"),
                        isMobile && "text-lg"
                    )}>
                        {title}
                    </h1>
                    {subtitle && (
                        <p className={cn(
                            bodyTextClass(),
                            "text-muted-foreground truncate",
                            isMobile && "text-xs"
                        )}>
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            <div className={cn(
                "flex items-center",
                "w-full sm:w-auto",
                "justify-end sm:justify-end",
                toolbarGapClass()
            )}>
                <Button 
                    variant="outline" 
                    type="button" 
                    className={cn(
                        actionButtonClass(),
                        isMobile && "flex-1 sm:flex-initial h-10"
                    )} 
                    onClick={onCancel}
                >
                    Hủy bỏ
                </Button>
                <LoadingButton
                    type="submit"
                    isLoading={isSubmitting}
                    loadingText="Đang lưu..."
                    className={cn(
                        actionButtonClass(),
                        isMobile && "flex-1 sm:flex-initial h-10"
                    )}
                >
                    {submitLabel}
                </LoadingButton>
            </div>
        </div>
    )
}

