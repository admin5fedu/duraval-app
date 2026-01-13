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

interface BGDDuyetButtonProps {
  phieuDeXuatBanHang: PhieuDeXuatBanHang
  onSuccess?: () => void
  variant?: "default" | "primary"
  disabled?: boolean
}

export function BGDDuyetButton({
  phieuDeXuatBanHang,
  onSuccess,
  disabled = false
}: BGDDuyetButtonProps) {
  const [open, setOpen] = React.useState(false)
  const updateMutation = useUpdatePhieuDeXuatBanHang()
  // Kiểm tra xem đã duyệt chưa
  const isDuyeted = phieuDeXuatBanHang.bgd_duyet === "có" || phieuDeXuatBanHang.bgd_duyet === "đã duyệt"

  // Load thêm permissions từ store
  const { employee, permissions } = useAuthStore()
  const queryClient = useQueryClient()

  // Kiểm tra quyền duyệt
  const hasPermission = React.useMemo(() => {
    if (!employee) return false

    // Trường hợp 1: Admin/Cấp cao (cap_bac = 1)
    if (employee.cap_bac === 1) return true

    // Trường hợp 2: Có quyền quản trị module phiếu đề xuất bán hàng
    // Tìm quyền cho module hiện tại
    const modulePermission = permissions.find(p => p.module_id === 'phieu-de-xuat-ban-hang')

    // Check quyền quan_tri
    if (modulePermission?.quyen?.quan_tri) {
      return true
    }

    return false
  }, [employee, permissions])

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
          bgd_duyet: "có",
          bgd_id: employee.ma_nhan_vien,
          tg_bgd_duyet: new Date().toISOString(),
          trang_thai: "Đã duyệt",
        } as any,
      })

      // Invalidate queries để refresh data
      queryClient.invalidateQueries({ queryKey: phieuDeXuatBanHangQueryKeys.all() })

      setOpen(false)

      toast.success("BGD đã duyệt thành công")

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
        BGD duyệt
      </Button>
    </>
  )
}

