"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { PhuongXaTSN, CreatePhuongXaTSNInput } from "../schema"
import { phuongXaTSN as phuongXaTSNQueryKeys } from "@/lib/react-query/query-keys/phuong-xa-tsn"

const TABLE_NAME = "var_tsn_phuong_xa"
const QUAN_HUYEN_TABLE_NAME = "var_tsn_quan_huyen"

/**
 * Batch operation result
 */
export interface BatchPhuongXaTSNOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

/**
 * Hook for batch upsert (import) phường xã TSN from Excel
 */
export function useBatchUpsertPhuongXaTSN() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (records: Partial<PhuongXaTSN>[]): Promise<BatchPhuongXaTSNOperationResult> => {
      let inserted = 0
      let updated = 0
      const errors: BatchPhuongXaTSNOperationResult["errors"] = []

      // Process in batches of 1000
      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)

        // Get all unique ma_quan_huyen to lookup quan_huyen_id
        const maQuanHuyenList = batch
          .map((r) => r.ma_quan_huyen)
          .filter(Boolean) as string[]

        const quanHuyenMap = new Map<string, { id: number; tinh_thanh_id: number | null; ma_quan_huyen: string; ten_quan_huyen: string; ma_tinh_thanh: string; ten_tinh_thanh: string }>()
        if (maQuanHuyenList.length > 0) {
          const { data: quanHuyenList } = await supabase
            .from(QUAN_HUYEN_TABLE_NAME)
            .select("id, tinh_thanh_id, ma_quan_huyen, ten_quan_huyen, ma_tinh_thanh, ten_tinh_thanh")
            .in("ma_quan_huyen", [...new Set(maQuanHuyenList)])

          if (quanHuyenList) {
            quanHuyenList.forEach((qh) => {
              if (qh.ma_quan_huyen) {
                quanHuyenMap.set(qh.ma_quan_huyen, {
                  id: qh.id!,
                  tinh_thanh_id: qh.tinh_thanh_id || null,
                  ma_quan_huyen: qh.ma_quan_huyen,
                  ten_quan_huyen: qh.ten_quan_huyen,
                  ma_tinh_thanh: qh.ma_tinh_thanh || "",
                  ten_tinh_thanh: qh.ten_tinh_thanh || "",
                })
              }
            })
          }
        }

        // Check which records exist by ma_phuong_xa
        const maPhuongXaList = batch
          .map((r) => r.ma_phuong_xa)
          .filter(Boolean) as string[]

        const existingRecords = new Map<string, number>()
        if (maPhuongXaList.length > 0) {
          const { data: existing } = await supabase
            .from(TABLE_NAME)
            .select("id, ma_phuong_xa")
            .in("ma_phuong_xa", maPhuongXaList)

          if (existing) {
            existing.forEach((record) => {
              if (record.ma_phuong_xa) {
                existingRecords.set(record.ma_phuong_xa, record.id!)
              }
            })
          }
        }

        // Validate and sanitize records
        const toInsert: CreatePhuongXaTSNInput[] = []
        const toUpdate: Array<{ id: number; data: Partial<PhuongXaTSN> }> = []

        batch.forEach((record, batchIndex) => {
          const originalIndex = i + batchIndex

          // Validate required fields
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

          if (!record.ma_phuong_xa || !String(record.ma_phuong_xa).trim()) {
            errors.push({
              row: originalIndex,
              error: "Mã phường xã là bắt buộc",
            })
            return
          }

          if (!record.ten_phuong_xa || !String(record.ten_phuong_xa).trim()) {
            errors.push({
              row: originalIndex,
              error: "Tên phường xã là bắt buộc",
            })
            return
          }

          // Lookup quan_huyen_id
          const maQuanHuyen = String(record.ma_quan_huyen).trim()
          const quanHuyen = quanHuyenMap.get(maQuanHuyen)
          if (!quanHuyen) {
            errors.push({
              row: originalIndex,
              error: `Không tìm thấy quận huyện với mã: ${maQuanHuyen}`,
            })
            return
          }

          const maPhuongXa = String(record.ma_phuong_xa).trim()
          const existingId = existingRecords.get(maPhuongXa)

          // Sanitize input
          const sanitizedRecord: CreatePhuongXaTSNInput = {
            quan_huyen_id: quanHuyen.id,
            ma_quan_huyen: quanHuyen.ma_quan_huyen,
            ten_quan_huyen: quanHuyen.ten_quan_huyen,
            ma_phuong_xa: maPhuongXa,
            ten_phuong_xa: String(record.ten_phuong_xa).trim(),
            tinh_thanh_id: quanHuyen.tinh_thanh_id || null,
            ma_tinh_thanh: quanHuyen.ma_tinh_thanh || null,
            ten_tinh_thanh: quanHuyen.ten_tinh_thanh || null,
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
      queryClient.invalidateQueries({ queryKey: phuongXaTSNQueryKeys.all() })

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

