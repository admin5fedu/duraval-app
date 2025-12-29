"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { capBacQueryKeys } from "@/lib/react-query/query-keys"
import { CapBacAPI } from "../services/cap-bac.api"
import type { CreateCapBacInput } from "../types"
import { capBacSchema } from "../schema"

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
function mapExcelToDb(row: ExcelRow, rowIndex: number): { data: CreateCapBacInput; row: number } {
  // Extract fields
  const maCapBac = String(row.ma_cap_bac || "").trim()
  const tenCapBac = String(row.ten_cap_bac || "").trim()
  const bac = row.bac

  // Validate required fields
  if (!maCapBac) {
    throw new Error(`Dòng ${rowIndex + 1}: Mã cấp bậc không được để trống`)
  }
  if (!tenCapBac) {
    throw new Error(`Dòng ${rowIndex + 1}: Tên cấp bậc không được để trống`)
  }
  if (!bac || isNaN(Number(bac))) {
    throw new Error(`Dòng ${rowIndex + 1}: Bậc phải là số nguyên dương`)
  }

  const bacNumber = Number(bac)
  if (bacNumber < 1 || !Number.isInteger(bacNumber)) {
    throw new Error(`Dòng ${rowIndex + 1}: Bậc phải là số nguyên dương`)
  }

  // Build data object
  const data: CreateCapBacInput = {
    ma_cap_bac: maCapBac,
    ten_cap_bac: tenCapBac,
    bac: bacNumber,
  }

  // Validate with Zod schema
  const result = capBacSchema.omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao: true }).safeParse(data)
  if (!result.success) {
    const errors = result.error.issues.map((e) => e.message).join(", ")
    throw new Error(`Dòng ${rowIndex + 1}: ${errors}`)
  }

  return { data: result.data as CreateCapBacInput, row: rowIndex + 1 }
}

/**
 * Hook to batch upsert cấp bậc from Excel
 */
export function useBatchUpsertCapBac() {
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

          // Try to find existing record by ma_cap_bac
          const existingList = await CapBacAPI.getAll()
          const existing = existingList.find((item) => item.ma_cap_bac === data.ma_cap_bac)

          if (existing) {
            // Update existing record
            await CapBacAPI.update(existing.id!, data)
            result.updated++
          } else {
            // Create new record
            await CapBacAPI.create(data)
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
        queryKey: capBacQueryKeys.all(),
        exact: false,
      })
      queryClient.refetchQueries({
        queryKey: capBacQueryKeys.list(),
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

