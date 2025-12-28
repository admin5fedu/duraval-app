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
import { useDeleteCauTraLoi } from "../hooks/use-cau-tra-loi-mutations"

interface DeleteCauTraLoiButtonProps {
    id: number
    name?: string
    iconOnly?: boolean
    onDeleted?: () => void
}

export function DeleteCauTraLoiButton({ 
    id, 
    name = "Câu trả lời",
    iconOnly = false,
    onDeleted 
}: DeleteCauTraLoiButtonProps) {
    const deleteMutation = useDeleteCauTraLoi()
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
                        className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                        onClick={(e) => e.stopPropagation()}
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

