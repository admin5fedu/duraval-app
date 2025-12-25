import * as React from "react"
import { Badge } from "@/components/ui/badge"
import type { DetailField } from "../types"

/**
 * Renders a field value based on its type and format function
 */
export function renderFieldValue(field: DetailField): React.ReactNode {
    const { value, type, format } = field

    if (value === null || value === undefined || value === "") {
        return <span className="text-muted-foreground">—</span>
    }

    if (format) {
        return format(value)
    }

    switch (type) {
        case "date":
            return new Date(value as string).toLocaleDateString("vi-VN")
        case "currency":
            return new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
            }).format(Number(value))
        case "number":
            return new Intl.NumberFormat("vi-VN").format(Number(value))
        case "email":
            return (
                <a href={`mailto:${value}`} className="text-primary hover:underline">
                    {String(value)}
                </a>
            )
        case "phone":
            return (
                <a href={`tel:${value}`} className="text-primary hover:underline">
                    {String(value)}
                </a>
            )
        case "url":
            return (
                <a href={String(value)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {String(value)}
                </a>
            )
        case "badge":
        case "status":
            return <Badge variant="outline">{String(value)}</Badge>
        default:
            return <span>{String(value)}</span>
    }
}

