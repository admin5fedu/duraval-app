"use client"

import * as React from "react"
import { Trash2 } from "lucide-react"
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
import { useDeleteDanhMucTaiLieu, useDanhMucTaiLieu } from "../hooks"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"

interface DeleteDanhMucTaiLieuButtonProps {
  id: number
  name: string
  iconOnly?: boolean
  cap?: number | null
}

export function DeleteDanhMucTaiLieuButton({ id, name, iconOnly = false, cap }: DeleteDanhMucTaiLieuButtonProps) {
  const [open, setOpen] = React.useState(false)
  const deleteMutation = useDeleteDanhMucTaiLieu()
  const { data: allDanhMucTaiLieu = [] } = useDanhMucTaiLieu()
  
  // Count children if this is a level 1 category
  const childrenCount = React.useMemo(() => {
    if (cap !== 1) return 0
    return allDanhMucTaiLieu.filter(item => item.danh_muc_cha_id === id).length
  }, [cap, id, allDanhMucTaiLieu])

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id)
      setOpen(false)
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
          <AlertDialogTitle>Xác nhận xóa danh mục tài liệu</AlertDialogTitle>
          <AlertDialogDescription>
            {childrenCount > 0 ? (
              <>
                Bạn có chắc chắn muốn xóa danh mục tài liệu <strong>{name}</strong>?
                <br />
                <br />
                <strong className="text-destructive">Cảnh báo:</strong> Danh mục này có <strong>{childrenCount}</strong> danh mục con. 
                Tất cả các danh mục con sẽ bị xóa cùng với danh mục cha này.
                <br />
                <br />
                Hành động này không thể hoàn tác.
              </>
            ) : (
              <>
                Bạn có chắc chắn muốn xóa danh mục tài liệu <strong>{name}</strong>? Hành động này không thể hoàn tác.
              </>
            )}
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

