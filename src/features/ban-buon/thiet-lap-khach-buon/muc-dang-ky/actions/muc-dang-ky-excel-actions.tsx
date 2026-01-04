"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { MucDangKy, CreateMucDangKyInput } from "../schema"
import { mucDangKyQueryKeys } from "@/lib/react-query/query-keys"
import { useAuthStore } from "@/shared/stores/auth-store"

const TABLE_NAME = "bb_muc_dang_ky"

/**
 * Batch operation result
 */
export interface BatchMucDangKyOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

/**
 * Hook for batch insert (import) mức đăng ký from Excel
 */
export function useBatchUpsertMucDangKy() {
  const queryClient = useQueryClient()
  const { employee } = useAuthStore()

  return useMutation({
    mutationFn: async (records: Partial<MucDangKy>[]): Promise<BatchMucDangKyOperationResult> => {
      let inserted = 0
      const updated = 0
      const errors: BatchMucDangKyOperationResult["errors"] = []

      // Process in batches of 1000
      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)

        // Validate and sanitize records
        const validRecords: CreateMucDangKyInput[] = []
        
        batch.forEach((record, batchIndex) => {
          const originalIndex = i + batchIndex
          
          // Validate required fields
          if (!record.ten_hang || !String(record.ten_hang).trim()) {
            errors.push({
              row: originalIndex,
              error: "Tên hạng là bắt buộc",
            })
            return
          }

          // Sanitize input
          const sanitizedRecord: CreateMucDangKyInput = {
            ma_hang: record.ma_hang && String(record.ma_hang).trim() !== "" ? String(record.ma_hang).trim() : null,
            ten_hang: String(record.ten_hang).trim(),
            doanh_so_min_quy: record.doanh_so_min_quy ?? null,
            doanh_so_max_quy: record.doanh_so_max_quy ?? null,
            doanh_so_min_nam: record.doanh_so_min_nam ?? null,
            doanh_so_max_nam: record.doanh_so_max_nam ?? null,
            ghi_chu: record.ghi_chu && String(record.ghi_chu).trim() !== "" ? String(record.ghi_chu).trim() : null,
            nguoi_tao_id: employee?.ma_nhan_vien || null,
          }

          validRecords.push(sanitizedRecord)
        })

        // Execute inserts
        if (validRecords.length > 0) {
          const { error: insertError } = await supabase
            .from(TABLE_NAME)
            .insert(validRecords)

          if (insertError) {
            // If batch insert fails, try individual inserts to identify which records failed
            for (let j = 0; j < validRecords.length; j++) {
              const { error: singleError } = await supabase
                .from(TABLE_NAME)
                .insert(validRecords[j])

              if (singleError) {
                const originalIndex = i + (batch.length - validRecords.length + j)
                errors.push({
                  row: originalIndex,
                  error: singleError.message,
                })
              } else {
                inserted++
              }
            }
          } else {
            inserted += validRecords.length
          }
        }
      }

      return { inserted, updated, errors }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: mucDangKyQueryKeys.all() })
      
      if (result.errors.length > 0) {
        toast.warning(
          `Nhập dữ liệu hoàn tất: ${result.inserted} thêm mới, ${result.errors.length} lỗi`
        )
      } else {
        toast.success(
          `Nhập dữ liệu thành công: ${result.inserted} thêm mới`
        )
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Có lỗi xảy ra khi nhập dữ liệu")
    },
  })
}

