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
import { useDeleteKyThi } from "../hooks"
import { toast } from "sonner"
import { kyThiConfig } from "../config"

interface DeleteKyThiButtonProps {
  id: number
  name: string
  iconOnly?: boolean
  onSuccess?: () => void
}

export function DeleteKyThiButton({ 
  id, 
  name, 
  iconOnly = false,
  onSuccess 
}: DeleteKyThiButtonProps) {
  const [open, setOpen] = useState(false)
  const deleteMutation = useDeleteKyThi()
  const navigate = useNavigate()

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Xóa kỳ thi thành công")
      setOpen(false)
      if (onSuccess) {
        onSuccess()
      } else {
        navigate(kyThiConfig.routePath)
      }
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi xóa kỳ thi")
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
              Bạn có chắc chắn muốn xóa kỳ thi <strong>{name}</strong>? Hành động này không thể hoàn tác.
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

