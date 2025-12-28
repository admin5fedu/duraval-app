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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useDeleteLichDang } from "../hooks/use-lich-dang-mutations"

interface DeleteLichDangButtonProps {
    id: number
    name?: string
    iconOnly?: boolean
    onDeleted?: () => void
}

export function DeleteLichDangButton({ 
    id, 
    name = "Lịch đăng",
    iconOnly = false,
    onDeleted 
}: DeleteLichDangButtonProps) {
    const deleteMutation = useDeleteLichDang()
    const [open, setOpen] = React.useState(false)

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(id)
            setOpen(false)
            onDeleted?.()
        } catch (error) {
            // Error is handled by mutation
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                {iconOnly ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-red-600 shrink-0"
                    >
                        <span className="sr-only">Xóa</span>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa
                    </Button>
                )}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa "{name}"? Hành động này không thể hoàn tác.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

