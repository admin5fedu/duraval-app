"use client"

import * as React from "react"
import { Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUpdatePhanHoiKhachHang } from "../hooks"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { phanHoiKhachHangQueryKeys } from "@/lib/react-query/query-keys"
import { PhanHoiKhachHang } from "../schema"
import { GenericFormDialog, FormSection } from "@/shared/components"
import { z } from "zod"
import { format } from "date-fns"

interface DonHoanKhoButtonProps {
  phanHoi: PhanHoiKhachHang
  onSuccess?: () => void
  variant?: "default" | "primary"
  iconOnly?: boolean
}

const donHoanKhoSchema = z.object({
  id_don_hoan: z.string().optional().nullable(),
  trang_thai_don_hoan: z.string().optional().nullable(),
  bien_phap_don_hoan: z.string().optional().nullable(),
  ghi_chu_don_hoan: z.string().optional().nullable(),
  ngay_hoan_thanh: z.string().optional().nullable(),
  ket_qua_cuoi_cung: z.string().optional().nullable(),
})

export function DonHoanKhoButton({ phanHoi, onSuccess, variant = "default", iconOnly = false }: DonHoanKhoButtonProps) {
  const [open, setOpen] = React.useState(false)
  const updateMutation = useUpdatePhanHoiKhachHang()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const formatDateForInput = (dateStr: string | null | undefined): string => {
    if (!dateStr) return ""
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return ""
      return format(date, "yyyy-MM-dd")
    } catch {
      return ""
    }
  }

  const defaultValues = React.useMemo(() => ({
    id_don_hoan: phanHoi.id_don_hoan || "",
    trang_thai_don_hoan: phanHoi.trang_thai_don_hoan || "chờ hoàn",
    bien_phap_don_hoan: phanHoi.bien_phap_don_hoan || "",
    ghi_chu_don_hoan: phanHoi.ghi_chu_don_hoan || "",
    ngay_hoan_thanh: formatDateForInput(phanHoi.ngay_hoan_thanh),
    ket_qua_cuoi_cung: phanHoi.ket_qua_cuoi_cung || "",
  }), [phanHoi])

  const sections: FormSection[] = React.useMemo(() => [
    {
      title: "Thông Tin Đơn Hoàn Kho",
      fields: [
        {
          name: "id_don_hoan",
          label: "ID Đơn Hoàn",
          type: "text",
          placeholder: "Nhập ID đơn hoàn...",
          colSpan: 1,
        },
        {
          name: "trang_thai_don_hoan",
          label: "Trạng Thái Đơn Hoàn",
          type: "toggle",
          options: [
            { label: "Chờ hoàn", value: "chờ hoàn" },
            { label: "Đã hoàn", value: "đã hoàn" },
            { label: "Đang xử lý", value: "đang xử lý" },
            { label: "Hoàn thành", value: "hoàn thành" },
            { label: "Hủy", value: "hủy" },
          ],
          colSpan: 1,
        },
        {
          name: "ngay_hoan_thanh",
          label: "Ngày Hoàn Thành",
          type: "date",
          colSpan: 1,
        },
        {
          name: "bien_phap_don_hoan",
          label: "Biện Pháp Đơn Hoàn",
          type: "textarea",
          placeholder: "Nhập biện pháp đơn hoàn...",
          colSpan: 3,
        },
        {
          name: "ghi_chu_don_hoan",
          label: "Ghi Chú Đơn Hoàn",
          type: "textarea",
          placeholder: "Nhập ghi chú đơn hoàn...",
          colSpan: 3,
        },
        {
          name: "ket_qua_cuoi_cung",
          label: "Kết Quả Cuối Cùng",
          type: "textarea",
          placeholder: "Nhập kết quả cuối cùng...",
          colSpan: 3,
        },
      ],
    },
  ], [])

  const handleSubmit = async (data: z.infer<typeof donHoanKhoSchema>) => {
    try {
      await updateMutation.mutateAsync({
        id: phanHoi.id!,
        input: {
          id_don_hoan: data.id_don_hoan || null,
          trang_thai_don_hoan: data.trang_thai_don_hoan || null,
          bien_phap_don_hoan: data.bien_phap_don_hoan || null,
          ghi_chu_don_hoan: data.ghi_chu_don_hoan || null,
          ngay_hoan_thanh: data.ngay_hoan_thanh || null,
          ket_qua_cuoi_cung: data.ket_qua_cuoi_cung || null,
        } as any,
      })

      queryClient.invalidateQueries({ queryKey: phanHoiKhachHangQueryKeys.all() })

      toast({
        title: "Thành công",
        description: "Cập nhật đơn hoàn kho thành công",
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật đơn hoàn kho",
        variant: "error",
      })
      throw error
    }
  }

  return (
    <>
      <Button
        variant={variant === "primary" ? "default" : iconOnly ? "ghost" : "outline"}
        size={iconOnly ? "icon" : "sm"}
        className={iconOnly ? "h-8 w-8 hover:text-blue-600 shrink-0" : actionButtonClass()}
        onClick={() => setOpen(true)}
      >
        {iconOnly ? (
          <>
            <span className="sr-only">Đơn Hoàn Kho</span>
            <Package className="h-4 w-4" />
          </>
        ) : (
          <>
            <Package className="mr-2 h-4 w-4" />
            Đơn Hoàn Kho
          </>
        )}
      </Button>

      <GenericFormDialog
        open={open}
        onOpenChange={setOpen}
        title={`Đơn Hoàn Kho - Phản Hồi Khách Hàng #${phanHoi.id}`}
        subtitle="Cập nhật thông tin đơn hoàn kho"
        schema={donHoanKhoSchema}
        defaultValues={defaultValues}
        sections={sections}
        onSubmit={handleSubmit}
        onSuccess={onSuccess}
        submitLabel="Lưu"
        successMessage="Cập nhật đơn hoàn kho thành công"
        errorMessage="Không thể cập nhật đơn hoàn kho"
        isLoading={updateMutation.isPending}
      />
    </>
  )
}
