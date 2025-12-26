"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ZoomableAvatar } from "@/components/ui/zoomable-avatar"
import { ArrowLeft, MoreVertical } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { pageTitleClass, responsiveTextClass } from "@/shared/utils/text-styles"
import { toolbarGapClass } from "@/shared/utils/toolbar-styles"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

interface DetailHeaderProps {
  title: string
  subtitle?: string
  avatarUrl?: string | null
  onBack: () => void
  actions?: React.ReactNode
}

/**
 * Component để render header của detail view
 * Mobile-optimized: Actions được gom vào dropdown menu trên mobile
 */
export function DetailHeader({
  title,
  subtitle,
  avatarUrl,
  onBack,
  actions
}: DetailHeaderProps) {
  const isMobile = useIsMobile()
  
  return (
    <TooltipProvider>
      <div className={cn(
        "sticky top-0 z-40",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "border-b",
        "py-3 sm:py-4",
        "flex flex-col md:flex-row md:items-center md:justify-between",
        "transition-all",
        "print:static print:border-b-2 print:mb-4",
        "shadow-sm",
        "-mx-3 md:-mx-4 px-3 md:px-4",
        "mb-4 sm:mb-6 md:mb-8",
        "gap-3 sm:gap-4"
      )}>
        {/* Left section: Back + Avatar + Title */}
        <div className={cn("flex items-center gap-3 sm:gap-4", "min-w-0 flex-1")}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onBack} 
                className={cn(
                  "shrink-0 rounded-full print:hidden",
                  isMobile ? "h-9 w-9" : "h-8 w-8"
                )}
                aria-label="Quay lại"
              >
                <ArrowLeft className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Quay lại (Esc)</p>
            </TooltipContent>
          </Tooltip>
          
          <div className={cn("flex items-center gap-3 sm:gap-4", "min-w-0 flex-1")}>
            <ZoomableAvatar
              src={avatarUrl}
              alt={title}
              className={cn(
                "border shadow-sm shrink-0",
                isMobile ? "h-11 w-11" : "h-9 w-9 sm:h-10 sm:w-10"
              )}
              fallback={
                <span className={cn(
                  "bg-primary/10 text-primary font-semibold",
                  responsiveTextClass()
                )}>
                  {title.charAt(0).toUpperCase()}
                </span>
              }
            />
            <div className="min-w-0 flex-1">
              <h1 className={cn(
                pageTitleClass("text-foreground truncate"),
                isMobile && "text-lg"
              )}>
                {title}
              </h1>
              {subtitle && (
                <p className={cn(
                  responsiveTextClass(),
                  "text-muted-foreground truncate",
                  isMobile && "text-xs"
                )}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Right section: Actions */}
        <div className={cn(
          "flex items-center",
          "justify-end",
          "w-full md:w-auto",
          "print:hidden",
          toolbarGapClass()
        )}>
          {isMobile && actions ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreVertical className="h-5 w-5" />
                  <span className="sr-only">Tùy chọn</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {React.Children.map(actions, (child, index) => {
                  if (React.isValidElement(child)) {
                    // Extract onClick and children from button
                    const buttonProps = child.props
                    return (
                      <DropdownMenuItem
                        key={index}
                        onClick={(e) => {
                          e.preventDefault()
                          // Trigger click on the original button
                          if (buttonProps?.onClick) {
                            buttonProps.onClick(e)
                          }
                        }}
                      >
                        {buttonProps?.children || `Action ${index + 1}`}
                      </DropdownMenuItem>
                    )
                  }
                  return null
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            actions
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}

