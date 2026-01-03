"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { ChuyenDe, CreateChuyenDeInput } from "../schema"
import { chuyenDe as chuyenDeQueryKeys } from "@/lib/react-query/query-keys/chuyen-de"
import { useAuthStore } from "@/shared/stores/auth-store"

const TABLE_NAME = "dao_tao_chuyen_de"

/**
 * Batch operation result
 */
export interface BatchChuyenDeOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

/**
 * Hook for batch upsert (import) chuyên đề from Excel
 */
export function useBatchUpsertChuyenDe() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (records: Partial<ChuyenDe>[]): Promise<BatchChuyenDeOperationResult> => {
      let inserted = 0
      let updated = 0
      const errors: BatchChuyenDeOperationResult["errors"] = []

      // Get current user ID for nguoi_tao_id
      const nguoiTaoId = user?.id ? parseInt(user.id) : 1

      // Get all nhom_chuyen_de to map by name
      const { data: nhomChuyenDeList } = await supabase
        .from("dao_tao_nhom_chuyen_de")
        .select("id, ten_nhom")

      const nhomChuyenDeMap = new Map<string, number>()
      if (nhomChuyenDeList) {
        nhomChuyenDeList.forEach((nhom) => {
          if (nhom.ten_nhom) {
            nhomChuyenDeMap.set(nhom.ten_nhom.trim().toLowerCase(), nhom.id!)
          }
        })
      }

      // Process in batches of 1000
      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)

        // Check which records exist by ten_chuyen_de and nhom_chuyen_de_id
        const existingRecords = new Map<string, number>()
        const checkKeys: Array<{ ten_chuyen_de: string; nhom_chuyen_de_id: number }> = []
        
        batch.forEach((record) => {
          if (record.ten_chuyen_de && record.nhom_chuyen_de_id) {
            checkKeys.push({
              ten_chuyen_de: String(record.ten_chuyen_de).trim(),
              nhom_chuyen_de_id: record.nhom_chuyen_de_id,
            })
          }
        })

        if (checkKeys.length > 0) {
          // Check existing records
          for (const key of checkKeys) {
            const { data: existing } = await supabase
              .from(TABLE_NAME)
              .select("id")
              .eq("ten_chuyen_de", key.ten_chuyen_de)
              .eq("nhom_chuyen_de_id", key.nhom_chuyen_de_id)
              .single()

            if (existing) {
              existingRecords.set(`${key.ten_chuyen_de}|${key.nhom_chuyen_de_id}`, existing.id)
            }
          }
        }

        // Validate and sanitize records
        const toInsert: CreateChuyenDeInput[] = []
        const toUpdate: Array<{ id: number; data: Partial<ChuyenDe> }> = []

        batch.forEach((record, batchIndex) => {
          const originalIndex = i + batchIndex

          // Validate required fields
          if (!record.ten_chuyen_de || !String(record.ten_chuyen_de).trim()) {
            errors.push({
              row: originalIndex,
              error: "Tên chuyên đề là bắt buộc",
            })
            return
          }

          // Resolve nhom_chuyen_de_id from ten_nhom_chuyen_de if provided
          let nhomChuyenDeId: number | undefined = record.nhom_chuyen_de_id
          
          if (!nhomChuyenDeId && record.ten_nhom_chuyen_de) {
            const tenNhom = String(record.ten_nhom_chuyen_de).trim().toLowerCase()
            nhomChuyenDeId = nhomChuyenDeMap.get(tenNhom)
            
            if (!nhomChuyenDeId) {
              errors.push({
                row: originalIndex,
                error: `Không tìm thấy nhóm chuyên đề: ${record.ten_nhom_chuyen_de}`,
              })
              return
            }
          }

          if (!nhomChuyenDeId || nhomChuyenDeId <= 0) {
            errors.push({
              row: originalIndex,
              error: "Nhóm chuyên đề là bắt buộc",
            })
            return
          }

          const tenChuyenDe = String(record.ten_chuyen_de).trim()
          const key = `${tenChuyenDe}|${nhomChuyenDeId}`

          const sanitizedRecord: CreateChuyenDeInput = {
            ten_chuyen_de: tenChuyenDe,
            nhom_chuyen_de_id: nhomChuyenDeId,
            mo_ta: record.mo_ta ? String(record.mo_ta).trim() : null,
            nguoi_tao_id: nguoiTaoId,
          }

          if (existingRecords.has(key)) {
            // Update existing record
            toUpdate.push({
              id: existingRecords.get(key)!,
              data: {
                ten_chuyen_de: sanitizedRecord.ten_chuyen_de,
                nhom_chuyen_de_id: sanitizedRecord.nhom_chuyen_de_id,
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
      await queryClient.invalidateQueries({ queryKey: chuyenDeQueryKeys.all() })

      return { inserted, updated, errors }
    },
    onSuccess: (result) => {
      const total = result.inserted + result.updated
      if (total > 0) {
        toast.success(`Đã import ${total} chuyên đề thành công (${result.inserted} mới, ${result.updated} cập nhật)`)
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

