"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"

interface GenericDeleteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    entityName: string
    onConfirm: () => Promise<void>
    isLoading?: boolean
    confirmLabel?: string
    cancelLabel?: string
}

/**
 * Generic dialog component để xác nhận xóa entity
 * Có thể tái sử dụng cho bất kỳ entity nào
 */
export function GenericDeleteDialog({
    open,
    onOpenChange,
    title,
    description,
    entityName,
    onConfirm,
    isLoading = false,
    confirmLabel = "Xóa",
    cancelLabel = "Hủy bỏ"
}: GenericDeleteDialogProps) {
    const handleConfirm = async () => {
        try {
            await onConfirm()
            onOpenChange(false)
        } catch (error) {
            // Error handling is done in the onConfirm function
            console.error("Delete error:", error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                        <br />
                        <strong>{entityName}</strong>
                        <br />
                        Hành động này không thể hoàn tác.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isLoading}>
                            {cancelLabel}
                        </Button>
                    </DialogClose>
                    <LoadingButton
                        variant="destructive"
                        onClick={handleConfirm}
                        isLoading={isLoading}
                        loadingText={confirmLabel}
                    >
                        {confirmLabel}
                    </LoadingButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

