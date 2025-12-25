"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface GenericChartCardProps {
    title: string
    description?: string
    children: React.ReactNode
    className?: string
    actions?: React.ReactNode
    footer?: React.ReactNode
}

export function GenericChartCard({
    title,
    description,
    children,
    className,
    actions,
    footer,
}: GenericChartCardProps) {
    return (
        <Card className={cn("", className)}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        {description && (
                            <CardDescription className="mt-1">{description}</CardDescription>
                        )}
                    </div>
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </div>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
            {footer && (
                <div className="px-6 pb-6">
                    {footer}
                </div>
            )}
        </Card>
    )
}

