"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUpdateXetDuyetCongNo } from "../hooks/use-xet-duyet-cong-no"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { xetDuyetCongNoQueryKeys } from "../hooks/use-xet-duyet-cong-no"
import { XetDuyetCongNo } from "../schema"
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

interface HuyYeuCauButtonProps {
  xetDuyetCongNo: XetDuyetCongNo
  onSuccess?: () => void
}

interface TraoDoiItem {
  noi_dung: string
  nguoi_trao_doi_id: number | null
  nguoi_trao_doi: string
  thoi_gian: string
  loai?: string
}

export function HuyYeuCauButton({ xetDuyetCongNo, onSuccess }: HuyYeuCauButtonProps) {
  const [open, setOpen] = React.useState(false)
  const [lyDoHuy, setLyDoHuy] = React.useState("")
  const updateMutation = useUpdateXetDuyetCongNo()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { employee } = useAuthStore()

  // Chỉ người tạo mới có thể hủy
  const isNguoiTao = React.useMemo(() => {
    return employee?.ma_nhan_vien === xetDuyetCongNo.nguoi_tao_id
  }, [employee, xetDuyetCongNo.nguoi_tao_id])

  // Chỉ hủy được khi: Chờ kiểm tra (KHÔNG cho hủy khi Chờ duyệt)
  const canHuy = React.useMemo(() => {
    if (!isNguoiTao) return false
    // Chỉ cho phép hủy khi "Chờ kiểm tra"
    return xetDuyetCongNo.trang_thai === "Chờ kiểm tra" ||
           (xetDuyetCongNo.trang_thai === null || xetDuyetCongNo.trang_thai === undefined)
  }, [isNguoiTao, xetDuyetCongNo.trang_thai])

  // Parse trao_doi hiện có
  const traoDoiList: TraoDoiItem[] = React.useMemo(() => {
    if (!xetDuyetCongNo.trao_doi) return []
    
    try {
      if (Array.isArray(xetDuyetCongNo.trao_doi)) {
        return xetDuyetCongNo.trao_doi.map((item: any) => ({
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
  }, [xetDuyetCongNo.trao_doi])

  const handleConfirm = async () => {
    if (!lyDoHuy.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập lý do hủy",
        variant: "error",
      })
      return
    }

    try {
      // Tạo entry hủy với format: [HỦY YÊU CẦU]: {ly_do_huy}
      const huyEntry: TraoDoiItem = {
        noi_dung: `[HỦY YÊU CẦU]: ${lyDoHuy.trim()}`,
        nguoi_trao_doi_id: employee?.ma_nhan_vien || null,
        nguoi_trao_doi: employee?.ho_ten || "",
        thoi_gian: new Date().toISOString(),
      }

      // Thêm vào trao_doi
      const newTraoDoiList = [...traoDoiList, huyEntry]

      await updateMutation.mutateAsync({
        id: xetDuyetCongNo.id!,
        input: {
          trang_thai: "Đã hủy",
          nguoi_huy_id: employee?.ma_nhan_vien || null,
          trao_doi: newTraoDoiList,
        } as any,
      })

      queryClient.invalidateQueries({ queryKey: xetDuyetCongNoQueryKeys.all() })

      toast({
        title: "Thành công",
        description: "Hủy yêu cầu thành công",
      })

      setOpen(false)
      setLyDoHuy("")

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể hủy yêu cầu",
        variant: "error",
      })
    }
  }

  if (!canHuy) {
    return null
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => setOpen(true)}
      >
        <X className="mr-2 h-4 w-4" />
        Hủy Yêu Cầu
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy Yêu Cầu</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy yêu cầu này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ly-do-huy">Lý Do Hủy *</Label>
              <Textarea
                id="ly-do-huy"
                placeholder="Nhập lý do hủy yêu cầu..."
                value={lyDoHuy}
                onChange={(e) => setLyDoHuy(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setOpen(false)
              setLyDoHuy("")
            }}>
              Không
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={updateMutation.isPending || !lyDoHuy.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {updateMutation.isPending ? "Đang xử lý..." : "Xác Nhận Hủy"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
