"use client"

import * as React from "react"
import { CheckCircle2 } from "lucide-react"
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

interface QuanLyDuyetButtonProps {
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

const quanLyDuyetSchema = z.object({
  quan_ly_duyet: z.string({ required_error: "Quản lý duyệt là bắt buộc" }).min(1, "Quản lý duyệt là bắt buộc"),
  ghi_chu: z.string({ required_error: "Ghi chú là bắt buộc" }).min(1, "Vui lòng nhập lý do duyệt"),
  trao_doi_khi_duyet: z.string().optional().nullable(),
})

export function QuanLyDuyetButton({ xetDuyetCongNo, onSuccess, variant = "default" }: QuanLyDuyetButtonProps) {
  const [open, setOpen] = React.useState(false)
  const updateMutation = useUpdateXetDuyetCongNo()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { employee } = useAuthStore()

  // Check if can perform action
  const canQuanLyDuyet = React.useMemo(() => {
    // Chỉ cho phép khi: Chờ kiểm tra hoặc chưa có trạng thái
    return xetDuyetCongNo.trang_thai === "Chờ kiểm tra" || 
           xetDuyetCongNo.trang_thai === null ||
           xetDuyetCongNo.trang_thai === undefined
  }, [xetDuyetCongNo.trang_thai])

  const defaultValues = React.useMemo(() => ({
    quan_ly_duyet: xetDuyetCongNo.quan_ly_duyet || "",
    ghi_chu: "",
    trao_doi_khi_duyet: "",
  }), [xetDuyetCongNo])

  const sections: FormSection[] = React.useMemo(() => [
    {
      title: "Thông Tin Quản Lý Duyệt",
      fields: [
        {
          name: "quan_ly_duyet",
          label: "Quản Lý Duyệt",
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
      ],
    },
  ], [])

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

  const handleSubmit = async (data: z.infer<typeof quanLyDuyetSchema>) => {
    try {
      // Tính trạng thái mới
      const newTrangThai = calculateTrangThai(
        data.quan_ly_duyet,
        xetDuyetCongNo.bgd_duyet,
        xetDuyetCongNo.trang_thai
      )

      // Thêm trao đổi mới nếu có
      let newTraoDoiList = [...traoDoiList]
      if (data.trao_doi_khi_duyet && data.trao_doi_khi_duyet.trim()) {
        const traoDoiMoi: TraoDoiItem = {
          noi_dung: `[Quản lý duyệt: ${data.quan_ly_duyet}] ${data.trao_doi_khi_duyet.trim()}`,
          nguoi_trao_doi_id: employee?.ma_nhan_vien || null,
          nguoi_trao_doi: employee?.ho_ten || "",
          thoi_gian: new Date().toISOString(),
          loai: "quan_ly_duyet",
        }
        newTraoDoiList.push(traoDoiMoi)
      }

      // Tạo audit log entry
      const auditEntry = createAuditLogEntry(
        `Quản lý ${data.quan_ly_duyet}`,
        employee?.ma_nhan_vien || null,
        employee?.ho_ten || "",
        data.ghi_chu,
        "quan_ly"
      )
      const newAuditLog = addAuditLog(existingAuditLog, auditEntry)

      await updateMutation.mutateAsync({
        id: xetDuyetCongNo.id!,
        input: {
          quan_ly_duyet: data.quan_ly_duyet,
          quan_ly_id: employee?.ma_nhan_vien || null,
          trang_thai: newTrangThai,
          trao_doi: newTraoDoiList.length > 0 ? newTraoDoiList : undefined,
          audit_log: newAuditLog,
          // tg_quan_ly_duyet sẽ được set tự động bởi database (default now())
        },
      })

      queryClient.invalidateQueries({ queryKey: xetDuyetCongNoQueryKeys.all() })

      toast({
        title: "Thành công",
        description: "Cập nhật quản lý duyệt thành công",
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật quản lý duyệt",
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
          if (!canQuanLyDuyet) {
            toast({
              title: "Không thể duyệt",
              description: "Chỉ có thể duyệt khi trạng thái là 'Chờ kiểm tra'",
              variant: "error",
            })
            return
          }
          setOpen(true)
        }}
        disabled={!canQuanLyDuyet}
      >
        <CheckCircle2 className="mr-2 h-4 w-4" />
        Quản Lý Duyệt
      </Button>

      <GenericFormDialog
        open={open}
        onOpenChange={setOpen}
        title={`Quản Lý Duyệt - Xét Duyệt Công Nợ #${xetDuyetCongNo.id}`}
        subtitle="Cập nhật thông tin quản lý duyệt"
        schema={quanLyDuyetSchema}
        defaultValues={defaultValues}
        sections={sections}
        onSubmit={handleSubmit}
        onSuccess={onSuccess}
        submitLabel="Lưu"
        successMessage="Cập nhật quản lý duyệt thành công"
        errorMessage="Không thể cập nhật quản lý duyệt"
        isLoading={updateMutation.isPending}
      />
    </>
  )
}
