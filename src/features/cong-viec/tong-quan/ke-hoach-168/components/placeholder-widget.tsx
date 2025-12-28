"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface PlaceholderWidgetProps {
    title: string
    icon: LucideIcon
    description?: string
}

export function PlaceholderWidget({ title, icon: Icon, description = "Đang phát triển" }: PlaceholderWidgetProps) {
    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl">{title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-2">
                    <p className="text-muted-foreground text-sm">{description}</p>
                </div>
            </CardContent>
        </Card>
    )
}

