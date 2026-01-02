"use client"

import * as React from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useDeletePhieuDeXuatBanHang } from "../hooks/use-phieu-de-xuat-ban-hang-mutations"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { ActionGroup } from "@/shared/components/actions"

interface DeletePhieuDeXuatBanHangButtonProps {
  id: number
  iconOnly?: boolean
}

export function DeletePhieuDeXuatBanHangButton({ id, iconOnly = false }: DeletePhieuDeXuatBanHangButtonProps) {
  const [open, setOpen] = React.useState(false)
  const deleteMutation = useDeletePhieuDeXuatBanHang()

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
          <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa phiếu đề xuất bán hàng này? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t">
          <ActionGroup
            actions={[
              {
                label: "Hủy",
                onClick: () => setOpen(false),
                level: "secondary",
                disabled: deleteMutation.isPending,
              },
              {
                label: deleteMutation.isPending ? "Đang xóa..." : "Xóa",
                onClick: handleDelete,
                level: "primary",
                variant: "destructive",
                disabled: deleteMutation.isPending,
                loading: deleteMutation.isPending,
              },
            ]}
          />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

