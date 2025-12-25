"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { NhanSu } from "../types"
import type { BatchNhanSuOperationResult } from "../types"
import { NhanSuService } from "../services"
import { nhanSuQueryKeys } from "@/lib/react-query/query-keys"

const TABLE_NAME = "var_nhan_su"
const service = new NhanSuService()

/**
 * Hook for batch upsert (import) employees from Excel
 */
export function useBatchUpsertNhanSu() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (records: Partial<NhanSu>[]): Promise<BatchNhanSuOperationResult> => {
      let inserted = 0
      let updated = 0
      const errors: BatchNhanSuOperationResult["errors"] = []

      // Process in batches of 1000
      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)

        // Check which records exist
        const maNhanVienList = batch.map((r) => r.ma_nhan_vien).filter(Boolean) as number[]

        if (maNhanVienList.length > 0) {
          const { data: existingRecords } = await supabase
            .from(TABLE_NAME)
            .select("ma_nhan_vien")
            .in("ma_nhan_vien", maNhanVienList)

          const existingIds = new Set(existingRecords?.map((r) => r.ma_nhan_vien) || [])

          // Tách logic insert/update & lỗi sang domain service
          const { toInsert, toUpdate, errors: splitErrors } = service.splitBatchRecords(
            batch,
            existingIds
          )
          errors.push(
            ...splitErrors.map((err) => ({
              ...err,
              row: err.row + i, // dịch index về vị trí gốc trong mảng records
            }))
          )

          // Execute inserts
          if (toInsert.length > 0) {
            const insertRecords = toInsert.map((item) => item.record)
            const { error: insertError } = await supabase
              .from(TABLE_NAME)
              .insert(insertRecords)

            if (insertError) {
              toInsert.forEach(({ originalIndex }) => {
                errors.push({ row: originalIndex, error: insertError.message })
              })
            } else {
              inserted += toInsert.length
            }
          }

          // Execute updates
          for (const { ma_nhan_vien, data: updateData, originalIndex } of toUpdate) {
            const { error: updateError } = await supabase
              .from(TABLE_NAME)
              .update(updateData)
              .eq("ma_nhan_vien", ma_nhan_vien)

            if (updateError) {
              errors.push({ row: originalIndex, error: updateError.message })
            } else {
              updated++
            }
          }
        }
      }

      return { inserted, updated, errors }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: nhanSuQueryKeys.all() })
      
      if (result.errors.length > 0) {
        toast.warning(
          `Nhập dữ liệu hoàn tất: ${result.inserted} thêm mới, ${result.updated} cập nhật, ${result.errors.length} lỗi`
        )
      } else {
        toast.success(
          `Nhập dữ liệu thành công: ${result.inserted} thêm mới, ${result.updated} cập nhật`
        )
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Có lỗi xảy ra khi nhập dữ liệu")
    },
  })
}

