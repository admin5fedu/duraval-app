"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { TinhThanhTSN, CreateTinhThanhTSNInput } from "../schema"
import { tinhThanhTSN as tinhThanhTSNQueryKeys } from "@/lib/react-query/query-keys/tinh-thanh-tsn"

const TABLE_NAME = "var_tsn_tinh_thanh"

/**
 * Normalize mien value: convert "Bắc"/"Trung"/"Nam" to "Miền Bắc"/"Miền Trung"/"Miền Nam"
 */
function normalizeMien(value: string | null | undefined): string | null {
  if (!value) return null
  const normalized = String(value).trim()
  const mienMap: Record<string, string> = {
    "Bắc": "Miền Bắc",
    "Trung": "Miền Trung",
    "Nam": "Miền Nam",
    "Miền Bắc": "Miền Bắc",
    "Miền Trung": "Miền Trung",
    "Miền Nam": "Miền Nam",
  }
  return mienMap[normalized] || normalized
}

/**
 * Batch operation result
 */
export interface BatchTinhThanhTSNOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

/**
 * Hook for batch upsert (import) tỉnh thành TSN from Excel
 */
export function useBatchUpsertTinhThanhTSN() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (records: Partial<TinhThanhTSN>[]): Promise<BatchTinhThanhTSNOperationResult> => {
      let inserted = 0
      let updated = 0
      const errors: BatchTinhThanhTSNOperationResult["errors"] = []

      // Process in batches of 1000
      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)

        // Check which records exist by ma_tinh_thanh
        const maTinhThanhList = batch
          .map((r) => r.ma_tinh_thanh)
          .filter(Boolean) as string[]

        const existingRecords = new Map<string, number>()
        if (maTinhThanhList.length > 0) {
          const { data: existing } = await supabase
            .from(TABLE_NAME)
            .select("id, ma_tinh_thanh")
            .in("ma_tinh_thanh", maTinhThanhList)

          if (existing) {
            existing.forEach((record) => {
              if (record.ma_tinh_thanh) {
                existingRecords.set(record.ma_tinh_thanh, record.id!)
              }
            })
          }
        }

        // Validate and sanitize records
        const toInsert: CreateTinhThanhTSNInput[] = []
        const toUpdate: Array<{ id: number; data: Partial<TinhThanhTSN> }> = []

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

          if (!record.mien || String(record.mien).trim() === "") {
            errors.push({
              row: originalIndex,
              error: "Miền là bắt buộc",
            })
            return
          }

          if (!record.vung || String(record.vung).trim() === "") {
            errors.push({
              row: originalIndex,
              error: "Vùng là bắt buộc",
            })
            return
          }

          const maTinhThanh = String(record.ma_tinh_thanh).trim()
          const existingId = existingRecords.get(maTinhThanh)

          // Normalize and sanitize input
          const normalizedMien = normalizeMien(record.mien)
          if (!["Miền Bắc", "Miền Trung", "Miền Nam"].includes(normalizedMien!)) {
            errors.push({
              row: originalIndex,
              error: `Miền không hợp lệ: ${record.mien}. Phải là: Miền Bắc, Miền Trung hoặc Miền Nam (hoặc Bắc, Trung, Nam)`,
            })
            return
          }

          const sanitizedRecord: CreateTinhThanhTSNInput = {
            ma_tinh_thanh: maTinhThanh,
            ten_tinh_thanh: String(record.ten_tinh_thanh).trim(),
            mien: normalizedMien as "Miền Bắc" | "Miền Trung" | "Miền Nam",
            vung: String(record.vung).trim() as "Đồng bằng sông Hồng" | "Trung du và miền núi phía Bắc" | "Bắc Trung Bộ" | "Duyên hải Nam Trung Bộ" | "Tây Nguyên" | "Đông Nam Bộ" | "Đồng bằng sông Cửu Long",
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
      queryClient.invalidateQueries({ queryKey: tinhThanhTSNQueryKeys.all() })

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

