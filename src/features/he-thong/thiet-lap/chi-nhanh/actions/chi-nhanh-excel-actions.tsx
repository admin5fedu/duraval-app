"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { ChiNhanh, CreateChiNhanhInput } from "../schema"
import type { BatchChiNhanhOperationResult } from "../schema"
import { chiNhanhQueryKeys } from "@/lib/react-query/query-keys"

const TABLE_NAME = "var_chi_nhanh"

/**
 * Hook for batch insert (import) chi nhánh from Excel
 */
export function useBatchUpsertChiNhanh() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (records: Partial<ChiNhanh>[]): Promise<BatchChiNhanhOperationResult> => {
      let inserted = 0
      const updated = 0
      const errors: BatchChiNhanhOperationResult["errors"] = []

      // Process in batches of 1000
      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)

        // Validate and sanitize records
        const validRecords: CreateChiNhanhInput[] = []
        
        batch.forEach((record, batchIndex) => {
          const originalIndex = i + batchIndex
          
          // Validate required fields
          if (!record.ma_chi_nhanh || !String(record.ma_chi_nhanh).trim()) {
            errors.push({
              row: originalIndex,
              error: "Mã chi nhánh là bắt buộc",
            })
            return
          }

          if (!record.ten_chi_nhanh || !String(record.ten_chi_nhanh).trim()) {
            errors.push({
              row: originalIndex,
              error: "Tên chi nhánh là bắt buộc",
            })
            return
          }

          // Sanitize input
          const sanitizedRecord: CreateChiNhanhInput = {
            ma_chi_nhanh: String(record.ma_chi_nhanh).trim(),
            ten_chi_nhanh: String(record.ten_chi_nhanh).trim(),
            dia_chi: record.dia_chi && String(record.dia_chi).trim() !== "" ? String(record.dia_chi).trim() : null,
            dinh_vi: record.dinh_vi && String(record.dinh_vi).trim() !== "" ? String(record.dinh_vi).trim() : null,
            hinh_anh: record.hinh_anh && String(record.hinh_anh).trim() !== "" ? String(record.hinh_anh).trim() : null,
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
      queryClient.invalidateQueries({ queryKey: chiNhanhQueryKeys.all() })
      
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

