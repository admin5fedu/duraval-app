"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { QuyHTBHTheoThang } from "../schema"
import type { BatchQuyHTBHTheoThangOperationResult } from "../schema"
import { QuyHTBHTheoThangService } from "../services/quy-htbh-theo-thang-service"
import { quyHTBHTheoThang as quyHTBHTheoThangQueryKeys } from "@/lib/react-query/query-keys/quy-htbh-theo-thang"

const TABLE_NAME = "htbh_quy_htbh"
const service = new QuyHTBHTheoThangService()

/**
 * Hook for batch upsert (import) quỹ HTBH theo tháng from Excel
 */
export function useBatchUpsertQuyHTBHTheoThang() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (records: Partial<QuyHTBHTheoThang>[]): Promise<BatchQuyHTBHTheoThangOperationResult> => {
      let inserted = 0
      let updated = 0
      const errors: BatchQuyHTBHTheoThangOperationResult["errors"] = []

      // Process in batches of 1000
      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)

        // Check which records exist (nếu có id)
        const idList = batch.map((r) => r.id).filter(Boolean) as number[]

        let existingIds = new Set<number>()
        if (idList.length > 0) {
          const { data: existingRecords } = await supabase
            .from(TABLE_NAME)
            .select("id")
            .in("id", idList)

          existingIds = new Set(existingRecords?.map((r) => r.id) || [])
        }

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
      queryClient.invalidateQueries({ queryKey: quyHTBHTheoThangQueryKeys.all() })
      
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

