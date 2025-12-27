"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { chucVuQueryKeys } from "@/lib/react-query/query-keys"
import { ChucVuAPI } from "../services/chuc-vu.api"
import type { CreateChucVuInput } from "../schema"
import { chucVuSchema } from "../schema"

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
function mapExcelToDb(row: ExcelRow, rowIndex: number): { data: CreateChucVuInput; row: number } {
  // Extract fields
  const maChucVu = String(row.ma_chuc_vu || "").trim()
  const tenChucVu = String(row.ten_chuc_vu || "").trim()
  const maCapBac = String(row.ma_cap_bac || "").trim()
  const tenCapBac = row.ten_cap_bac ? String(row.ten_cap_bac).trim() : null
  const maPhongBan = String(row.ma_phong_ban || "").trim()
  const maNhom = row.ma_nhom ? String(row.ma_nhom).trim() : null
  const maBoPhan = row.ma_bo_phan ? String(row.ma_bo_phan).trim() : null
  const maPhong = row.ma_phong ? String(row.ma_phong).trim() : null
  const ngachLuong = row.ngach_luong ? String(row.ngach_luong).trim() : null
  const mucDongBaoHiem = row.muc_dong_bao_hiem ? Number(row.muc_dong_bao_hiem) : null
  const soNgayNghiThu7 = row.so_ngay_nghi_thu_7 ? String(row.so_ngay_nghi_thu_7).trim() : null
  const nhomThuong = row.nhom_thuong ? String(row.nhom_thuong).trim() : null
  const diemThuong = row.diem_thuong ? Number(row.diem_thuong) : null

  // Validate required fields
  if (!maChucVu) {
    throw new Error(`Dòng ${rowIndex + 1}: Mã chức vụ không được để trống`)
  }
  if (!tenChucVu) {
    throw new Error(`Dòng ${rowIndex + 1}: Tên chức vụ không được để trống`)
  }
  if (!maCapBac) {
    throw new Error(`Dòng ${rowIndex + 1}: Mã cấp bậc không được để trống`)
  }
  if (!maPhongBan) {
    throw new Error(`Dòng ${rowIndex + 1}: Mã phòng ban không được để trống`)
  }

  // Build data object
  const data: CreateChucVuInput = {
    ma_chuc_vu: maChucVu,
    ten_chuc_vu: tenChucVu,
    ma_cap_bac: maCapBac,
    ten_cap_bac: tenCapBac || null,
    ma_phong_ban: maPhongBan,
    ma_nhom: maNhom || null,
    ma_bo_phan: maBoPhan || null,
    ma_phong: maPhong || null,
    ngach_luong: ngachLuong || null,
    muc_dong_bao_hiem: mucDongBaoHiem || null,
    so_ngay_nghi_thu_7: soNgayNghiThu7 || null,
    nhom_thuong: nhomThuong || null,
    diem_thuong: diemThuong || null,
    phong_ban_id: null,
    cap_bac_id: null,
  }

  // Validate with Zod schema
  const result = chucVuSchema.omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao: true }).safeParse(data)
  if (!result.success) {
    const errors = result.error.issues.map((e) => e.message).join(", ")
    throw new Error(`Dòng ${rowIndex + 1}: ${errors}`)
  }

  return { data: result.data as CreateChucVuInput, row: rowIndex + 1 }
}

/**
 * Hook to batch upsert chức vụ from Excel
 */
export function useBatchUpsertChucVu() {
  const queryClient = useQueryClient()

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

          // Try to find existing record by ma_chuc_vu
          const existingList = await ChucVuAPI.getAll()
          const existing = existingList.find((item) => item.ma_chuc_vu === data.ma_chuc_vu)

          if (existing) {
            // Update existing record
            await ChucVuAPI.update(existing.id!, data)
            result.updated++
          } else {
            // Create new record
            await ChucVuAPI.create(data)
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
        queryKey: chucVuQueryKeys.all(),
        exact: false,
      })
      queryClient.refetchQueries({
        queryKey: chucVuQueryKeys.list(),
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

