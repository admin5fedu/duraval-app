"use client"

import type React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"

interface GenericDetailDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    subtitle?: string
    sections: DetailSection[]
    isLoading?: boolean
    /** Action bar giống detail page (Sửa, Xóa, ...). */
    actions?: React.ReactNode
    /** Override hành vi nút Back: nếu không truyền -> đóng dialog. */
    onBack?: () => void
    /** Tiêu đề thanh header của popup (khác với tiêu đề detail bên trong). Mặc định = title. */
    dialogTitle?: string
    /** Subtitle cho header popup (ví dụ: "Chi tiết thông tin người thân"). */
    dialogSubtitle?: string
}

/**
 * Popup chi tiết chuẩn ERP.
 *
 * - Bên trong dùng GenericDetailViewSimple nên header + sections giống hệt detail page.
 * - Back trong header = đóng popup (trừ khi override onBack).
 */
export function GenericDetailDialog({
    open,
    onOpenChange,
    title,
    subtitle,
    sections,
    isLoading = false,
    actions,
    onBack,
    dialogTitle,
    dialogSubtitle,
}: GenericDetailDialogProps) {
    const handleBack = onBack ?? (() => onOpenChange(false))

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="!max-w-[1200px] !w-[90vw] max-w-[90vw] max-h-[95vh] p-0 flex flex-col"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
                    <DialogTitle className="text-xl">
                        {/* Ưu tiên dialogTitle cho thanh header popup */}
                        {(typeof dialogTitle !== "undefined" && dialogTitle) || title}
                    </DialogTitle>
                    {dialogSubtitle && (
                        <p className="text-sm text-muted-foreground mt-1">{dialogSubtitle}</p>
                    )}
                </DialogHeader>
                <div className="flex-1 overflow-hidden min-h-0">
                    <ScrollArea className="h-full">
                        <div className="px-6 py-4">
                            <GenericDetailViewSimple
                                title={title}
                                subtitle={subtitle}
                                sections={sections}
                                actions={actions}
                                isLoading={isLoading}
                                onBack={handleBack}
                            />
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    )
}

