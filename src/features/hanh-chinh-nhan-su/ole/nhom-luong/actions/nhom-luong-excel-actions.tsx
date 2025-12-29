"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { nhomLuongQueryKeys } from "@/lib/react-query/query-keys"
import { NhomLuongAPI } from "../services/nhom-luong.api"
import type { CreateNhomLuongInput } from "../types"
import { nhomLuongSchema } from "../schema"
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
function mapExcelToDb(row: ExcelRow, rowIndex: number): { data: CreateNhomLuongInput; row: number } {
  // Extract fields
  const tenNhom = String(row.ten_nhom || "").trim()
  const moTa = row.mo_ta ? String(row.mo_ta).trim() : null

  // Validate required fields
  if (!tenNhom) {
    throw new Error(`Dòng ${rowIndex + 1}: Tên nhóm không được để trống`)
  }

  // Build data object
  const data: CreateNhomLuongInput = {
    ten_nhom: tenNhom,
    mo_ta: moTa,
  }

  // Validate with Zod schema
  const result = nhomLuongSchema.omit({ 
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

  return { data: result.data as CreateNhomLuongInput, row: rowIndex + 1 }
}

/**
 * Hook to batch upsert nhóm lương from Excel
 */
export function useBatchUpsertNhomLuong() {
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
      const mappedRecords: { data: CreateNhomLuongInput; row: number }[] = []
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
      // We'll match by ten_nhom
      const existingRecords = await NhomLuongAPI.getAll()
      const existingMap = new Map(
        existingRecords.map((r) => [r.ten_nhom, r])
      )

      // Process each mapped record
      for (const { data, row } of mappedRecords) {
        try {
          const existing = existingMap.get(data.ten_nhom)

          if (existing) {
            // Update existing record
            await NhomLuongAPI.update(existing.id!, data)
            result.updated++
          } else {
            // Create new record - tự động gán nguoi_tao_id từ employee hiện tại
            await NhomLuongAPI.create({
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
        queryKey: nhomLuongQueryKeys.all(),
        exact: false,
      })
      queryClient.refetchQueries({
        queryKey: nhomLuongQueryKeys.list(),
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

