"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { PhuongXaSNN, CreatePhuongXaSNNInput } from "../schema"
import { phuongXaSNN as phuongXaSNNQueryKeys } from "@/lib/react-query/query-keys/phuong-xa-snn"

const TABLE_NAME = "var_ssn_phuong_xa"
const TINH_THANH_TABLE_NAME = "var_ssn_tinh_thanh"

/**
 * Batch operation result
 */
export interface BatchPhuongXaSNNOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

/**
 * Hook for batch upsert (import) phường xã SNN from Excel
 */
export function useBatchUpsertPhuongXaSNN() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (records: Partial<PhuongXaSNN>[]): Promise<BatchPhuongXaSNNOperationResult> => {
      let inserted = 0
      let updated = 0
      const errors: BatchPhuongXaSNNOperationResult["errors"] = []

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
                  ten_tinh_thanh: tt.ten_tinh_thanh || "",
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
        const toInsert: CreatePhuongXaSNNInput[] = []
        const toUpdate: Array<{ id: number; data: Partial<PhuongXaSNN> }> = []

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

          const maPhuongXa = String(record.ma_phuong_xa).trim()
          const existingId = existingRecords.get(maPhuongXa)

          const sanitizedRecord: CreatePhuongXaSNNInput = {
            tinh_thanh_id: tinhThanh.id,
            ma_tinh_thanh: maTinhThanh,
            ten_tinh_thanh: tinhThanh.ten_tinh_thanh || null,
            ma_phuong_xa: maPhuongXa,
            ten_phuong_xa: String(record.ten_phuong_xa).trim(),
          }

          if (existingId) {
            toUpdate.push({
              id: existingId,
              data: sanitizedRecord,
            })
          } else {
            toInsert.push(sanitizedRecord)
          }
        })

        // Perform inserts
        if (toInsert.length > 0) {
          const { error: insertError } = await supabase
            .from(TABLE_NAME)
            .insert(toInsert)

          if (insertError) {
            errors.push({
              row: -1,
              error: `Lỗi khi thêm mới: ${insertError.message}`,
            })
          } else {
            inserted += toInsert.length
          }
        }

        // Perform updates
        for (const { id, data } of toUpdate) {
          const { error: updateError } = await supabase
            .from(TABLE_NAME)
            .update(data)
            .eq("id", id)

          if (updateError) {
            errors.push({
              row: -1,
              error: `Lỗi khi cập nhật ID ${id}: ${updateError.message}`,
            })
          } else {
            updated++
          }
        }
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: phuongXaSNNQueryKeys.all() })

      return { inserted, updated, errors }
    },
    onSuccess: (result) => {
      const total = result.inserted + result.updated
      const errorCount = result.errors.length
      if (errorCount === 0) {
        toast.success(`Đã import thành công ${total} phường xã SNN (${result.inserted} mới, ${result.updated} cập nhật)`)
      } else {
        toast.warning(`Đã import ${total} phường xã SNN, có ${errorCount} lỗi`)
      }
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi import phường xã SNN: ${error.message}`)
    },
  })
}

