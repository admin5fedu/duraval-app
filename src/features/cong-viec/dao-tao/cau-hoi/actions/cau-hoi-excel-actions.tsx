"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { CauHoi, CreateCauHoiInput } from "../schema"
import { cauHoi as cauHoiQueryKeys } from "@/lib/react-query/query-keys/cau-hoi"
import { useAuthStore } from "@/shared/stores/auth-store"

const TABLE_NAME = "dao_tao_cau_hoi"

/**
 * Batch operation result
 */
export interface BatchCauHoiOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

/**
 * Hook for batch upsert (import) câu hỏi from Excel
 */
export function useBatchUpsertCauHoi() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (records: Partial<CauHoi>[]): Promise<BatchCauHoiOperationResult> => {
      let inserted = 0
      let updated = 0
      const errors: BatchCauHoiOperationResult["errors"] = []

      // Get current user ID for nguoi_tao_id
      const nguoiTaoId = user?.id ? parseInt(user.id) : 1

      // Get all chuyen_de to map by name
      const { data: chuyenDeList } = await supabase
        .from("dao_tao_chuyen_de")
        .select("id, ten_chuyen_de")

      const chuyenDeMap = new Map<string, number>()
      if (chuyenDeList) {
        chuyenDeList.forEach((chuyenDe) => {
          if (chuyenDe.ten_chuyen_de) {
            chuyenDeMap.set(chuyenDe.ten_chuyen_de.trim().toLowerCase(), chuyenDe.id!)
          }
        })
      }

      // Process in batches of 1000
      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)

        // Check which records exist by cau_hoi and chuyen_de_id
        const existingRecords = new Map<string, number>()
        const checkKeys: Array<{ cau_hoi: string; chuyen_de_id: number }> = []
        
        batch.forEach((record) => {
          if (record.cau_hoi && record.chuyen_de_id) {
            checkKeys.push({
              cau_hoi: String(record.cau_hoi).trim(),
              chuyen_de_id: record.chuyen_de_id,
            })
          }
        })

        if (checkKeys.length > 0) {
          // Check existing records
          for (const key of checkKeys) {
            const { data: existing } = await supabase
              .from(TABLE_NAME)
              .select("id")
              .eq("cau_hoi", key.cau_hoi)
              .eq("chuyen_de_id", key.chuyen_de_id)
              .single()

            if (existing) {
              existingRecords.set(`${key.cau_hoi}|${key.chuyen_de_id}`, existing.id)
            }
          }
        }

        // Validate and sanitize records
        const toInsert: CreateCauHoiInput[] = []
        const toUpdate: Array<{ id: number; data: Partial<CauHoi> }> = []

        batch.forEach((record, batchIndex) => {
          const originalIndex = i + batchIndex

          // Validate required fields
          if (!record.cau_hoi || !String(record.cau_hoi).trim()) {
            errors.push({
              row: originalIndex,
              error: "Câu hỏi là bắt buộc",
            })
            return
          }

          // Resolve chuyen_de_id from ten_chuyen_de if provided
          let chuyenDeId: number | undefined = record.chuyen_de_id
          
          if (!chuyenDeId && record.ten_chuyen_de) {
            const tenChuyenDe = String(record.ten_chuyen_de).trim().toLowerCase()
            chuyenDeId = chuyenDeMap.get(tenChuyenDe)
            
            if (!chuyenDeId) {
              errors.push({
                row: originalIndex,
                error: `Không tìm thấy chuyên đề: ${record.ten_chuyen_de}`,
              })
              return
            }
          }

          if (!chuyenDeId || chuyenDeId <= 0) {
            errors.push({
              row: originalIndex,
              error: "Chuyên đề là bắt buộc",
            })
            return
          }

          // Validate đáp án
          if (!record.dap_an_1 || !String(record.dap_an_1).trim()) {
            errors.push({
              row: originalIndex,
              error: "Đáp án 1 là bắt buộc",
            })
            return
          }

          if (!record.dap_an_2 || !String(record.dap_an_2).trim()) {
            errors.push({
              row: originalIndex,
              error: "Đáp án 2 là bắt buộc",
            })
            return
          }

          if (!record.dap_an_3 || !String(record.dap_an_3).trim()) {
            errors.push({
              row: originalIndex,
              error: "Đáp án 3 là bắt buộc",
            })
            return
          }

          if (!record.dap_an_4 || !String(record.dap_an_4).trim()) {
            errors.push({
              row: originalIndex,
              error: "Đáp án 4 là bắt buộc",
            })
            return
          }

          // Validate dap_an_dung
          let dapAnDung = record.dap_an_dung
          if (typeof dapAnDung === 'string') {
            dapAnDung = parseInt(dapAnDung, 10)
          }
          if (!dapAnDung || dapAnDung < 1 || dapAnDung > 4) {
            errors.push({
              row: originalIndex,
              error: "Đáp án đúng phải từ 1 đến 4",
            })
            return
          }

          const cauHoi = String(record.cau_hoi).trim()
          const key = `${cauHoi}|${chuyenDeId}`

          const sanitizedRecord: CreateCauHoiInput = {
            cau_hoi: cauHoi,
            chuyen_de_id: chuyenDeId,
            dap_an_1: String(record.dap_an_1).trim(),
            dap_an_2: String(record.dap_an_2).trim(),
            dap_an_3: String(record.dap_an_3).trim(),
            dap_an_4: String(record.dap_an_4).trim(),
            dap_an_dung: dapAnDung,
            hinh_anh: Array.isArray(record.hinh_anh) && record.hinh_anh.length > 0 
              ? record.hinh_anh.filter((url: string) => url && url.trim())
              : null,
            nguoi_tao_id: nguoiTaoId,
          }

          if (existingRecords.has(key)) {
            // Update existing record
            toUpdate.push({
              id: existingRecords.get(key)!,
              data: {
                cau_hoi: sanitizedRecord.cau_hoi,
                chuyen_de_id: sanitizedRecord.chuyen_de_id,
                dap_an_1: sanitizedRecord.dap_an_1,
                dap_an_2: sanitizedRecord.dap_an_2,
                dap_an_3: sanitizedRecord.dap_an_3,
                dap_an_4: sanitizedRecord.dap_an_4,
                dap_an_dung: sanitizedRecord.dap_an_dung,
                hinh_anh: sanitizedRecord.hinh_anh,
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
      await queryClient.invalidateQueries({ queryKey: cauHoiQueryKeys.all() })

      return { inserted, updated, errors }
    },
    onSuccess: (result) => {
      const total = result.inserted + result.updated
      if (total > 0) {
        toast.success(`Đã import ${total} câu hỏi thành công (${result.inserted} mới, ${result.updated} cập nhật)`)
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

