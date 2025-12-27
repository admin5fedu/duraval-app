"use client"

import type React from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useState } from "react"

interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description?: React.ReactNode
    onConfirm: () => Promise<void> | void
    isLoading?: boolean
    confirmLabel?: string
    cancelLabel?: string
    confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    /** Storage key để lưu trạng thái "đừng hỏi lại" */
    skipConfirmStorageKey?: string
    /** Label cho checkbox "đừng hỏi lại" */
    skipConfirmLabel?: string
}

/**
 * Dialog xác nhận chung (thay cho window.confirm) cho các flow quan trọng.
 * Có thể tái sử dụng cho nhiều ngữ cảnh: xem chi tiết, duyệt hồ sơ, chuyển trạng thái, v.v.
 * Hỗ trợ checkbox "đừng hỏi lại" với localStorage.
 */
export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    isLoading = false,
    confirmLabel = "Đồng ý",
    cancelLabel = "Hủy",
    confirmVariant = "default",
    skipConfirmStorageKey,
    skipConfirmLabel = "Đừng hỏi lại lần sau",
}: ConfirmDialogProps) {
    const [skipConfirm, setSkipConfirm] = useState(false)

    const handleConfirm = async () => {
        try {
            // Lưu trạng thái "đừng hỏi lại" nếu có
            if (skipConfirm && skipConfirmStorageKey && typeof window !== "undefined") {
                window.localStorage.setItem(skipConfirmStorageKey, "true")
            }
            
            await onConfirm()
            onOpenChange(false)
        } catch (error) {
            // Error handling sẽ do caller xử lý (toast, v.v.)
            console.error("Confirm dialog error:", error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && (
                        <DialogDescription>{description}</DialogDescription>
                    )}
                </DialogHeader>
                
                {skipConfirmStorageKey && (
                    <div className="flex items-center space-x-2 py-2">
                        <Checkbox
                            id="skip-confirm"
                            checked={skipConfirm}
                            onCheckedChange={(checked) => setSkipConfirm(checked === true)}
                        />
                        <Label
                            htmlFor="skip-confirm"
                            className="text-sm font-normal cursor-pointer"
                        >
                            {skipConfirmLabel}
                        </Label>
                    </div>
                )}
                
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isLoading}>
                            {cancelLabel}
                        </Button>
                    </DialogClose>
                    <LoadingButton
                        variant={confirmVariant}
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

