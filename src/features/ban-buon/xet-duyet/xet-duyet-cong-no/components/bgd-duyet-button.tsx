"use client"

import * as React from "react"
import { ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUpdateXetDuyetCongNo } from "../hooks/use-xet-duyet-cong-no"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { xetDuyetCongNoQueryKeys } from "../hooks/use-xet-duyet-cong-no"
import { XetDuyetCongNo } from "../schema"
import { GenericFormDialog, FormSection } from "@/shared/components"
import { z } from "zod"
import { useAuthStore } from "@/shared/stores/auth-store"
import { 
  calculateTrangThai, 
  createAuditLogEntry, 
  addAuditLog, 
  parseAuditLog,
} from "../utils/trang-thai-utils"
import { checkModuleAdmin } from "@/shared/utils/check-module-admin"
import { xetDuyetCongNoConfig } from "../config"

interface BgdDuyetButtonProps {
  xetDuyetCongNo: XetDuyetCongNo
  onSuccess?: () => void
  variant?: "default" | "primary"
}

interface TraoDoiItem {
  noi_dung: string
  nguoi_trao_doi_id: number | null
  nguoi_trao_doi: string
  thoi_gian: string
  loai?: string
}

const bgdDuyetSchema = z.object({
  bgd_duyet: z.string({ required_error: "BGD duyệt là bắt buộc" }).min(1, "BGD duyệt là bắt buộc"),
  ghi_chu: z.string({ required_error: "Ghi chú là bắt buộc" }).min(1, "Vui lòng nhập lý do duyệt"),
  trao_doi_khi_duyet: z.string().optional().nullable(),
  duyet_vuot_cap: z.string().optional().default("false"),
})

