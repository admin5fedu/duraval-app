"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
                {avatarUrl && (
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={avatarUrl} alt={title} />
                        <AvatarFallback>{title.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                )}
                <div>
                    <h1 className="text-2xl font-bold">{title}</h1>
                    {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                </div>
            </div>
            {actions}
        </div>
    )
}

