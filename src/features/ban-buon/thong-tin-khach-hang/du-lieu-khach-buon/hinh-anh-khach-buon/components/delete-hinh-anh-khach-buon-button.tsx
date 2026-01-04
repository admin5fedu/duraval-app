"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { Trash2 } from "lucide-react"
import { useDeleteHinhAnhKhachBuon } from "../hooks/use-hinh-anh-khach-buon-mutations"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"

interface DeleteHinhAnhKhachBuonButtonProps {
  id: number
  name: string | null
  iconOnly?: boolean
  onSuccess?: () => void
}

export function DeleteHinhAnhKhachBuonButton({ 
  id, 
  name,
  iconOnly = false,
  onSuccess 
}: DeleteHinhAnhKhachBuonButtonProps) {
  const [open, setOpen] = useState(false)
  const deleteMutation = useDeleteHinhAnhKhachBuon()

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id)
      setOpen(false)
      if (onSuccess) {
        onSuccess()
      }
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
            Bạn có chắc chắn muốn xóa hình ảnh khách buôn <strong>&quot;{name || `ID ${id}`}&quot;</strong>? Hành động này không thể hoàn tác.
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

