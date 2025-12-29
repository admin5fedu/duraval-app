"use client"

import { Button } from "@/components/ui/button"
import { FileText, ArrowLeft } from "lucide-react"
import type { DetailEmptyStateProps } from "../types"
import { emptyStateTitleClass, bodyTextClass } from "@/shared/utils/text-styles"
import { emptyStateSpacingClass } from "@/shared/utils/spacing-styles"
import { cardPaddingClass } from "@/shared/utils/card-styles"
import { cn } from "@/lib/utils"

/**
 * Empty state component for GenericDetailView
 */
export function DetailEmptyState({ onBack }: DetailEmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-16 text-center", emptyStateSpacingClass())}>
            <div className={cn("rounded-full bg-muted mb-4", cardPaddingClass())}>
                <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className={emptyStateTitleClass("mb-2")}>Không có dữ liệu</h3>
            <p className={cn(bodyTextClass(), "text-muted-foreground mb-4")}>Không tìm thấy thông tin để hiển thị.</p>
            <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
            </Button>
        </div>
    )
}

