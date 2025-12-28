"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { ViecHangNgay } from "../schema"
import type { BatchViecHangNgayOperationResult } from "../types"
import { ViecHangNgayService } from "../services/viec-hang-ngay-service"
import { viecHangNgayQueryKeys } from "@/lib/react-query/query-keys"

const TABLE_NAME = "cong_viec_viec_hang_ngay"
const service = new ViecHangNgayService()

/**
 * Hook for batch upsert (import) việc hàng ngày from Excel
 * Logic: Check by ma_nhan_vien + ngay_bao_cao combination
 */
export function useBatchUpsertViecHangNgay() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (records: Partial<ViecHangNgay>[]): Promise<BatchViecHangNgayOperationResult> => {
      let inserted = 0
      let updated = 0
      const errors: BatchViecHangNgayOperationResult["errors"] = []

      // Process in batches of 1000
      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)
        
        // For viec hang ngay, we check by combination of ma_nhan_vien + ngay_bao_cao
        // First, get existing records
        const existingRecordsMap = new Map<string, number>() // key: "ma_nhan_vien_ngay_bao_cao", value: id
        
        // Get unique combinations
        const uniqueCombos = new Set<string>()
        batch.forEach(record => {
          if (record.ma_nhan_vien && record.ngay_bao_cao) {
            const key = `${record.ma_nhan_vien}_${record.ngay_bao_cao}`
            uniqueCombos.add(key)
          }
        })

        // Fetch existing records
        if (uniqueCombos.size > 0) {
          const { data: existingRecords } = await supabase
            .from(TABLE_NAME)
            .select("id, ma_nhan_vien, ngay_bao_cao")
          
          existingRecords?.forEach(record => {
            if (record.ma_nhan_vien && record.ngay_bao_cao) {
              const key = `${record.ma_nhan_vien}_${record.ngay_bao_cao}`
              existingRecordsMap.set(key, record.id)
            }
          })
        }

        // Separate into inserts and updates
        const { toInsert, toUpdate, errors: splitErrors } =
          service.splitBatchRecordsByEmployeeAndDate(batch, existingRecordsMap)
        errors.push(
          ...splitErrors.map(err => ({
            ...err,
            row: err.row + i,
          }))
        )

        // Execute inserts
        if (toInsert.length > 0) {
          const insertRecords = toInsert.map(item => item.record)
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
        for (const { id, data: updateData, originalIndex } of toUpdate) {
          const { error: updateError } = await supabase
            .from(TABLE_NAME)
            .update(updateData)
            .eq("id", id)

          if (updateError) {
            errors.push({ row: originalIndex, error: updateError.message })
          } else {
            updated++
          }
        }
      }

      return { inserted, updated, errors }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: viecHangNgayQueryKeys.all() })
      
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

