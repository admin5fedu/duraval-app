"use client"

import { Button } from "@/components/ui/button"
import { ZoomableAvatar } from "@/components/ui/zoomable-avatar"
import { ArrowLeft } from "lucide-react"
import type { DetailHeaderSectionProps } from "../types"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

/**
 * Header section component for GenericDetailView
 * Displays back button, avatar, title, subtitle, and actions
 * Mobile-optimized: Actions hiển thị trực tiếp trên mobile để dễ truy cập
 */
export function DetailHeaderSection({
    title,
    subtitle,
    avatarUrl,
    onBack,
    actions,
}: DetailHeaderSectionProps) {
    const isMobile = useIsMobile()
    
    return (
        <div className={cn(
            "flex flex-col sm:flex-row sm:items-center sm:justify-between",
            "gap-3 sm:gap-4",
            "mb-4 sm:mb-6"
        )}>
            <div className={cn(
                "flex items-center",
                "gap-3 sm:gap-4",
                "min-w-0 flex-1"
            )}>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onBack}
                    className={cn(
                        "shrink-0",
                        isMobile ? "h-9 w-9" : "h-8 w-8"
                    )}
                >
                    <ArrowLeft className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
                </Button>
                <ZoomableAvatar
                    src={avatarUrl}
                    alt={title}
                    className={cn(
                        "border shadow-sm shrink-0",
                        isMobile ? "h-12 w-12" : "h-16 w-16"
                    )}
                    fallback={
                        <span className={cn(
                            "bg-primary/10 text-primary font-semibold",
                            isMobile ? "text-sm" : "text-lg"
                        )}>
                            {title.charAt(0).toUpperCase()}
                        </span>
                    }
                />
                <div className="min-w-0 flex-1">
                    <h1 className={cn(
                        "font-bold truncate",
                        isMobile ? "text-lg" : "text-2xl"
                    )}>
                        {title}
                    </h1>
                    {subtitle && (
                        <p className={cn(
                            "text-muted-foreground truncate",
                            isMobile ? "text-xs" : "text-sm"
                        )}>
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {actions && (
                <div className={cn(
                    "flex items-center",
                    "justify-end sm:justify-end",
                    "w-full sm:w-auto",
                    isMobile ? "gap-2" : "gap-2"
                )}>
                    {actions}
                </div>
            )}
        </div>
    )
}

