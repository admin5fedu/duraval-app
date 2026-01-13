"use client"

import * as React from "react"
import { DollarSign } from "lucide-react"
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

import { useQueryClient } from "@tanstack/react-query"
import { phieuDeXuatBanHang as phieuDeXuatBanHangQueryKeys } from "@/lib/react-query/query-keys/phieu-de-xuat-ban-hang"
import { PhieuDeXuatBanHang } from "../schema"
import { toast } from "sonner"

interface ChiTienButtonProps {
    phieuDeXuatBanHang: PhieuDeXuatBanHang
    onSuccess?: () => void
    disabled?: boolean
}

export function ChiTienButton({
    phieuDeXuatBanHang,
    onSuccess,
    disabled = false
}: ChiTienButtonProps) {
    const [open, setOpen] = React.useState(false)
    const updateMutation = useUpdatePhieuDeXuatBanHang()
    const { employee, permissions } = useAuthStore()
    const queryClient = useQueryClient()

    // Kiểm tra quyền (giống BGD duyệt)
    const hasPermission = React.useMemo(() => {
        if (!employee) return false

        // Admin/Cấp cao
        if (employee.cap_bac === 1) return true

        // Quyền quản trị module
        const modulePermission = permissions.find(p => p.module_id === 'phieu-de-xuat-ban-hang')
        if (modulePermission?.quyen?.quan_tri) return true

        return false
    }, [employee, permissions])

    if (!hasPermission) return null

    const isChi = phieuDeXuatBanHang.trang_thai_chi_tien === "đã chi"
    const nextStatus = isChi ? "chưa chi" : "đã chi"

    const handleUpdate = async () => {
        try {
            await updateMutation.mutateAsync({
                id: phieuDeXuatBanHang.id!,
                input: {
                    trang_thai_chi_tien: nextStatus
                } as any,
            })

            queryClient.invalidateQueries({ queryKey: phieuDeXuatBanHangQueryKeys.all() })
            setOpen(false)
            toast.success(`Đã cập nhật trạng thái chi tiền thành: ${nextStatus}`)
            if (onSuccess) onSuccess()
        } catch (error) {
            // handled by mutation
        }
    }

    return (
        <>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận thay đổi trạng thái chi tiền</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn đổi trạng thái thành "{nextStatus}"?
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
                                    label: "Xác nhận",
                                    onClick: handleUpdate,
                                    level: "primary",
                                    disabled: updateMutation.isPending,
                                    loading: updateMutation.isPending,
                                },
                            ]}
                        />
                    </div>
                </AlertDialogContent>
            </AlertDialog>

            <Button
                variant={isChi ? "outline" : "default"}
                size="sm"
                className={isChi ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200" : ""}
                onClick={(e) => {
                    e.stopPropagation()
                    setOpen(true)
                }}
                disabled={disabled || updateMutation.isPending}
            >
                <DollarSign className="mr-2 h-4 w-4" />
                {isChi ? "Đã chi" : "Chưa chi"}
            </Button>
        </>
    )
}
