"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { nhomApDoanhSoQueryKeys } from "@/lib/react-query/query-keys"
import { NhomApDoanhSoAPI } from "../services/nhom-ap-doanh-so.api"
import type { CreateNhomApDoanhSoInput } from "../schema"
import { nhomApDoanhSoSchema } from "../schema"
import { useAuthStore } from "@/shared/stores/auth-store"

interface ExcelRow {
  [key: string]: any
}

interface BatchUpsertResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

/**
 * Map Excel row to database format
 */
function mapExcelToDb(row: ExcelRow, rowIndex: number): { data: CreateNhomApDoanhSoInput; row: number } {
  // Extract fields
  const maNhomAp = String(row.ma_nhom_ap || "").trim()
  const tenNhomAp = String(row.ten_nhom_ap || "").trim()
  const moTa = row.mo_ta ? String(row.mo_ta).trim() : null

  // Validate required fields
  if (!maNhomAp) {
    throw new Error(`Dòng ${rowIndex + 1}: Mã nhóm áp không được để trống`)
  }
  if (!tenNhomAp) {
    throw new Error(`Dòng ${rowIndex + 1}: Tên nhóm áp không được để trống`)
  }

  // Build data object
  const data: CreateNhomApDoanhSoInput = {
    ma_nhom_ap: maNhomAp,
    ten_nhom_ap: tenNhomAp,
    mo_ta: moTa || null,
  }

  // Validate with Zod schema
  const result = nhomApDoanhSoSchema.omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true }).safeParse(data)
  if (!result.success) {
    const errors = result.error.issues.map((e) => e.message).join(", ")
    throw new Error(`Dòng ${rowIndex + 1}: ${errors}`)
  }

  return { data: result.data as CreateNhomApDoanhSoInput, row: rowIndex + 1 }
}

/**
 * Hook to batch upsert nhóm áp doanh số from Excel
 */
export function useBatchUpsertNhomApDoanhSo() {
  const queryClient = useQueryClient()
  const { employee } = useAuthStore()

  return useMutation({
    mutationFn: async (rows: ExcelRow[]): Promise<BatchUpsertResult> => {
      const result: BatchUpsertResult = {
        inserted: 0,
        updated: 0,
        errors: [],
      }

      // Process each row
      for (let i = 0; i < rows.length; i++) {
        try {
          const { data } = mapExcelToDb(rows[i], i)

          // Automatically set nguoi_tao_id from auth store for new records
          const dataWithNguoiTao = {
            ...data,
            nguoi_tao_id: employee?.ma_nhan_vien || null,
          }

          // Try to find existing record by ma_nhom_ap
          const existingList = await NhomApDoanhSoAPI.getAll()
          const existing = existingList.find((item) => item.ma_nhom_ap === data.ma_nhom_ap)

          if (existing) {
            // Update existing record (don't change nguoi_tao_id)
            await NhomApDoanhSoAPI.update(existing.id!, data)
            result.updated++
          } else {
            // Create new record with nguoi_tao_id
            await NhomApDoanhSoAPI.create(dataWithNguoiTao)
            result.inserted++
          }
        } catch (error: any) {
          result.errors.push({
            row: i + 1,
            error: error.message || "Lỗi không xác định",
          })
        }
      }

      return result
    },
    onSuccess: (result) => {
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: nhomApDoanhSoQueryKeys.all(),
        exact: false,
      })
      queryClient.refetchQueries({
        queryKey: nhomApDoanhSoQueryKeys.list(),
        exact: true,
      })

      // Show success message
      const totalProcessed = result.inserted + result.updated
      const errorCount = result.errors.length
      if (errorCount === 0) {
        toast.success(
          `Nhập dữ liệu thành công: ${result.inserted} bản ghi mới, ${result.updated} bản ghi cập nhật`
        )
      } else {
        toast.warning(
          `Nhập dữ liệu hoàn tất: ${totalProcessed} bản ghi thành công, ${errorCount} bản ghi lỗi`
        )
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Có lỗi xảy ra khi nhập dữ liệu")
    },
  })
}

