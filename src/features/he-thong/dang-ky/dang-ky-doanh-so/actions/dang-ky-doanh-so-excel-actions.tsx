"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { dangKyDoanhSoQueryKeys } from "@/lib/react-query/query-keys"
import { DangKyDoanhSoAPI } from "../services/dang-ky-doanh-so.api"
import type { CreateDangKyDoanhSoInput } from "../schema"
import { dangKyDoanhSoSchema } from "../schema"
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
function mapExcelToDb(row: ExcelRow, rowIndex: number): { data: CreateDangKyDoanhSoInput; row: number } {
  // Extract fields
  const nam = row.nam ? Number(row.nam) : null
  const thang = row.thang ? Number(row.thang) : null
  const nhanVienId = row.nhan_vien_id ? Number(row.nhan_vien_id) : null
  const tenNhanVien = row.ten_nhan_vien ? String(row.ten_nhan_vien).trim() : null
  const bacDt = row.bac_dt ? String(row.bac_dt).trim() : null
  const doanhThu = row.doanh_thu ? Number(row.doanh_thu) : null
  const nhomApDoanhThuId = row.nhom_ap_doanh_thu_id ? Number(row.nhom_ap_doanh_thu_id) : null
  const tenNhomApDoanhThu = row.ten_nhom_ap_doanh_thu ? String(row.ten_nhom_ap_doanh_thu).trim() : null
  const moTa = row.mo_ta ? String(row.mo_ta).trim() : null

  // Build data object
  // Required fields: nam, thang, nhan_vien_id, bac_dt, doanh_thu, nhom_ap_doanh_thu_id
  const data: CreateDangKyDoanhSoInput = {
    nam: nam ?? 0,
    thang: thang ?? 0,
    nhan_vien_id: nhanVienId ?? 0,
    ten_nhan_vien: tenNhanVien ?? null,
    bac_dt: bacDt ?? "",
    doanh_thu: doanhThu ?? 0,
    nhom_ap_doanh_thu_id: nhomApDoanhThuId ?? 0,
    ten_nhom_ap_doanh_thu: tenNhomApDoanhThu ?? null,
    mo_ta: moTa ?? null,
    trao_doi: null, // Not imported from Excel
  }

  // Validate with Zod schema
  const result = dangKyDoanhSoSchema.omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true }).safeParse(data)
  if (!result.success) {
    const errors = result.error.issues.map((e) => e.message).join(", ")
    throw new Error(`Dòng ${rowIndex + 1}: ${errors}`)
  }

  return { data: result.data as CreateDangKyDoanhSoInput, row: rowIndex + 1 }
}

/**
 * Hook to batch upsert đăng ký doanh số from Excel
 */
export function useBatchUpsertDangKyDoanhSo() {
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

          // Try to find existing record by nhan_vien_id, nam, thang, nhom_ap_doanh_thu_id
          // This is a simple approach - in real scenario, you might want a more specific key
          const existingList = await DangKyDoanhSoAPI.getAll()
          let existing = null
          
          if (data.nhan_vien_id && data.nam && data.thang && data.nhom_ap_doanh_thu_id) {
            existing = existingList.find(
              (item) =>
                item.nhan_vien_id === data.nhan_vien_id &&
                item.nam === data.nam &&
                item.thang === data.thang &&
                item.nhom_ap_doanh_thu_id === data.nhom_ap_doanh_thu_id
            )
          }

          if (existing) {
            // Update existing record (don't change nguoi_tao_id)
            await DangKyDoanhSoAPI.update(existing.id!, data)
            result.updated++
          } else {
            // Create new record with nguoi_tao_id
            await DangKyDoanhSoAPI.create(dataWithNguoiTao)
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
        queryKey: dangKyDoanhSoQueryKeys.all(),
        exact: false,
      })
      queryClient.refetchQueries({
        queryKey: dangKyDoanhSoQueryKeys.list(),
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

