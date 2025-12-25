"use client"

import * as React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { DetailLoadingStateProps } from "../types"

/**
 * Loading state component for GenericDetailView
 */
export function DetailLoadingState({}: DetailLoadingStateProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
                <div className="space-y-2 flex-1">
                    <div className="h-6 w-48 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                </div>
            </div>
            <Card>
                <CardHeader>
                    <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="space-y-2">
                                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

