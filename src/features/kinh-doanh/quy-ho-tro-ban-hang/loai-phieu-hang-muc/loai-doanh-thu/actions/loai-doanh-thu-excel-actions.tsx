"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { LoaiDoanhThu, CreateLoaiDoanhThuInput } from "../schema"
import { loaiDoanhThuQueryKeys } from "@/lib/react-query/query-keys"

const TABLE_NAME = "htbh_loai_doanh_thu"

/**
 * Batch operation result
 */
export interface BatchLoaiDoanhThuOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

/**
 * Hook for batch insert (import) loại doanh thu from Excel
 */
export function useBatchUpsertLoaiDoanhThu() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (records: Partial<LoaiDoanhThu>[]): Promise<BatchLoaiDoanhThuOperationResult> => {
      let inserted = 0
      const updated = 0
      const errors: BatchLoaiDoanhThuOperationResult["errors"] = []

      // Process in batches of 1000
      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)

        // Validate and sanitize records
        const validRecords: CreateLoaiDoanhThuInput[] = []
        
        batch.forEach((record, batchIndex) => {
          const originalIndex = i + batchIndex
          
          // Validate required fields
          if (!record.ten_doanh_thu || !String(record.ten_doanh_thu).trim()) {
            errors.push({
              row: originalIndex,
              error: "Tên doanh thu là bắt buộc",
            })
            return
          }

          // Sanitize input
          const sanitizedRecord: CreateLoaiDoanhThuInput = {
            ten_doanh_thu: String(record.ten_doanh_thu).trim(),
            mo_ta: record.mo_ta && String(record.mo_ta).trim() !== "" ? String(record.mo_ta).trim() : null,
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
      queryClient.invalidateQueries({ queryKey: loaiDoanhThuQueryKeys.all() })
      
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

