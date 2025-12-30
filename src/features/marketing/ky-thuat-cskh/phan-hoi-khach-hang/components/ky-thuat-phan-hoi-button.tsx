"use client"

import * as React from "react"
import { Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUpdatePhanHoiKhachHang } from "../hooks"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { phanHoiKhachHangQueryKeys } from "@/lib/react-query/query-keys"
import { PhanHoiKhachHang } from "../schema"
import { GenericFormDialog, FormSection } from "@/shared/components"
import { z } from "zod"
import { NhanVienSelectFormField } from "./nhan-vien-select-form-field"

interface KyThuatPhanHoiButtonProps {
  phanHoi: PhanHoiKhachHang
  onSuccess?: () => void
  variant?: "default" | "primary"
  iconOnly?: boolean
}

const kyThuatPhanHoiSchema = z.object({
  trang_thai: z.string().optional().nullable(),
  kt_mo_ta_loi: z.string().optional().nullable(),
  kt_phu_trach: z.number().optional().nullable(),
  kt_quyet_dinh: z.string().optional().nullable(),
})

export function KyThuatPhanHoiButton({ phanHoi, onSuccess, variant = "default", iconOnly = false }: KyThuatPhanHoiButtonProps) {
  const [open, setOpen] = React.useState(false)
  const updateMutation = useUpdatePhanHoiKhachHang()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const defaultValues = React.useMemo(() => ({
    trang_thai: phanHoi.trang_thai || "Mới",
    kt_mo_ta_loi: phanHoi.kt_mo_ta_loi || "",
    kt_phu_trach: phanHoi.kt_phu_trach ? Number(phanHoi.kt_phu_trach) : null,
    kt_quyet_dinh: (phanHoi as any).kt_quyet_dinh || "",
  }), [phanHoi])

  const sections: FormSection[] = React.useMemo(() => [
    {
      title: "Thông Tin Kỹ Thuật Phản Hồi",
      fields: [
        {
          name: "trang_thai",
          label: "Trạng Thái",
          type: "toggle",
          options: [
            { label: "Mới", value: "Mới" },
            { label: "Đang xử lý", value: "Đang xử lý" },
            { label: "Đã xử lý", value: "Đã xử lý" },
            { label: "Hủy", value: "Hủy" },
          ],
          colSpan: 1,
        },
        {
          name: "kt_phu_trach",
          label: "KT Phụ Trách",
          type: "custom",
          customComponent: NhanVienSelectFormField,
          placeholder: "Chọn nhân viên kỹ thuật phụ trách...",
          colSpan: 1,
        },
        {
          name: "kt_mo_ta_loi",
          label: "KT Mô Tả Lỗi",
          type: "textarea",
          placeholder: "Nhập mô tả lỗi từ kỹ thuật...",
          colSpan: 3,
        },
        {
          name: "kt_quyet_dinh",
          label: "KT Quyết Định",
          type: "textarea",
          placeholder: "Nhập quyết định từ kỹ thuật...",
          colSpan: 3,
        },
      ],
    },
  ], [])

  const handleSubmit = async (data: z.infer<typeof kyThuatPhanHoiSchema>) => {
    try {
      await updateMutation.mutateAsync({
        id: phanHoi.id!,
        input: {
          trang_thai: data.trang_thai,
          kt_mo_ta_loi: data.kt_mo_ta_loi,
          kt_phu_trach: data.kt_phu_trach ? String(data.kt_phu_trach) : null,
          kt_quyet_dinh: data.kt_quyet_dinh || null,
        } as any,
      })

      queryClient.invalidateQueries({ queryKey: phanHoiKhachHangQueryKeys.all() })

      toast({
        title: "Thành công",
        description: "Cập nhật kỹ thuật phản hồi thành công",
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật kỹ thuật phản hồi",
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
            <span className="sr-only">Kỹ Thuật Phản Hồi</span>
            <Wrench className="h-4 w-4" />
          </>
        ) : (
          <>
            <Wrench className="mr-2 h-4 w-4" />
            Kỹ Thuật Phản Hồi
          </>
        )}
      </Button>

      <GenericFormDialog
        open={open}
        onOpenChange={setOpen}
        title={`Kỹ Thuật Phản Hồi - Phản Hồi Khách Hàng #${phanHoi.id}`}
        subtitle="Cập nhật thông tin kỹ thuật phản hồi"
        schema={kyThuatPhanHoiSchema}
        defaultValues={defaultValues}
        sections={sections}
        onSubmit={handleSubmit}
        onSuccess={onSuccess}
        submitLabel="Lưu"
        successMessage="Cập nhật kỹ thuật phản hồi thành công"
        errorMessage="Không thể cập nhật kỹ thuật phản hồi"
        isLoading={updateMutation.isPending}
      />
    </>
  )
}
