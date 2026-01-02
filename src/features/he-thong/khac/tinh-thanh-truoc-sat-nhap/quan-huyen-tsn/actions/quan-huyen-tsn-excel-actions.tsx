"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { QuanHuyenTSN, CreateQuanHuyenTSNInput } from "../schema"
import { quanHuyenTSN as quanHuyenTSNQueryKeys } from "@/lib/react-query/query-keys/quan-huyen-tsn"

const TABLE_NAME = "var_tsn_quan_huyen"
const TINH_THANH_TABLE_NAME = "var_tsn_tinh_thanh"

/**
 * Batch operation result
 */
export interface BatchQuanHuyenTSNOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

/**
 * Hook for batch upsert (import) quận huyện TSN from Excel
 */
export function useBatchUpsertQuanHuyenTSN() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (records: Partial<QuanHuyenTSN>[]): Promise<BatchQuanHuyenTSNOperationResult> => {
      let inserted = 0
      let updated = 0
      const errors: BatchQuanHuyenTSNOperationResult["errors"] = []

      // Process in batches of 1000
      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)

        // Get all unique ma_tinh_thanh to lookup tinh_thanh_id
        const maTinhThanhList = batch
          .map((r) => r.ma_tinh_thanh)
          .filter(Boolean) as string[]

        const tinhThanhMap = new Map<string, { id: number; ma_tinh_thanh: string; ten_tinh_thanh: string }>()
        if (maTinhThanhList.length > 0) {
          const { data: tinhThanhList } = await supabase
            .from(TINH_THANH_TABLE_NAME)
            .select("id, ma_tinh_thanh, ten_tinh_thanh")
            .in("ma_tinh_thanh", [...new Set(maTinhThanhList)])

          if (tinhThanhList) {
            tinhThanhList.forEach((tt) => {
              if (tt.ma_tinh_thanh) {
                tinhThanhMap.set(tt.ma_tinh_thanh, {
                  id: tt.id!,
                  ma_tinh_thanh: tt.ma_tinh_thanh,
                  ten_tinh_thanh: tt.ten_tinh_thanh,
                })
              }
            })
          }
        }

        // Check which records exist by ma_quan_huyen
        const maQuanHuyenList = batch
          .map((r) => r.ma_quan_huyen)
          .filter(Boolean) as string[]

        const existingRecords = new Map<string, number>()
        if (maQuanHuyenList.length > 0) {
          const { data: existing } = await supabase
            .from(TABLE_NAME)
            .select("id, ma_quan_huyen")
            .in("ma_quan_huyen", maQuanHuyenList)

          if (existing) {
            existing.forEach((record) => {
              if (record.ma_quan_huyen) {
                existingRecords.set(record.ma_quan_huyen, record.id!)
              }
            })
          }
        }

        // Validate and sanitize records
        const toInsert: CreateQuanHuyenTSNInput[] = []
        const toUpdate: Array<{ id: number; data: Partial<QuanHuyenTSN> }> = []

        batch.forEach((record, batchIndex) => {
          const originalIndex = i + batchIndex

          // Validate required fields
          if (!record.ma_tinh_thanh || !String(record.ma_tinh_thanh).trim()) {
            errors.push({
              row: originalIndex,
              error: "Mã tỉnh thành là bắt buộc",
            })
            return
          }

          if (!record.ten_tinh_thanh || !String(record.ten_tinh_thanh).trim()) {
            errors.push({
              row: originalIndex,
              error: "Tên tỉnh thành là bắt buộc",
            })
            return
          }

          if (!record.ma_quan_huyen || !String(record.ma_quan_huyen).trim()) {
            errors.push({
              row: originalIndex,
              error: "Mã quận huyện là bắt buộc",
            })
            return
          }

          if (!record.ten_quan_huyen || !String(record.ten_quan_huyen).trim()) {
            errors.push({
              row: originalIndex,
              error: "Tên quận huyện là bắt buộc",
            })
            return
          }

          // Lookup tinh_thanh_id
          const maTinhThanh = String(record.ma_tinh_thanh).trim()
          const tinhThanh = tinhThanhMap.get(maTinhThanh)
          if (!tinhThanh) {
            errors.push({
              row: originalIndex,
              error: `Không tìm thấy tỉnh thành với mã: ${maTinhThanh}`,
            })
            return
          }

          const maQuanHuyen = String(record.ma_quan_huyen).trim()
          const existingId = existingRecords.get(maQuanHuyen)

          // Sanitize input
          const sanitizedRecord: CreateQuanHuyenTSNInput = {
            tinh_thanh_id: tinhThanh.id,
            ma_tinh_thanh: tinhThanh.ma_tinh_thanh,
            ten_tinh_thanh: tinhThanh.ten_tinh_thanh,
            ma_quan_huyen: maQuanHuyen,
            ten_quan_huyen: String(record.ten_quan_huyen).trim(),
          }

          if (existingId) {
            // Update existing record
            toUpdate.push({
              id: existingId,
              data: sanitizedRecord,
            })
          } else {
            // Insert new record
            toInsert.push(sanitizedRecord)
          }
        })

        // Execute inserts
        if (toInsert.length > 0) {
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
                const originalIndex = i + (batch.length - toInsert.length + j)
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

        // Execute updates
        for (const { id, data: updateData } of toUpdate) {
          const { error: updateError } = await supabase
            .from(TABLE_NAME)
            .update(updateData)
            .eq("id", id)

          if (updateError) {
            errors.push({
              row: i,
              error: updateError.message,
            })
          } else {
            updated++
          }
        }
      }

      return { inserted, updated, errors }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: quanHuyenTSNQueryKeys.all() })

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

