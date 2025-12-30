"use client"

import * as React from "react"
import { CheckCircle2 } from "lucide-react"
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
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useUpdateDiemCongTru } from "../hooks/use-diem-cong-tru-mutations"
import { useCheckQuyenQuanTri } from "../hooks/use-check-quyen-quan-tri"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useAuthStore } from "@/shared/stores/auth-store"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { diemCongTruQueryKeys } from "@/lib/react-query/query-keys"

interface XacNhanButtonProps {
  id: number
  nhanVienId: number | null | undefined
  iconOnly?: boolean
  onSuccess?: () => void
  currentTraoDoi?: any // Trao đổi hiện có để merge
  trangThai?: string | null // Trạng thái hiện tại
}

export function XacNhanButton({ id, nhanVienId, iconOnly = false, onSuccess, currentTraoDoi, trangThai }: XacNhanButtonProps) {
  const [open, setOpen] = React.useState(false)
  const [traoDoi, setTraoDoi] = React.useState("")
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const updateMutation = useUpdateDiemCongTru()
  const { employee } = useAuthStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const hasQuyenQuanTri = useCheckQuyenQuanTri()

  // Kiểm tra quyền
  const canXacNhan = React.useMemo(() => {
    if (!employee) return false
    
    // 1. User khớp với nhan_vien_id
    if (nhanVienId && employee.ma_nhan_vien === nhanVienId) {
      return true
    }
    
    // 2. User có cap_bac = 1
    if (employee.cap_bac === 1) {
      return true
    }
    
    // 3. User có quyền "quản trị" cho module Điểm cộng trừ
    if (hasQuyenQuanTri) {
      return true
    }
    
    return false
  }, [employee, nhanVienId, hasQuyenQuanTri])

  // Ẩn button nếu không có quyền hoặc đã xác nhận
  if (!canXacNhan || trangThai === "Đã xác nhận") {
    return null
  }

  const handleOpenDialog = () => {
    setTraoDoi("")
    setOpen(true)
  }

  const handleContinue = () => {
    if (!traoDoi.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập trao đổi trước khi xác nhận",
        variant: "error",
      })
      return
    }
    setOpen(false)
    setConfirmOpen(true)
  }

  const handleConfirm = async () => {
    try {
      // Tạo trao_doi object với thông tin người xác nhận và nội dung
      const traoDoiData = {
        noi_dung: traoDoi.trim(),
        nguoi_trao_doi_id: employee?.ma_nhan_vien || null,
        nguoi_trao_doi: employee?.ho_ten || "",
        thoi_gian: new Date().toISOString(),
        loai: "xac_nhan", // Đánh dấu đây là trao đổi từ xác nhận
      }

      // Merge với trao_doi hiện có (nếu có)
      let traoDoiMoiList: any[] = []
      if (currentTraoDoi) {
        if (Array.isArray(currentTraoDoi)) {
          traoDoiMoiList = [...currentTraoDoi, traoDoiData]
        } else if (typeof currentTraoDoi === 'object') {
          traoDoiMoiList = [currentTraoDoi, traoDoiData]
        } else {
          traoDoiMoiList = [traoDoiData]
        }
      } else {
        traoDoiMoiList = [traoDoiData]
      }

      await updateMutation.mutateAsync({
        id,
        input: {
          trang_thai: "Đã xác nhận",
          trao_doi: traoDoiMoiList,
        } as any,
      })

      // Invalidate queries để refresh data
      queryClient.invalidateQueries({ queryKey: diemCongTruQueryKeys.all() })

      setConfirmOpen(false)
      setTraoDoi("")
      
      toast({
        title: "Thành công",
        description: "Xác nhận điểm cộng trừ thành công",
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      // Error is handled by mutation
    }
  }

  return (
    <>
      {/* Dialog nhập trao đổi */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận điểm cộng trừ</AlertDialogTitle>
            <AlertDialogDescription>
              Vui lòng nhập trao đổi (comment) trước khi xác nhận.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="trao-doi">Trao đổi</Label>
              <Textarea
                id="trao-doi"
                value={traoDoi}
                onChange={(e) => setTraoDoi(e.target.value)}
                placeholder="Nhập trao đổi..."
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateMutation.isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleContinue} disabled={updateMutation.isPending}>
              Tiếp tục
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog xác nhận */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xác nhận điểm cộng trừ này? Trạng thái sẽ được chuyển thành "Đã xác nhận".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateMutation.isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={updateMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {updateMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Trigger button */}
      {iconOnly ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 shrink-0"
          onClick={(e) => {
            e.stopPropagation()
            handleOpenDialog()
          }}
          title="Xác nhận"
        >
          <span className="sr-only">Xác nhận</span>
          <CheckCircle2 className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className={actionButtonClass()}
          onClick={(e) => {
            e.stopPropagation()
            handleOpenDialog()
          }}
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Xác nhận
        </Button>
      )}
    </>
  )
}

