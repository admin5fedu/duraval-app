"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { pageTitleClass, mediumTextClass, smallTextClass } from "@/shared/utils/text-styles"
import { formSectionGapClass, sectionSpacingClass } from "@/shared/utils/section-styles"
import { toolbarGapClass } from "@/shared/utils/toolbar-styles"

export interface MetricCard {
    title: string
    value: string | number
    change?: {
        value: number
        label: string
        trend: "up" | "down" | "neutral"
    }
    icon?: React.ComponentType<{ className?: string }>
    description?: string
}

export interface GenericDashboardProps {
    title?: string
    metrics?: MetricCard[]
    charts?: React.ReactNode[]
    actions?: React.ReactNode
    className?: string
}

export function GenericDashboard({
    title,
    metrics = [],
    charts = [],
    actions,
    className,
}: GenericDashboardProps) {
    return (
        <div className={cn(sectionSpacingClass(), className)}>
            {title && (
                <div className="flex items-center justify-between">
                    <h1 className={pageTitleClass("text-3xl")}>{title}</h1>
                    {actions && <div className={cn("flex items-center", toolbarGapClass())}>{actions}</div>}
                </div>
            )}

            {/* Metrics Grid */}
            {metrics.length > 0 && (
                <div className={cn("grid md:grid-cols-2 lg:grid-cols-4", formSectionGapClass())}>
                    {metrics.map((metric, index) => (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className={mediumTextClass()}>
                                    {metric.title}
                                </CardTitle>
                                {metric.icon && (
                                    <metric.icon className="h-4 w-4 text-muted-foreground" />
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metric.value}</div>
                                {metric.change && (
                                    <p className={cn(
                                        "mt-1",
                                        smallTextClass(),
                                        metric.change.trend === "up" && "text-green-600",
                                        metric.change.trend === "down" && "text-red-600",
                                        metric.change.trend === "neutral" && "text-muted-foreground"
                                    )}>
                                        {metric.change.value > 0 ? "+" : ""}{metric.change.value}% {metric.change.label}
                                    </p>
                                )}
                                {metric.description && (
                                    <p className={cn(smallTextClass(), "text-muted-foreground mt-1")}>
                                        {metric.description}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Charts Grid */}
            {charts.length > 0 && (
                <div className={cn(
                    "grid",
                    formSectionGapClass(), // gap-4
                    charts.length === 1 && "grid-cols-1",
                    charts.length === 2 && "grid-cols-1 lg:grid-cols-2",
                    charts.length >= 3 && "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
                )}>
                    {charts.map((chart, index) => (
                        <React.Fragment key={index}>{chart}</React.Fragment>
                    ))}
                </div>
            )}
        </div>
    )
}

