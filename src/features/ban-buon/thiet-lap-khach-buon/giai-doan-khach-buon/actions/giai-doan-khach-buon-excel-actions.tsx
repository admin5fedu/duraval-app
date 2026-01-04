"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { GiaiDoanKhachBuon, CreateGiaiDoanKhachBuonInput } from "../schema"
import { giaiDoanKhachBuonQueryKeys } from "@/lib/react-query/query-keys"
import { useAuthStore } from "@/shared/stores/auth-store"

const TABLE_NAME = "bb_giai_doan"

/**
 * Batch operation result
 */
export interface BatchGiaiDoanKhachBuonOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

/**
 * Hook for batch insert (import) giai đoạn khách buôn from Excel
 */
export function useBatchUpsertGiaiDoanKhachBuon() {
  const queryClient = useQueryClient()
  const { employee } = useAuthStore()

  return useMutation({
    mutationFn: async (records: Partial<GiaiDoanKhachBuon>[]): Promise<BatchGiaiDoanKhachBuonOperationResult> => {
      let inserted = 0
      const updated = 0
      const errors: BatchGiaiDoanKhachBuonOperationResult["errors"] = []

      // Process in batches of 1000
      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)

        // Validate and sanitize records
        const validRecords: CreateGiaiDoanKhachBuonInput[] = []
        
        batch.forEach((record, batchIndex) => {
          const originalIndex = i + batchIndex
          
          // Validate required fields
          if (!record.ma_giai_doan || !String(record.ma_giai_doan).trim()) {
            errors.push({
              row: originalIndex,
              error: "Mã giai đoạn là bắt buộc",
            })
            return
          }
          
          if (!record.ten_giai_doan || !String(record.ten_giai_doan).trim()) {
            errors.push({
              row: originalIndex,
              error: "Tên giai đoạn là bắt buộc",
            })
            return
          }
          
          if (record.tt === null || record.tt === undefined || String(record.tt).trim() === "") {
            errors.push({
              row: originalIndex,
              error: "Thứ tự là bắt buộc",
            })
            return
          }
          
          const ttValue = typeof record.tt === 'number' ? record.tt : parseFloat(String(record.tt))
          if (isNaN(ttValue) || ttValue < 1) {
            errors.push({
              row: originalIndex,
              error: "Thứ tự phải là số lớn hơn 0",
            })
            return
          }

          // Sanitize input
          const sanitizedRecord: CreateGiaiDoanKhachBuonInput = {
            ma_giai_doan: String(record.ma_giai_doan).trim(),
            ten_giai_doan: String(record.ten_giai_doan).trim(),
            mo_ta: record.mo_ta && String(record.mo_ta).trim() !== "" ? String(record.mo_ta).trim() : null,
            tt: ttValue,
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
      queryClient.invalidateQueries({ queryKey: giaiDoanKhachBuonQueryKeys.all() })
      
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

