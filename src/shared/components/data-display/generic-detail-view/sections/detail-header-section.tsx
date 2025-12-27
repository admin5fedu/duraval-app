"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ZoomableAvatar } from "@/components/ui/zoomable-avatar"
import { ArrowLeft } from "lucide-react"
import type { DetailHeaderSectionProps } from "../types"

/**
 * Header section component for GenericDetailView
 * Displays back button, avatar, title, subtitle, and actions
 */
export function DetailHeaderSection({
    title,
    subtitle,
    avatarUrl,
    onBack,
    actions,
}: DetailHeaderSectionProps) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <ZoomableAvatar
                    src={avatarUrl}
                    alt={title}
                    className="h-16 w-16 border shadow-sm"
                    fallback={
                        <span className="bg-primary/10 text-primary font-semibold text-lg">
                            {title.charAt(0).toUpperCase()}
                        </span>
                    }
                />
                <div>
                    <h1 className="text-2xl font-bold">{title}</h1>
                    {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                </div>
            </div>
            {actions}
        </div>
    )
}

