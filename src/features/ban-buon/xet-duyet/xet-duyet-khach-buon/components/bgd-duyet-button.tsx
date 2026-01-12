"use client"

import * as React from "react"
import { ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUpdateXetDuyetKhachBuon } from "../hooks/use-xet-duyet-khach-buon"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { xetDuyetKhachBuonQueryKeys } from "../hooks/use-xet-duyet-khach-buon"
import { XetDuyetKhachBuon } from "../schema"
import { GenericFormDialog, FormSection } from "@/shared/components"
import { z } from "zod"
import { useAuthStore } from "@/shared/stores/auth-store"
import { 
  calculateTrangThai, 
} from "../utils/trang-thai-utils"
import { checkModuleAdmin } from "@/shared/utils/check-module-admin"
import { xetDuyetKhachBuonConfig } from "../config"
import { XetDuyetKhachBuonAPI } from "../services/xet-duyet-khach-buon.api"
import { danhSachKBQueryKeys } from "@/lib/react-query/query-keys"

interface BgdDuyetButtonProps {
  xetDuyetKhachBuon: XetDuyetKhachBuon
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

export function BgdDuyetButton({ xetDuyetKhachBuon, onSuccess, variant = "default" }: BgdDuyetButtonProps) {
  const [open, setOpen] = React.useState(false)
  const updateMutation = useUpdateXetDuyetKhachBuon()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { employee } = useAuthStore()

  // Check if user has admin permission for vượt cấp
  const isModuleAdmin = checkModuleAdmin(xetDuyetKhachBuonConfig.moduleName, employee)

  // Check if can perform action
  const canBgdDuyet = React.useMemo(() => {
    // Cho phép nếu:
    // 1. Quản lý đã đồng ý (flow bình thường)
    // 2. Hoặc BGD có quyền vượt cấp (admin) và chưa có BGD duyệt
    const canNormalFlow = xetDuyetKhachBuon.quan_ly_duyet === "Đồng ý" && 
                          xetDuyetKhachBuon.trang_thai === "Chờ duyệt"
    
    const canOverrule = isModuleAdmin && 
                       !xetDuyetKhachBuon.bgd_duyet &&
                       xetDuyetKhachBuon.trang_thai !== "Đã duyệt" &&
                       xetDuyetKhachBuon.trang_thai !== "Từ chối"
    
    return canNormalFlow || canOverrule
  }, [xetDuyetKhachBuon, isModuleAdmin])

  const defaultValues = React.useMemo(() => ({
    bgd_duyet: xetDuyetKhachBuon.bgd_duyet || "",
    ghi_chu: "",
    trao_doi_khi_duyet: "",
    duyet_vuot_cap: (xetDuyetKhachBuon.quan_ly_duyet !== "Đồng ý" && isModuleAdmin) ? "true" : "false",
  }), [xetDuyetKhachBuon, isModuleAdmin])

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
        ...(isModuleAdmin && xetDuyetKhachBuon.quan_ly_duyet !== "Đồng ý" ? [{
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
  ], [isModuleAdmin, xetDuyetKhachBuon.quan_ly_duyet])

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

  const handleSubmit = async (data: z.infer<typeof bgdDuyetSchema>) => {
    try {
      // Convert duyet_vuot_cap từ string sang boolean
      const duyetVuotCap = data.duyet_vuot_cap === "true"

      // Validation: Nếu không phải vượt cấp, phải có Quản lý đồng ý
      if (!duyetVuotCap && xetDuyetKhachBuon.quan_ly_duyet !== "Đồng ý") {
        toast({
          title: "Lỗi",
          description: "Chỉ có thể duyệt khi Quản lý đã đồng ý, hoặc sử dụng tính năng 'Duyệt vượt cấp'",
          variant: "error",
        })
        return
      }

      // Tính trạng thái mới
      const newTrangThai = calculateTrangThai(
        xetDuyetKhachBuon.quan_ly_duyet,
        data.bgd_duyet,
        xetDuyetKhachBuon.trang_thai
      )

      // Luôn thêm trao đổi log thời gian duyệt vào trao_doi
      let newTraoDoiList = [...traoDoiList]
      
      // Tạo entry log duyệt
      const actionText = duyetVuotCap 
        ? `BGD ${data.bgd_duyet} (Vượt cấp)`
        : `BGD ${data.bgd_duyet}`
      
      const logNoiDung = data.ghi_chu && data.ghi_chu.trim()
        ? `[${actionText}]: ${data.ghi_chu.trim()}`
        : `[${actionText}]`
      
      const duyetEntry: TraoDoiItem = {
        noi_dung: logNoiDung,
        nguoi_trao_doi_id: employee?.ma_nhan_vien || null,
        nguoi_trao_doi: employee?.ho_ten || "",
        thoi_gian: new Date().toISOString(),
        loai: "bgd_duyet",
      }
      newTraoDoiList.push(duyetEntry)
      
      // Thêm trao đổi tùy chọn nếu có
      if (data.trao_doi_khi_duyet && data.trao_doi_khi_duyet.trim()) {
        const traoDoiMoi: TraoDoiItem = {
          noi_dung: data.trao_doi_khi_duyet.trim(),
          nguoi_trao_doi_id: employee?.ma_nhan_vien || null,
          nguoi_trao_doi: employee?.ho_ten || "",
          thoi_gian: new Date().toISOString(),
          loai: "bgd_duyet",
        }
        newTraoDoiList.push(traoDoiMoi)
      }

      // Bước 1: Cập nhật trạng thái đơn xét duyệt
      await updateMutation.mutateAsync({
        id: xetDuyetKhachBuon.id!,
        input: {
          bgd_duyet: data.bgd_duyet,
          bgd_id: employee?.ma_nhan_vien || null,
          trang_thai: newTrangThai,
          trao_doi: newTraoDoiList,
        },
      })

      // Bước 2: Nếu BGD duyệt = "Đồng ý" (trạng thái = "Đã duyệt"), gọi hàm thực thi
      if (data.bgd_duyet === "Đồng ý" && newTrangThai === "Đã duyệt") {
        try {
          const result = await XetDuyetKhachBuonAPI.thucThiXetDuyet()
          
          if (result.updated_count > 0) {
            console.log(`Đã cập nhật ${result.updated_count} khách buôn từ xét duyệt`)
          }
        } catch (error: any) {
          // Log lỗi nhưng không chặn flow chính
          console.error("Lỗi khi thực thi xét duyệt khách buôn:", error)
          // Vẫn hiển thị thông báo thành công cho việc duyệt
        }
      }

      // Bước 3: Invalidate queries để refetch dữ liệu mới nhất
      queryClient.invalidateQueries({ queryKey: xetDuyetKhachBuonQueryKeys.all() })
      queryClient.invalidateQueries({ queryKey: danhSachKBQueryKeys.all() })

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
        title={`BGD Duyệt - Xét Duyệt Khách Buôn #${xetDuyetKhachBuon.id}`}
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

