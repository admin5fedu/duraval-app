"use client"

import * as React from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface BatchDeleteConfirmationDialogProps<TData> {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedItems: TData[]
    onConfirm: () => Promise<void> | void
    isLoading?: boolean
    itemName?: string
    getItemLabel?: (item: TData) => string
    moduleName?: string
}

/**
 * Generic batch delete confirmation dialog
 * 
 * @example
 * ```tsx
 * <BatchDeleteConfirmationDialog
 *   open={dialogOpen}
 *   onOpenChange={setDialogOpen}
 *   selectedItems={selectedRows}
 *   onConfirm={async () => {
 *     await batchDeleteMutation.mutateAsync(ids)
 *   }}
 *   isLoading={batchDeleteMutation.isPending}
 *   moduleName="việc hàng ngày"
 * />
 * ```
 */
export function BatchDeleteConfirmationDialog<TData>({
    open,
    onOpenChange,
    selectedItems,
    onConfirm,
    isLoading = false,
    itemName = "mục",
    getItemLabel,
    moduleName,
}: BatchDeleteConfirmationDialogProps<TData>) {
    const [isDeleting, setIsDeleting] = React.useState(false)

    const handleConfirm = React.useCallback(async () => {
        setIsDeleting(true)
        try {
            await onConfirm()
            onOpenChange(false)
        } catch (error) {
            // Error is handled by mutation or parent component
            console.error("Error in batch delete:", error)
        } finally {
            setIsDeleting(false)
        }
    }, [onConfirm, onOpenChange])

    const count = selectedItems.length
    const isProcessing = isLoading || isDeleting

    // Build description text
    const description = React.useMemo(() => {
        if (count === 0) {
            return `Bạn có chắc chắn muốn xóa ${itemName}?`
        }

        if (count === 1 && getItemLabel) {
            const itemLabel = getItemLabel(selectedItems[0])
            return `Bạn có chắc chắn muốn xóa ${itemName} <strong>${itemLabel}</strong>? Hành động này không thể hoàn tác.`
        }

        const moduleText = moduleName ? ` ${moduleName}` : ""
        return `Bạn có chắc chắn muốn xóa <strong>${count}</strong> ${itemName}${moduleText}? Hành động này không thể hoàn tác.`
    }, [count, itemName, moduleName, getItemLabel, selectedItems])

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa hàng loạt</AlertDialogTitle>
                    <AlertDialogDescription
                        dangerouslySetInnerHTML={{ __html: description }}
                    />
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isProcessing}>
                        Hủy
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isProcessing}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isProcessing ? "Đang xóa..." : "Xóa"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

