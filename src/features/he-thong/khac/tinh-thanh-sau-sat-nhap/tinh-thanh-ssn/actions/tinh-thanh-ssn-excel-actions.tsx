"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { TinhThanhSSN, CreateTinhThanhSSNInput } from "../schema"
import { tinhThanhSSN as tinhThanhSSNQueryKeys } from "@/lib/react-query/query-keys/tinh-thanh-ssn"

const TABLE_NAME = "var_ssn_tinh_thanh"

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
export interface BatchTinhThanhSSNOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

/**
 * Hook for batch upsert (import) tỉnh thành SSN from Excel
 */
export function useBatchUpsertTinhThanhSSN() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (records: Partial<TinhThanhSSN>[]): Promise<BatchTinhThanhSSNOperationResult> => {
      let inserted = 0
      let updated = 0
      const errors: BatchTinhThanhSSNOperationResult["errors"] = []

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
        const toInsert: CreateTinhThanhSSNInput[] = []
        const toUpdate: Array<{ id: number; data: Partial<TinhThanhSSN> }> = []

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
          const normalizedMien = normalizeMien(record.mien)

          if (!normalizedMien || !["Miền Bắc", "Miền Trung", "Miền Nam"].includes(normalizedMien)) {
            errors.push({
              row: originalIndex,
              error: `Miền không hợp lệ: ${record.mien}. Phải là: Miền Bắc, Miền Trung, hoặc Miền Nam`,
            })
            return
          }

          const sanitizedRecord: CreateTinhThanhSSNInput = {
            ma_tinh_thanh: maTinhThanh,
            ten_tinh_thanh: String(record.ten_tinh_thanh).trim(),
            mien: normalizedMien as "Miền Bắc" | "Miền Trung" | "Miền Nam",
            vung: String(record.vung).trim() as "Đồng bằng sông Hồng" | "Trung du và miền núi phía Bắc" | "Bắc Trung Bộ" | "Duyên hải Nam Trung Bộ" | "Tây Nguyên" | "Đông Nam Bộ" | "Đồng bằng sông Cửu Long",
          }

          if (existingRecords.has(maTinhThanh)) {
            // Update existing record
            toUpdate.push({
              id: existingRecords.get(maTinhThanh)!,
              data: sanitizedRecord,
            })
          } else {
            // Insert new record
            toInsert.push(sanitizedRecord)
          }
        })

        // Perform batch insert
        if (toInsert.length > 0) {
          const { error: insertError } = await supabase
            .from(TABLE_NAME)
            .insert(toInsert)

          if (insertError) {
            errors.push({
              row: i,
              error: `Lỗi khi thêm mới: ${insertError.message}`,
            })
          } else {
            inserted += toInsert.length
          }
        }

        // Perform batch update
        if (toUpdate.length > 0) {
          for (const { id, data } of toUpdate) {
            const { error: updateError } = await supabase
              .from(TABLE_NAME)
              .update(data)
              .eq("id", id)

            if (updateError) {
              errors.push({
                row: i,
                error: `Lỗi khi cập nhật ID ${id}: ${updateError.message}`,
              })
            } else {
              updated++
            }
          }
        }
      }

      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: tinhThanhSSNQueryKeys.all() })

      return { inserted, updated, errors }
    },
    onSuccess: (result) => {
      const total = result.inserted + result.updated
      if (total > 0) {
        toast.success(`Đã import ${total} tỉnh thành SSN thành công (${result.inserted} mới, ${result.updated} cập nhật)`)
      }
      if (result.errors.length > 0) {
        toast.warning(`Có ${result.errors.length} lỗi trong quá trình import`)
      }
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi import: ${error.message}`)
    },
  })
}

