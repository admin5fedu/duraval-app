"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { CauTraLoi } from "../schema"
import type { BatchCauTraLoiOperationResult } from "../types"
import { cauTraLoiQueryKeys } from "@/lib/react-query/query-keys"
import { useAuthStore } from "@/shared/stores/auth-store"

const TABLE_NAME = "chhn_cau_tra_loi"

/**
 * Hook for batch upsert (import) câu trả lời from Excel
 * Logic: Check by lich_dang_id + cau_tra_loi (unique combination)
 */
export function useBatchUpsertCauTraLoi() {
  const queryClient = useQueryClient()
  const { employee } = useAuthStore()

  return useMutation({
    mutationFn: async (records: Partial<CauTraLoi>[]): Promise<BatchCauTraLoiOperationResult> => {
      let inserted = 0
      let updated = 0
      const errors: BatchCauTraLoiOperationResult["errors"] = []

      // Get current user's ma_nhan_vien for nguoi_tao_id
      const nguoiTaoId = employee?.ma_nhan_vien
      if (!nguoiTaoId) {
        throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.")
      }

      // Process in batches of 1000
      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)
        
        // Get existing records by lich_dang_id + cau_tra_loi combination
        const existingRecordsMap = new Map<string, number>() // key: `${lich_dang_id}|${cau_tra_loi}`, value: id
        
        // Get unique lich_dang_id + cau_tra_loi combinations from batch
        const uniqueCombos = new Set<string>()
        batch.forEach(r => {
          if (r.lich_dang_id && r.cau_tra_loi) {
            uniqueCombos.add(`${r.lich_dang_id}|${r.cau_tra_loi}`)
          }
        })

        // Fetch existing records matching these combinations
        if (uniqueCombos.size > 0) {
          // Get all records for the lich_dang_ids in the batch
          const lichDangIds = Array.from(uniqueCombos).map(combo => Number(combo.split('|')[0]))
          const uniqueLichDangIds = [...new Set(lichDangIds)]
          
          const { data: existingRecords } = await supabase
            .from(TABLE_NAME)
            .select("id, lich_dang_id, cau_tra_loi")
            .in("lich_dang_id", uniqueLichDangIds)

          existingRecords?.forEach(record => {
            if (record.lich_dang_id && record.cau_tra_loi) {
              const key = `${record.lich_dang_id}|${record.cau_tra_loi}`
              existingRecordsMap.set(key, record.id)
            }
          })
        }

        // Separate into inserts and updates
        const toInsert: Array<{ record: Partial<CauTraLoi>; originalIndex: number }> = []
        const toUpdate: Array<{
          id: number
          data: Partial<CauTraLoi>
          originalIndex: number
        }> = []

        batch.forEach((record, index) => {
          const originalIndex = index + i

          // Validate required fields
          if (!record.lich_dang_id) {
            errors.push({
              row: originalIndex,
              error: "Lịch đăng không được để trống",
            })
            return
          }

          if (!record.cau_tra_loi || String(record.cau_tra_loi).trim() === "") {
            errors.push({
              row: originalIndex,
              error: "Câu trả lời không được để trống",
            })
            return
          }

          if (!record.ket_qua || String(record.ket_qua).trim() === "") {
            errors.push({
              row: originalIndex,
              error: "Kết quả không được để trống",
            })
            return
          }

          // Check if record exists
          const key = `${record.lich_dang_id}|${record.cau_tra_loi}`
          const existingId = existingRecordsMap.get(key)
          
          if (existingId) {
            // Update existing
            const updateData: Partial<CauTraLoi> = {}
            if (record.ket_qua !== undefined) updateData.ket_qua = record.ket_qua
            
            toUpdate.push({
              id: existingId,
              data: updateData,
              originalIndex,
            })
          } else {
            // Insert new
            toInsert.push({
              record: {
                ...record,
                nguoi_tao_id: nguoiTaoId,
              },
              originalIndex,
            })
          }
        })

        // Execute inserts
        if (toInsert.length > 0) {
          const insertRecords = toInsert.map(item => ({
            lich_dang_id: item.record.lich_dang_id!,
            cau_tra_loi: item.record.cau_tra_loi!,
            ket_qua: item.record.ket_qua!,
            nguoi_tao_id: item.record.nguoi_tao_id!,
          }))
          
          const { error: insertError } = await supabase
            .from(TABLE_NAME)
            .insert(insertRecords)

          if (insertError) {
            toInsert.forEach(({ originalIndex }) => {
              errors.push({ row: originalIndex, error: insertError.message })
            })
          } else {
            inserted += toInsert.length
          }
        }

        // Execute updates
        for (const { id, data: updateData, originalIndex } of toUpdate) {
          const { error: updateError } = await supabase
            .from(TABLE_NAME)
            .update(updateData)
            .eq("id", id)

          if (updateError) {
            errors.push({ row: originalIndex, error: updateError.message })
          } else {
            updated++
          }
        }
      }

      return { inserted, updated, errors }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: cauTraLoiQueryKeys.all() })
      
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

