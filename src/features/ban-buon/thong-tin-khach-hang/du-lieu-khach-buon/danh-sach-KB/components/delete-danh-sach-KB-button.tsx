"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useDeleteDanhSachKB } from "../hooks/use-danh-sach-KB-mutations"
import { useState } from "react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"

interface DeleteDanhSachKBButtonProps {
  id: number
  name: string
  iconOnly?: boolean
}

export function DeleteDanhSachKBButton({ id, name, iconOnly = false }: DeleteDanhSachKBButtonProps) {
  const [open, setOpen] = useState(false)
  const deleteMutation = useDeleteDanhSachKB()

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id)
      setOpen(false)
    } catch (error) {
      // Error is handled by mutation hook (toast)
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
            title="Xóa"
          >
            <span className="sr-only">Xóa</span>
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="destructive" size="sm" className={actionButtonClass()} onClick={(e) => e.stopPropagation()}>
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa khách buôn <strong>&quot;{name}&quot;</strong>? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Hủy</AlertDialogCancel>
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

