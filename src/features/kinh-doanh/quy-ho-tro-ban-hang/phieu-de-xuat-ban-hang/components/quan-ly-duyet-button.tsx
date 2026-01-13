"use client"

import * as React from "react"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useUpdatePhieuDeXuatBanHang } from "../hooks/use-phieu-de-xuat-ban-hang-mutations"
import { ActionGroup } from "@/shared/components/actions"
import { useAuthStore } from "@/shared/stores/auth-store"
import { getActionVariant, getActionSize } from "@/shared/utils/action-styles"
import { useQueryClient } from "@tanstack/react-query"
import { phieuDeXuatBanHang as phieuDeXuatBanHangQueryKeys } from "@/lib/react-query/query-keys/phieu-de-xuat-ban-hang"
import { PhieuDeXuatBanHang } from "../schema"
import { toast } from "sonner"

interface QuanLyDuyetButtonProps {
  phieuDeXuatBanHang: PhieuDeXuatBanHang
  onSuccess?: () => void
  variant?: "default" | "primary"
  disabled?: boolean
}

export function QuanLyDuyetButton({
  phieuDeXuatBanHang,
  onSuccess,
  disabled = false
}: QuanLyDuyetButtonProps) {
  const [open, setOpen] = React.useState(false)
  const updateMutation = useUpdatePhieuDeXuatBanHang()
  const { employee } = useAuthStore()
  const queryClient = useQueryClient()

  // Kiểm tra xem đã duyệt chưa
  const isDuyeted = phieuDeXuatBanHang.quan_ly_duyet === "có" || phieuDeXuatBanHang.quan_ly_duyet === "đã duyệt"

  // Kiểm tra quyền duyệt
  const hasPermission = React.useMemo(() => {
    if (!employee) return false

    // Trường hợp 1: Admin/Cấp cao (cap_bac = 1)
    if (employee.cap_bac === 1) return true

    // Trường hợp 2: Quản lý trực tiếp (cap_bac = 2) VÀ cùng phòng ban
    if (employee.cap_bac === 2) {
      if (employee.phong_ban_id && phieuDeXuatBanHang.phong_id) {
        return employee.phong_ban_id === phieuDeXuatBanHang.phong_id
      }
    }

    return false
  }, [employee, phieuDeXuatBanHang])

  // Nếu không có quyền, ẩn nút luôn
  if (!hasPermission) return null

  const handleDuyet = async () => {
    if (!employee?.ma_nhan_vien) {
      toast.error("Không tìm thấy thông tin nhân viên")
      return
    }

    try {
      await updateMutation.mutateAsync({
        id: phieuDeXuatBanHang.id!,
        input: {
          quan_ly_duyet: "có",
          quan_ly_id: employee.ma_nhan_vien,
          tg_quan_ly_duyet: new Date().toISOString(),
          trang_thai: "Chờ phê duyệt",
        } as any,
      })

      // Invalidate queries để refresh data
      queryClient.invalidateQueries({ queryKey: phieuDeXuatBanHangQueryKeys.all() })

      setOpen(false)

      toast.success("Quản lý đã duyệt thành công")

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      // Error is handled by mutation
    }
  }

  // Nếu đã duyệt rồi, không hiển thị button hoặc hiển thị dạng disabled
  if (isDuyeted && !disabled) {
    return null
  }

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận duyệt</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn duyệt phiếu đề xuất bán hàng này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t">
            <ActionGroup
              actions={[
                {
                  label: "Hủy",
                  onClick: () => setOpen(false),
                  level: "secondary",
                  disabled: updateMutation.isPending,
                },
                {
                  label: updateMutation.isPending ? "Đang xử lý..." : "Xác nhận duyệt",
                  onClick: handleDuyet,
                  level: "primary",
                  disabled: updateMutation.isPending,
                  loading: updateMutation.isPending,
                },
              ]}
            />
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Trigger button - Secondary action */}
      <Button
        variant={getActionVariant("secondary")}
        size={getActionSize("secondary")}
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
        disabled={disabled || isDuyeted || updateMutation.isPending}
      >
        <CheckCircle2 className="mr-2 h-4 w-4" />
        Quản lý duyệt
      </Button>
    </>
  )
}

