"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { CreateHinhAnhKhachBuonInput } from "../schema"
import { hinhAnhKhachBuonQueryKeys } from "@/lib/react-query/query-keys"
import { useAuthStore } from "@/shared/stores/auth-store"

const TABLE_NAME = "bb_hinh_anh"

export interface BatchHinhAnhKhachBuonOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

export function useBatchUpsertHinhAnhKhachBuon() {
  const queryClient = useQueryClient()
  const { employee } = useAuthStore()

  return useMutation({
    mutationFn: async (records: Partial<CreateHinhAnhKhachBuonInput>[]): Promise<BatchHinhAnhKhachBuonOperationResult> => {
      let inserted = 0
      let updated = 0
      const errors: BatchHinhAnhKhachBuonOperationResult["errors"] = []

      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)

        const recordsToUpsert: Array<{ record: CreateHinhAnhKhachBuonInput; originalIndex: number }> = []

        batch.forEach((record, batchIndex) => {
          const originalIndex = i + batchIndex

          // Basic validation for required fields
          if (!record.khach_buon_id) {
            errors.push({ row: originalIndex, error: "Khách buôn là bắt buộc" }); return;
          }
          if (!record.hang_muc || !String(record.hang_muc).trim()) {
            errors.push({ row: originalIndex, error: "Hạng mục là bắt buộc" }); return;
          }
          if (!record.hinh_anh || !String(record.hinh_anh).trim()) {
            errors.push({ row: originalIndex, error: "Hình ảnh là bắt buộc" }); return;
          }

          const sanitizedRecord: CreateHinhAnhKhachBuonInput = {
            khach_buon_id: typeof record.khach_buon_id === 'string' ? parseFloat(record.khach_buon_id) : record.khach_buon_id,
            hang_muc: String(record.hang_muc).trim(),
            hinh_anh: String(record.hinh_anh).trim(),
            mo_ta: record.mo_ta && String(record.mo_ta).trim() !== "" ? String(record.mo_ta).trim() : null,
            ghi_chu: record.ghi_chu && String(record.ghi_chu).trim() !== "" ? String(record.ghi_chu).trim() : null,
            nguoi_tao_id: employee?.ma_nhan_vien || null,
          }
          recordsToUpsert.push({ record: sanitizedRecord, originalIndex })
        })

        // Try batch insert
        const recordsToInsert = recordsToUpsert.map(r => r.record)
        if (recordsToInsert.length > 0) {
          const { error: insertError } = await supabase.from(TABLE_NAME).insert(recordsToInsert)
          if (insertError) {
            // If batch fails, try individual inserts to pinpoint errors
            for (let j = 0; j < recordsToInsert.length; j++) {
              const { error: singleError } = await supabase.from(TABLE_NAME).insert(recordsToInsert[j])
              if (singleError) {
                const originalIndex = i + (recordsToUpsert.length - recordsToInsert.length + j)
                errors.push({ row: originalIndex, error: singleError.message })
              } else {
                inserted++
              }
            }
          } else {
            inserted += recordsToInsert.length
          }
        }
      }

      return { inserted, updated, errors }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: hinhAnhKhachBuonQueryKeys.all() })
      if (result.errors.length > 0) {
        toast.warning(`Nhập dữ liệu hoàn tất: ${result.inserted} thêm mới, ${result.updated} cập nhật, ${result.errors.length} lỗi`)
      } else {
        toast.success(`Nhập dữ liệu thành công: ${result.inserted} thêm mới, ${result.updated} cập nhật`)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Có lỗi xảy ra khi nhập dữ liệu")
    },
  })
}

