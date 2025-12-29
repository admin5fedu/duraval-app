"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { nhomDiemCongTruQueryKeys } from "@/lib/react-query/query-keys"
import { NhomDiemCongTruAPI } from "../services/nhom-diem-cong-tru.api"
import type { CreateNhomDiemCongTruInput } from "../types"
import { nhomDiemCongTruSchema } from "../schema"

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
function mapExcelToDb(row: ExcelRow, rowIndex: number): { data: CreateNhomDiemCongTruInput; row: number } {
  // Extract fields
  const hangMuc = String(row.hang_muc || "").trim()
  const nhom = String(row.nhom || "").trim()
  const min = row.min
  const max = row.max
  const moTa = row.mo_ta ? String(row.mo_ta).trim() : null
  const pbApDungIb = row.pb_ap_dung_ib

  // Validate required fields
  if (!hangMuc) {
    throw new Error(`Dòng ${rowIndex + 1}: Hạng mục không được để trống`)
  }
  // Validate hang_muc must be "Cộng" or "Trừ"
  if (hangMuc !== "Cộng" && hangMuc !== "Trừ") {
    throw new Error(`Dòng ${rowIndex + 1}: Hạng mục phải là 'Cộng' hoặc 'Trừ'`)
  }
  if (!nhom) {
    throw new Error(`Dòng ${rowIndex + 1}: Nhóm không được để trống`)
  }
  if (min === undefined || min === null) {
    throw new Error(`Dòng ${rowIndex + 1}: Min không được để trống`)
  }
  if (max === undefined || max === null) {
    throw new Error(`Dòng ${rowIndex + 1}: Max không được để trống`)
  }

  const minNumber = Number(min)
  const maxNumber = Number(max)
  
  if (isNaN(minNumber)) {
    throw new Error(`Dòng ${rowIndex + 1}: Min phải là số`)
  }
  if (isNaN(maxNumber)) {
    throw new Error(`Dòng ${rowIndex + 1}: Max phải là số`)
  }

  // Handle pb_ap_dung_ib - can be array, comma-separated string, or null
  let pbApDungArray: number[] | null = null
  if (pbApDungIb !== undefined && pbApDungIb !== null && pbApDungIb !== "") {
    if (Array.isArray(pbApDungIb)) {
      pbApDungArray = pbApDungIb.filter(id => id != null).map(id => Number(id)).filter(id => !isNaN(id))
    } else if (typeof pbApDungIb === "string") {
      // Try to parse as comma-separated string
      const ids = pbApDungIb.split(",").map(s => s.trim()).filter(s => s)
      pbApDungArray = ids.map(id => Number(id)).filter(id => !isNaN(id))
      if (pbApDungArray.length === 0) {
        pbApDungArray = null
      }
    } else {
      // Single number
      const id = Number(pbApDungIb)
      if (!isNaN(id)) {
        pbApDungArray = [id]
      }
    }
  }

  // Build data object
  const data: CreateNhomDiemCongTruInput = {
    hang_muc: hangMuc,
    nhom: nhom,
    min: minNumber,
    max: maxNumber,
    mo_ta: moTa,
    pb_ap_dung_ib: pbApDungArray,
  }

  // Validate with Zod schema
  const result = nhomDiemCongTruSchema.omit({ 
    id: true, 
    tg_tao: true, 
    tg_cap_nhat: true, 
    nguoi_tao_id: true,
    nguoi_tao_ten: true,
    nguoi_tao: true,
  }).safeParse(data)
  
  if (!result.success) {
    const errors = result.error.issues.map((e) => e.message).join(", ")
    throw new Error(`Dòng ${rowIndex + 1}: ${errors}`)
  }

  return { data: result.data as CreateNhomDiemCongTruInput, row: rowIndex + 1 }
}

/**
 * Hook to batch upsert nhóm điểm cộng trừ from Excel
 */
export function useBatchUpsertNhomDiemCongTru() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (rows: ExcelRow[]): Promise<BatchUpsertResult> => {
      const result: BatchUpsertResult = {
        inserted: 0,
        updated: 0,
        errors: [],
      }

      // Map and validate all records first
      const mappedRecords: { data: CreateNhomDiemCongTruInput; row: number }[] = []
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
      // We'll match by hang_muc + nhom combination
      const existingRecords = await NhomDiemCongTruAPI.getAll()
      const existingMap = new Map(
        existingRecords.map((r) => [`${r.hang_muc}|${r.nhom}`, r])
      )

      // Process each mapped record
      for (const { data, row } of mappedRecords) {
        try {
          const key = `${data.hang_muc}|${data.nhom}`
          const existing = existingMap.get(key)

          if (existing) {
            // Update existing record
            await NhomDiemCongTruAPI.update(existing.id!, data)
            result.updated++
          } else {
            // Create new record
            await NhomDiemCongTruAPI.create(data)
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
        queryKey: nhomDiemCongTruQueryKeys.all(),
        exact: false,
      })
      queryClient.refetchQueries({
        queryKey: nhomDiemCongTruQueryKeys.list(),
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

