"use client"

import * as React from "react"
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
import { useDeleteXetDuyetKhachBuon } from "../hooks/use-xet-duyet-khach-buon"
import { useToast } from "@/hooks/use-toast"

interface DeleteXetDuyetKhachBuonButtonProps {
  id: number
  iconOnly?: boolean
  onSuccess?: () => void
}

export function DeleteXetDuyetKhachBuonButton({ 
  id, 
  iconOnly = false,
  onSuccess 
}: DeleteXetDuyetKhachBuonButtonProps) {
  const [open, setOpen] = React.useState(false)
  const deleteMutation = useDeleteXetDuyetKhachBuon()
  const { toast } = useToast()

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id)
      setOpen(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xóa xét duyệt khách buôn",
        variant: "error",
      })
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
            disabled={deleteMutation.isPending}
          >
            <span className="sr-only">Xóa</span>
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="destructive"
            size="sm"
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa xét duyệt khách buôn này? Hành động này không thể hoàn tác.
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

