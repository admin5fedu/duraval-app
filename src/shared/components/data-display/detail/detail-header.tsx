"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ZoomableAvatar } from "@/components/ui/zoomable-avatar"
import { ArrowLeft } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { pageTitleClass, smallTextClass, responsiveTextClass } from "@/shared/utils/text-styles"
import { toolbarGapClass } from "@/shared/utils/toolbar-styles"
import { cn } from "@/lib/utils"

interface DetailHeaderProps {
  title: string
  subtitle?: string
  avatarUrl?: string | null
  onBack: () => void
  actions?: React.ReactNode
}

/**
 * Component để render header của detail view
 */
export function DetailHeader({
  title,
  subtitle,
  avatarUrl,
  onBack,
  actions
}: DetailHeaderProps) {
  return (
    <TooltipProvider>
      <div className={cn("sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b py-3 sm:py-4 flex flex-col md:flex-row md:items-center md:justify-between transition-all print:static print:border-b-2 print:mb-4 shadow-sm -mx-3 md:-mx-4 px-3 md:px-4 mb-6 sm:mb-8", "gap-3 sm:gap-4")}>
        <div className={cn("flex items-center", "gap-3 sm:gap-4")}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onBack} 
                className="shrink-0 rounded-full h-8 w-8 print:hidden"
                aria-label="Quay lại"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Quay lại (Esc)</p>
            </TooltipContent>
          </Tooltip>
          <div className={cn("flex items-center", "gap-3 sm:gap-4")}>
            <ZoomableAvatar
              src={avatarUrl}
              alt={title}
              className="h-9 w-9 sm:h-10 sm:w-10 border shadow-sm"
              fallback={
                <span className={cn("bg-primary/10 text-primary font-semibold", responsiveTextClass())}>
                  {title.charAt(0).toUpperCase()}
                </span>
              }
            />
            <div className="min-w-0">
              <h1 className={pageTitleClass("text-foreground truncate")}>{title}</h1>
              {subtitle && <p className={cn(responsiveTextClass(), "text-muted-foreground truncate")}>{subtitle}</p>}
            </div>
          </div>
        </div>
        <div className={cn("flex items-center flex-wrap justify-end w-full md:w-auto md:justify-end print:hidden", toolbarGapClass())}>
          {actions}
        </div>
      </div>
    </TooltipProvider>
  )
}

