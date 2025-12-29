"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { diemCongTruQueryKeys } from "@/lib/react-query/query-keys"
import { DiemCongTruAPI } from "../services/diem-cong-tru.api"
import type { CreateDiemCongTruInput } from "../types"
import { diemCongTruSchema } from "../schema"
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
function mapExcelToDb(row: ExcelRow, rowIndex: number): { data: CreateDiemCongTruInput; row: number } {
  // Extract fields
  const nhanVienId = row.nhan_vien_id ? Number(row.nhan_vien_id) : null
  const hoVaTen = row.ho_va_ten ? String(row.ho_va_ten).trim() : null
  const ngay = row.ngay ? String(row.ngay).trim() : null
  const maPhongId = row.ma_phong_id ? Number(row.ma_phong_id) : null
  const phongBanId = row.phong_ban_id ? Number(row.phong_ban_id) : null
  const loai = row.loai ? String(row.loai).trim() : null
  const nhom = row.nhom ? String(row.nhom).trim() : null
  const diem = row.diem !== undefined && row.diem !== null ? Number(row.diem) : 0
  const tien = row.tien !== undefined && row.tien !== null ? Number(row.tien) : 0
  const nhomLuongId = row.nhom_luong_id ? Number(row.nhom_luong_id) : null
  const tenNhomLuong = row.ten_nhom_luong ? String(row.ten_nhom_luong).trim() : null
  const moTa = row.mo_ta ? String(row.mo_ta).trim() : null
  const trangThai = row.trang_thai ? String(row.trang_thai).trim() : null

  // Validate required fields
  if (!nhanVienId) {
    throw new Error(`Dòng ${rowIndex + 1}: Mã nhân viên không được để trống`)
  }
  if (!ngay) {
    throw new Error(`Dòng ${rowIndex + 1}: Ngày không được để trống`)
  }

  // Build data object
  const data: CreateDiemCongTruInput = {
    nhan_vien_id: nhanVienId,
    ho_va_ten: hoVaTen,
    ngay: ngay,
    ma_phong_id: maPhongId,
    phong_ban_id: phongBanId,
    loai: loai,
    nhom: nhom,
    diem: diem,
    tien: tien,
    nhom_luong_id: nhomLuongId,
    ten_nhom_luong: tenNhomLuong,
    mo_ta: moTa,
    trang_thai: trangThai,
  }

  // Validate with Zod schema
  const result = diemCongTruSchema.omit({ 
    id: true, 
    tg_tao: true, 
    tg_cap_nhat: true, 
    nguoi_tao_id: true,
    nhan_vien: true,
    phong_ban: true,
    nhom_luong: true,
    nguoi_tao: true,
  }).safeParse(data)
  
  if (!result.success) {
    const errors = result.error.issues.map((e) => e.message).join(", ")
    throw new Error(`Dòng ${rowIndex + 1}: ${errors}`)
  }

  return { data: result.data as CreateDiemCongTruInput, row: rowIndex + 1 }
}

/**
 * Hook to batch upsert điểm cộng trừ from Excel
 */
export function useBatchUpsertDiemCongTru() {
  const queryClient = useQueryClient()
  const { employee } = useAuthStore()

  return useMutation({
    mutationFn: async (rows: ExcelRow[]): Promise<BatchUpsertResult> => {
      const result: BatchUpsertResult = {
        inserted: 0,
        updated: 0,
        errors: [],
      }

      // Map and validate all records first
      const mappedRecords: { data: CreateDiemCongTruInput; row: number }[] = []
      for (let i = 0; i < rows.length; i++) {
        try {
          mappedRecords.push(mapExcelToDb(rows[i], i))
        } catch (error: any) {
          result.errors.push({
            row: i + 1,
            error: error.message || "Lỗi không xác định",
          })
        }
      }

      // If there are mapping/validation errors, return them early
      if (result.errors.length > 0 && mappedRecords.length === 0) {
        return result
      }

      // Get all existing records to check for duplicates
      // We'll match by nhan_vien_id + ngay
      const existingRecords = await DiemCongTruAPI.getAll()
      const existingMap = new Map(
        existingRecords.map((r) => [`${r.nhan_vien_id}_${r.ngay}`, r])
      )

      // Process each mapped record
      for (const { data, row } of mappedRecords) {
        try {
          const key = `${data.nhan_vien_id}_${data.ngay}`
          const existing = existingMap.get(key)

          if (existing) {
            // Update existing record
            await DiemCongTruAPI.update(existing.id!, data)
            result.updated++
          } else {
            // Create new record - tự động gán nguoi_tao_id từ employee hiện tại
            await DiemCongTruAPI.create({
              ...data,
              nguoi_tao_id: employee?.ma_nhan_vien || null,
            })
            result.inserted++
          }
        } catch (error: any) {
          result.errors.push({
            row,
            error: error.message || "Lỗi không xác định",
          })
        }
      }

      return result
    },
    onSuccess: (result) => {
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: diemCongTruQueryKeys.all(),
        exact: false,
      })
      queryClient.refetchQueries({
        queryKey: diemCongTruQueryKeys.list(),
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

