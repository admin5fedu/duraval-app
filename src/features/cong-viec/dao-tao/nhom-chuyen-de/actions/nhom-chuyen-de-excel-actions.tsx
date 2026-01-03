"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { NhomChuyenDe, CreateNhomChuyenDeInput } from "../schema"
import { nhomChuyenDe as nhomChuyenDeQueryKeys } from "@/lib/react-query/query-keys/nhom-chuyen-de"
import { useAuthStore } from "@/shared/stores/auth-store"

const TABLE_NAME = "dao_tao_nhom_chuyen_de"

/**
 * Batch operation result
 */
export interface BatchNhomChuyenDeOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

/**
 * Hook for batch upsert (import) nhóm chuyên đề from Excel
 */
export function useBatchUpsertNhomChuyenDe() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (records: Partial<NhomChuyenDe>[]): Promise<BatchNhomChuyenDeOperationResult> => {
      let inserted = 0
      let updated = 0
      const errors: BatchNhomChuyenDeOperationResult["errors"] = []

      // Get current user ID for nguoi_tao_id
      const nguoiTaoId = user?.id ? parseInt(user.id) : 1

      // Process in batches of 1000
      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)

        // Check which records exist by ten_nhom
        const tenNhomList = batch
          .map((r) => r.ten_nhom)
          .filter(Boolean) as string[]

        const existingRecords = new Map<string, number>()
        if (tenNhomList.length > 0) {
          const { data: existing } = await supabase
            .from(TABLE_NAME)
            .select("id, ten_nhom")
            .in("ten_nhom", tenNhomList)

          if (existing) {
            existing.forEach((record) => {
              if (record.ten_nhom) {
                existingRecords.set(record.ten_nhom, record.id!)
              }
            })
          }
        }

        // Validate and sanitize records
        const toInsert: CreateNhomChuyenDeInput[] = []
        const toUpdate: Array<{ id: number; data: Partial<NhomChuyenDe> }> = []

        batch.forEach((record, batchIndex) => {
          const originalIndex = i + batchIndex

          // Validate required fields
          if (!record.ten_nhom || !String(record.ten_nhom).trim()) {
            errors.push({
              row: originalIndex,
              error: "Tên nhóm là bắt buộc",
            })
            return
          }

          const tenNhom = String(record.ten_nhom).trim()

          const sanitizedRecord: CreateNhomChuyenDeInput = {
            ten_nhom: tenNhom,
            mo_ta: record.mo_ta ? String(record.mo_ta).trim() : null,
            nguoi_tao_id: nguoiTaoId,
          }

          if (existingRecords.has(tenNhom)) {
            // Update existing record
            toUpdate.push({
              id: existingRecords.get(tenNhom)!,
              data: {
                ten_nhom: sanitizedRecord.ten_nhom,
                mo_ta: sanitizedRecord.mo_ta,
              },
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
              .update({
                ...data,
                tg_cap_nhat: new Date().toISOString(),
              })
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
      await queryClient.invalidateQueries({ queryKey: nhomChuyenDeQueryKeys.all() })

      return { inserted, updated, errors }
    },
    onSuccess: (result) => {
      const total = result.inserted + result.updated
      if (total > 0) {
        toast.success(`Đã import ${total} nhóm chuyên đề thành công (${result.inserted} mới, ${result.updated} cập nhật)`)
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

