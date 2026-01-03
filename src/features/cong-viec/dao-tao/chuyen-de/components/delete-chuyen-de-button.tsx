"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
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
import { useDeleteChuyenDe } from "../hooks"
import { toast } from "sonner"
import { chuyenDeConfig } from "../config"

interface DeleteChuyenDeButtonProps {
  id: number
  name: string
  iconOnly?: boolean
  onSuccess?: () => void
}

export function DeleteChuyenDeButton({ 
  id, 
  name, 
  iconOnly = false,
  onSuccess 
}: DeleteChuyenDeButtonProps) {
  const [open, setOpen] = useState(false)
  const deleteMutation = useDeleteChuyenDe()
  const navigate = useNavigate()

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Xóa chuyên đề thành công")
      setOpen(false)
      if (onSuccess) {
        onSuccess()
      } else {
        navigate(chuyenDeConfig.routePath)
      }
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi xóa chuyên đề")
    }
  }

  return (
    <>
      {iconOnly ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
          onClick={(e) => {
            e.stopPropagation()
            setOpen(true)
          }}
        >
          <span className="sr-only">Delete</span>
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setOpen(true)}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Xóa
        </Button>
      )}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa chuyên đề <strong>{name}</strong>?
              <br />
              <span className="text-destructive font-medium">
                ⚠️ Cảnh báo: Tất cả câu hỏi con sẽ bị xóa theo. Hành động này không thể hoàn tác.
              </span>
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
    </>
  )
}

