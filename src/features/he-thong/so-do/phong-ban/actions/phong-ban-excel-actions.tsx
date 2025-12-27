"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { PhongBan, CreatePhongBanInput } from "../schema"
import type { BatchPhongBanOperationResult } from "../schema"
import { phongBanQueryKeys } from "@/lib/react-query/query-keys"

const TABLE_NAME = "var_phong_ban"

/**
 * Hook for batch insert (import) phòng ban from Excel
 */
export function useBatchUpsertPhongBan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (records: Partial<PhongBan>[]): Promise<BatchPhongBanOperationResult> => {
      let inserted = 0
      let updated = 0
      const errors: BatchPhongBanOperationResult["errors"] = []

      // Process in batches of 1000
      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)

        // Validate and sanitize records
        const validRecords: CreatePhongBanInput[] = []
        
        batch.forEach((record, batchIndex) => {
          const originalIndex = i + batchIndex
          
          // Validate required fields
          if (!record.ma_phong_ban || !String(record.ma_phong_ban).trim()) {
            errors.push({
              row: originalIndex,
              error: "Mã phòng ban là bắt buộc",
            })
            return
          }

          if (!record.ten_phong_ban || !String(record.ten_phong_ban).trim()) {
            errors.push({
              row: originalIndex,
              error: "Tên phòng ban là bắt buộc",
            })
            return
          }

          if (!record.cap_do || !String(record.cap_do).trim()) {
            errors.push({
              row: originalIndex,
              error: "Cấp độ là bắt buộc",
            })
            return
          }

          // Sanitize input
          const sanitizedRecord: CreatePhongBanInput = {
            tt: record.tt ? Number(record.tt) : null,
            ma_phong_ban: String(record.ma_phong_ban).trim(),
            ten_phong_ban: String(record.ten_phong_ban).trim(),
            cap_do: String(record.cap_do).trim(),
            truc_thuoc_phong_ban: record.truc_thuoc_phong_ban && String(record.truc_thuoc_phong_ban).trim() !== "" ? String(record.truc_thuoc_phong_ban).trim() : null,
            truc_thuoc_id: record.truc_thuoc_id ? Number(record.truc_thuoc_id) : null,
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
      queryClient.invalidateQueries({ queryKey: phongBanQueryKeys.all() })
      
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

