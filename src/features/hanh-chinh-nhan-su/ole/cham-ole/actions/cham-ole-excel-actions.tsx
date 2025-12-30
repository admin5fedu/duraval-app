"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { chamOleQueryKeys } from "@/lib/react-query/query-keys"
import { ChamOleAPI } from "../services/cham-ole.api"
import type { CreateChamOleInput } from "../types"
import { chamOleSchema } from "../schema"
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
function mapExcelToDb(row: ExcelRow, rowIndex: number): { data: CreateChamOleInput; row: number } {
  // Extract fields
  const nhanVienId = row.nhan_vien_id ? Number(row.nhan_vien_id) : null
  const nam = row.nam !== undefined && row.nam !== null ? Number(row.nam) : null
  const thang = row.thang !== undefined && row.thang !== null ? Number(row.thang) : null
  const phongId = row.phong_id ? Number(row.phong_id) : null
  const nhomId = row.nhom_id ? Number(row.nhom_id) : null
  const chucVuId = row.chuc_vu_id ? Number(row.chuc_vu_id) : null
  const danhGia = row.danh_gia ? String(row.danh_gia).trim() : null
  const ole = row.ole !== undefined && row.ole !== null ? Number(row.ole) : null
  const kpi = row.kpi !== undefined && row.kpi !== null ? Number(row.kpi) : null
  const cong = row.cong !== undefined && row.cong !== null ? Number(row.cong) : null
  const tru = row.tru !== undefined && row.tru !== null ? Number(row.tru) : null
  const ghiChu = row.ghi_chu ? String(row.ghi_chu).trim() : null

  // Validate required fields
  if (!nhanVienId) {
    throw new Error(`Dòng ${rowIndex + 1}: Mã nhân viên không được để trống`)
  }
  if (!nam) {
    throw new Error(`Dòng ${rowIndex + 1}: Năm không được để trống`)
  }
  if (!thang) {
    throw new Error(`Dòng ${rowIndex + 1}: Tháng không được để trống`)
  }

  // Build data object
  const data: CreateChamOleInput = {
    nhan_vien_id: nhanVienId,
    nam: nam,
    thang: thang,
    phong_id: phongId,
    nhom_id: nhomId,
    chuc_vu_id: chucVuId,
    danh_gia: danhGia,
    ole: ole,
    kpi: kpi,
    cong: cong,
    tru: tru,
    ghi_chu: ghiChu,
  }

  // Validate with Zod schema
  const result = chamOleSchema.omit({ 
    id: true, 
    tg_tao: true, 
    tg_cap_nhat: true, 
    nguoi_tao_id: true,
    nhan_vien: true,
    phong_ban: true,
    chuc_vu: true,
    nguoi_tao: true,
  }).safeParse(data)
  
  if (!result.success) {
    const errors = result.error.issues.map((e) => e.message).join(", ")
    throw new Error(`Dòng ${rowIndex + 1}: ${errors}`)
  }

  return { data: result.data as CreateChamOleInput, row: rowIndex + 1 }
}

/**
 * Hook to batch upsert chấm OLE from Excel
 */
export function useBatchUpsertChamOle() {
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
      const mappedRecords: { data: CreateChamOleInput; row: number }[] = []
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
      // We'll match by nhan_vien_id + nam + thang
      const existingRecords = await ChamOleAPI.getAll()
      const existingMap = new Map(
        existingRecords.map((r) => [`${r.nhan_vien_id}_${r.nam}_${r.thang}`, r])
      )

      // Process each mapped record
      for (const { data, row } of mappedRecords) {
        try {
          const key = `${data.nhan_vien_id}_${data.nam}_${data.thang}`
          const existing = existingMap.get(key)

          if (existing) {
            // Update existing record
            await ChamOleAPI.update(existing.id!, data)
            result.updated++
          } else {
            // Create new record - tự động gán nguoi_tao_id từ employee hiện tại
            await ChamOleAPI.create({
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
        queryKey: chamOleQueryKeys.all(),
        exact: false,
      })
      queryClient.refetchQueries({
        queryKey: chamOleQueryKeys.list(),
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