export function BgdDuyetButton({ xetDuyetCongNo, onSuccess, variant = "default" }: BgdDuyetButtonProps) {
  const [open, setOpen] = React.useState(false)
  const updateMutation = useUpdateXetDuyetCongNo()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { employee } = useAuthStore()

  // Check if user has admin permission for vượt cấp
  const isModuleAdmin = checkModuleAdmin(xetDuyetCongNoConfig.moduleName, employee)

  // Check if can perform action
  const canBgdDuyet = React.useMemo(() => {
    // Cho phép nếu:
    // 1. Quản lý đã đồng ý (flow bình thường)
    // 2. Hoặc BGD có quyền vượt cấp (admin) và chưa có BGD duyệt
    const canNormalFlow = xetDuyetCongNo.quan_ly_duyet === "Đồng ý" && 
                          xetDuyetCongNo.trang_thai === "Chờ duyệt"
    
    const canOverrule = isModuleAdmin && 
                       !xetDuyetCongNo.bgd_duyet &&
                       xetDuyetCongNo.trang_thai !== "Đã duyệt" &&
                       xetDuyetCongNo.trang_thai !== "Từ chối"
    
    return canNormalFlow || canOverrule
  }, [xetDuyetCongNo, isModuleAdmin])

  const defaultValues = React.useMemo(() => ({
    bgd_duyet: xetDuyetCongNo.bgd_duyet || "",
    ghi_chu: "",
    trao_doi_khi_duyet: "",
    duyet_vuot_cap: (xetDuyetCongNo.quan_ly_duyet !== "Đồng ý" && isModuleAdmin) ? "true" : "false",
  }), [xetDuyetCongNo, isModuleAdmin])

  const sections: FormSection[] = React.useMemo(() => [
    {
      title: "Thông Tin BGD Duyệt",
      fields: [
        {
          name: "bgd_duyet",
          label: "BGD Duyệt",
          type: "toggle",
          required: true,
          options: [
            { label: "Đồng ý", value: "Đồng ý" },
            { label: "Từ chối", value: "Từ chối" },
            { label: "Yêu cầu bổ sung", value: "Yêu cầu bổ sung" },
          ],
        },
        {
          name: "ghi_chu",
          label: "Ghi Chú / Lý Do",
          type: "textarea",
          required: true,
          placeholder: "Nhập lý do duyệt (bắt buộc)...",
          colSpan: 2,
        },
        {
          name: "trao_doi_khi_duyet",
          label: "Trao Đổi Khi Duyệt",
          type: "textarea",
          placeholder: "Nhập trao đổi khi duyệt (tùy chọn)...",
          colSpan: 2,
        },
        ...(isModuleAdmin && xetDuyetCongNo.quan_ly_duyet !== "Đồng ý" ? [{
          name: "duyet_vuot_cap",
          label: "Duyệt Vượt Cấp",
          type: "toggle" as const,
          description: "Cho phép duyệt ngay cả khi Quản lý chưa duyệt (chỉ dành cho BGD có quyền cao nhất)",
          options: [
            { label: "Có", value: "true" },
            { label: "Không", value: "false" },
          ],
        }] : []),
      ],
    },
  ], [isModuleAdmin, xetDuyetCongNo.quan_ly_duyet])

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

  // Parse audit log
  const existingAuditLog = React.useMemo(() => {
    return parseAuditLog((xetDuyetCongNo as any).audit_log)
  }, [(xetDuyetCongNo as any).audit_log])

  const handleSubmit = async (data: z.infer<typeof bgdDuyetSchema>) => {
    try {
      // Convert duyet_vuot_cap từ string sang boolean
      const duyetVuotCap = data.duyet_vuot_cap === "true"

      // Validation: Nếu không phải vượt cấp, phải có Quản lý đồng ý
      if (!duyetVuotCap && xetDuyetCongNo.quan_ly_duyet !== "Đồng ý") {
        toast({
          title: "Lỗi",
          description: "Chỉ có thể duyệt khi Quản lý đã đồng ý, hoặc sử dụng tính năng 'Duyệt vượt cấp'",
          variant: "error",
        })
        return
      }

      // Tính trạng thái mới
      const newTrangThai = calculateTrangThai(
        xetDuyetCongNo.quan_ly_duyet,
        data.bgd_duyet,
        xetDuyetCongNo.trang_thai
      )

      // Thêm trao đổi mới nếu có
      let newTraoDoiList = [...traoDoiList]
      if (data.trao_doi_khi_duyet && data.trao_doi_khi_duyet.trim()) {
        const traoDoiMoi: TraoDoiItem = {
          noi_dung: `[BGD duyệt: ${data.bgd_duyet}${duyetVuotCap ? " (Vượt cấp)" : ""}] ${data.trao_doi_khi_duyet.trim()}`,
          nguoi_trao_doi_id: employee?.ma_nhan_vien || null,
          nguoi_trao_doi: employee?.ho_ten || "",
          thoi_gian: new Date().toISOString(),
          loai: "bgd_duyet",
        }
        newTraoDoiList.push(traoDoiMoi)
      }

      // Tạo audit log entry
      const actionText = duyetVuotCap 
        ? `BGD ${data.bgd_duyet} (Vượt cấp)`
        : `BGD ${data.bgd_duyet}`
      
      const auditEntry = createAuditLogEntry(
        actionText,
        employee?.ma_nhan_vien || null,
        employee?.ho_ten || "",
        data.ghi_chu,
        "bgd"
      )
      const newAuditLog = addAuditLog(existingAuditLog, auditEntry)

      await updateMutation.mutateAsync({
        id: xetDuyetCongNo.id!,
        input: {
          bgd_duyet: data.bgd_duyet,
          bgd_id: employee?.ma_nhan_vien || null,
          trang_thai: newTrangThai,
          trao_doi: newTraoDoiList.length > 0 ? newTraoDoiList : undefined,
          audit_log: newAuditLog,
          // tg_bgd_duyet sẽ được set tự động bởi database (default now())
        },
      })

      queryClient.invalidateQueries({ queryKey: xetDuyetCongNoQueryKeys.all() })

      toast({
        title: "Thành công",
        description: "Cập nhật BGD duyệt thành công",
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật BGD duyệt",
        variant: "error",
      })
      throw error
    }
  }

  return (
    <>
      <Button
        variant={variant === "primary" ? "default" : "outline"}
        size="sm"
        className={actionButtonClass()}
        onClick={() => {
          if (!canBgdDuyet) {
            toast({
              title: "Không thể duyệt",
              description: isModuleAdmin 
                ? "Chỉ có thể duyệt khi Quản lý đã đồng ý, hoặc sử dụng tính năng 'Duyệt vượt cấp'"
                : "Chỉ có thể duyệt khi Quản lý đã đồng ý",
              variant: "error",
            })
            return
          }
          setOpen(true)
        }}
        disabled={!canBgdDuyet}
      >
        <ShieldCheck className="mr-2 h-4 w-4" />
        BGD Duyệt
      </Button>

      <GenericFormDialog
        open={open}
        onOpenChange={setOpen}
        title={`BGD Duyệt - Xét Duyệt Công Nợ #${xetDuyetCongNo.id}`}
        subtitle="Cập nhật thông tin BGD duyệt"
        schema={bgdDuyetSchema}
        defaultValues={defaultValues}
        sections={sections}
        onSubmit={handleSubmit}
        onSuccess={onSuccess}
        submitLabel="Lưu"
        successMessage="Cập nhật BGD duyệt thành công"
        errorMessage="Không thể cập nhật BGD duyệt"
        isLoading={updateMutation.isPending}
      />
    </>
  )
}
