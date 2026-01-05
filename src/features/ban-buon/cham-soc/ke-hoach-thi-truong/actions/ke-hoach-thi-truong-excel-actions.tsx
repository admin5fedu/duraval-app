"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { CreateKeHoachThiTruongInput } from "../schema"
import { keHoachThiTruongQueryKeys } from "@/lib/react-query/query-keys"
import { useAuthStore } from "@/shared/stores/auth-store"

const TABLE_NAME = "bb_ke_hoach_thi_truong"

/**
 * Batch operation result
 */
export interface BatchKeHoachThiTruongOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

/**
 * Hook for batch upsert (import) kế hoạch thị trường from Excel
 */
export function useBatchUpsertKeHoachThiTruong() {
  const queryClient = useQueryClient()
  const { employee } = useAuthStore()

  return useMutation({
    mutationFn: async (records: Partial<CreateKeHoachThiTruongInput>[]): Promise<BatchKeHoachThiTruongOperationResult> => {
      let inserted = 0
      let updated = 0
      const errors: BatchKeHoachThiTruongOperationResult["errors"] = []

      // Process in batches of 1000
      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)

        // Validate and sanitize records
        const recordsToUpsert: Array<{ record: CreateKeHoachThiTruongInput; originalIndex: number }> = []
        
        batch.forEach((record, batchIndex) => {
          const originalIndex = i + batchIndex
          
          // Validate required fields
          if (!record.ngay || !String(record.ngay).trim()) {
            errors.push({
              row: originalIndex,
              error: "Ngày là bắt buộc",
            })
            return
          }

          if (!record.nhan_vien_id) {
            errors.push({
              row: originalIndex,
              error: "Nhân viên là bắt buộc",
            })
            return
          }

          if (!record.buoi || !String(record.buoi).trim()) {
            errors.push({
              row: originalIndex,
              error: "Buổi là bắt buộc",
            })
            return
          }

          if (!record.hanh_dong || !String(record.hanh_dong).trim()) {
            errors.push({
              row: originalIndex,
              error: "Hành động là bắt buộc",
            })
            return
          }

          if (!record.muc_tieu || !String(record.muc_tieu).trim()) {
            errors.push({
              row: originalIndex,
              error: "Mục tiêu là bắt buộc",
            })
            return
          }

          // Sanitize input
          const sanitizedRecord: CreateKeHoachThiTruongInput = {
            ngay: String(record.ngay).trim(),
            nhan_vien_id: typeof record.nhan_vien_id === 'string' ? parseFloat(record.nhan_vien_id) : record.nhan_vien_id,
            buoi: String(record.buoi).trim(),
            hanh_dong: String(record.hanh_dong).trim(),
            khach_buon_id: record.khach_buon_id ? (typeof record.khach_buon_id === 'string' ? parseFloat(record.khach_buon_id) : record.khach_buon_id) : null,
            tsn_tinh_thanh_id: record.tsn_tinh_thanh_id ? (typeof record.tsn_tinh_thanh_id === 'string' ? parseFloat(record.tsn_tinh_thanh_id) : record.tsn_tinh_thanh_id) : null,
            muc_tieu: String(record.muc_tieu).trim(),
            ghi_chu: record.ghi_chu && String(record.ghi_chu).trim() !== "" ? String(record.ghi_chu).trim() : null,
            trang_thai: record.trang_thai && String(record.trang_thai).trim() !== "" ? String(record.trang_thai).trim() : null,
            nguoi_tao_id: employee?.ma_nhan_vien || null,
          }

          recordsToUpsert.push({ record: sanitizedRecord, originalIndex })
        })

        // For kế hoạch thị trường, we insert new records (no duplicate checking by default)
        // If needed, you can add duplicate checking logic here based on ngay + nhan_vien_id + buoi + hanh_dong

        // Execute inserts
        if (recordsToUpsert.length > 0) {
          const toInsert = recordsToUpsert.map(({ record }) => record)
          
          const { error: insertError } = await supabase
            .from(TABLE_NAME)
            .insert(toInsert)

          if (insertError) {
            // If batch insert fails, try individual inserts to identify which records failed
            for (let j = 0; j < toInsert.length; j++) {
              const { error: singleError } = await supabase
                .from(TABLE_NAME)
                .insert(toInsert[j])

              if (singleError) {
                const originalIndex = recordsToUpsert[j].originalIndex
                errors.push({
                  row: originalIndex,
                  error: singleError.message,
                })
              } else {
                inserted++
              }
            }
          } else {
            inserted += toInsert.length
          }
        }
      }

      return { inserted, updated, errors }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: keHoachThiTruongQueryKeys.all() })
      
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

