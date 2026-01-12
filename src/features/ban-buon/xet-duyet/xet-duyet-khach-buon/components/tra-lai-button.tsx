"use client"

import * as React from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUpdateXetDuyetKhachBuon } from "../hooks/use-xet-duyet-khach-buon"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { xetDuyetKhachBuonQueryKeys } from "../hooks/use-xet-duyet-khach-buon"
import { XetDuyetKhachBuon } from "../schema"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/shared/stores/auth-store"

interface TraLaiButtonProps {
  xetDuyetKhachBuon: XetDuyetKhachBuon
  onSuccess?: () => void
}

interface TraoDoiItem {
  noi_dung: string
  nguoi_trao_doi_id: number | null
  nguoi_trao_doi: string
  thoi_gian: string
  loai?: string
}

export function TraLaiButton({ xetDuyetKhachBuon, onSuccess }: TraLaiButtonProps) {
  const [open, setOpen] = React.useState(false)
  const [ghiChu, setGhiChu] = React.useState("")
  const updateMutation = useUpdateXetDuyetKhachBuon()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { employee } = useAuthStore()

  // Chỉ cho phép trả lại khi đang ở trạng thái "Chờ duyệt" hoặc "Yêu cầu bổ sung"
  const canTraLai = React.useMemo(() => {
    return xetDuyetKhachBuon.trang_thai === "Chờ duyệt" ||
           xetDuyetKhachBuon.trang_thai === "Yêu cầu bổ sung"
  }, [xetDuyetKhachBuon.trang_thai])

  // Parse trao_doi hiện có
  const traoDoiList: TraoDoiItem[] = React.useMemo(() => {
    if (!xetDuyetKhachBuon.trao_doi) return []
    
    try {
      if (Array.isArray(xetDuyetKhachBuon.trao_doi)) {
        return xetDuyetKhachBuon.trao_doi.map((item: any) => ({
          noi_dung: item.noi_dung || "",
          nguoi_trao_doi_id: item.nguoi_trao_doi_id || null,
          nguoi_trao_doi: item.nguoi_trao_doi || "",
          thoi_gian: item.thoi_gian || "",
          loai: item.loai || undefined,
        }))
      }
      return []
    } catch {
      return []
    }
  }, [xetDuyetKhachBuon.trao_doi])

  const handleConfirm = async () => {
    if (!ghiChu.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập lý do trả lại",
        variant: "error",
      })
      return
    }

    try {
      // Luôn thêm trao đổi log trả lại vào trao_doi
      const traLaiEntry: TraoDoiItem = {
        noi_dung: `[Trả lại yêu cầu]: ${ghiChu.trim()}`,
        nguoi_trao_doi_id: employee?.ma_nhan_vien || null,
        nguoi_trao_doi: employee?.ho_ten || "",
        thoi_gian: new Date().toISOString(),
        loai: "tra_lai",
      }
      
      const newTraoDoiList = [...traoDoiList, traLaiEntry]

      await updateMutation.mutateAsync({
        id: xetDuyetKhachBuon.id!,
        input: {
          trang_thai: "Chờ kiểm tra",
          trao_doi: newTraoDoiList,
        },
      })

      queryClient.invalidateQueries({ queryKey: xetDuyetKhachBuonQueryKeys.all() })

      toast({
        title: "Thành công",
        description: "Trả lại yêu cầu thành công",
      })

      setOpen(false)
      setGhiChu("")

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể trả lại yêu cầu",
        variant: "error",
      })
    }
  }

  if (!canTraLai) {
    return null
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={actionButtonClass()}
        onClick={() => setOpen(true)}
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Trả Lại
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Trả Lại Yêu Cầu</AlertDialogTitle>
            <AlertDialogDescription>
              Yêu cầu này sẽ được trả lại về trạng thái "Chờ kiểm tra" để người tạo có thể cập nhật lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ghi-chu">Lý Do Trả Lại *</Label>
              <Textarea
                id="ghi-chu"
                placeholder="Nhập lý do trả lại yêu cầu..."
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setOpen(false)
              setGhiChu("")
            }}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={updateMutation.isPending || !ghiChu.trim()}
            >
              {updateMutation.isPending ? "Đang xử lý..." : "Xác Nhận Trả Lại"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

