"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { LichDang } from "../schema"
import type { BatchLichDangOperationResult } from "../types"
import { lichDangQueryKeys } from "@/lib/react-query/query-keys"
import { useAuthStore } from "@/shared/stores/auth-store"

const TABLE_NAME = "chhn_lich_dang_bai"

/**
 * Hook for batch upsert (import) lịch đăng from Excel
 * Logic: Check by ngay_dang + cau_hoi (date + question)
 */
export function useBatchUpsertLichDang() {
  const queryClient = useQueryClient()
  const { employee } = useAuthStore()

  return useMutation({
    mutationFn: async (records: Partial<LichDang>[]): Promise<BatchLichDangOperationResult> => {
      let inserted = 0
      let updated = 0
      const errors: BatchLichDangOperationResult["errors"] = []

      // Get current user's ma_nhan_vien for nguoi_tao_id
      const nguoiTaoId = employee?.ma_nhan_vien
      if (!nguoiTaoId) {
        throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.")
      }

      // Process in batches of 1000
      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)
        
        // Get existing records by ngay_dang + cau_hoi combination
        // We need to check each record individually since we're matching on a combination
        const existingRecordsMap = new Map<string, number>() // key: `${ngay_dang}|${cau_hoi}`, value: id
        
        // Get unique date + question combinations from batch
        const uniqueCombos = new Set<string>()
        batch.forEach(r => {
          if (r.ngay_dang && r.cau_hoi) {
            uniqueCombos.add(`${r.ngay_dang}|${r.cau_hoi}`)
          }
        })

        // Fetch existing records matching these combinations
        if (uniqueCombos.size > 0) {
          // Get all records for the dates in the batch
          const dates = Array.from(uniqueCombos).map(combo => combo.split('|')[0])
          const uniqueDates = [...new Set(dates)]
          
          const { data: existingRecords } = await supabase
            .from(TABLE_NAME)
            .select("id, ngay_dang, cau_hoi")
            .in("ngay_dang", uniqueDates)

          existingRecords?.forEach(record => {
            if (record.ngay_dang && record.cau_hoi) {
              const key = `${record.ngay_dang}|${record.cau_hoi}`
              existingRecordsMap.set(key, record.id)
            }
          })
        }

        // Separate into inserts and updates
        const toInsert: Array<{ record: Partial<LichDang>; originalIndex: number }> = []
        const toUpdate: Array<{
          id: number
          data: Partial<LichDang>
          originalIndex: number
        }> = []

        batch.forEach((record, index) => {
          const originalIndex = index + i

          // Validate required fields
          if (!record.ngay_dang) {
            errors.push({
              row: originalIndex,
              error: "Ngày đăng không được để trống",
            })
            return
          }

          if (!record.cau_hoi || String(record.cau_hoi).trim() === "") {
            errors.push({
              row: originalIndex,
              error: "Câu hỏi không được để trống",
            })
            return
          }

          if (!record.nhom_cau_hoi) {
            errors.push({
              row: originalIndex,
              error: "Nhóm câu hỏi không được để trống",
            })
            return
          }

          // Check if record exists
          const key = `${record.ngay_dang}|${record.cau_hoi}`
          const existingId = existingRecordsMap.get(key)
          
          if (existingId) {
            // Update existing
            const updateData: Partial<LichDang> = {}
            if (record.nhom_cau_hoi !== undefined) updateData.nhom_cau_hoi = record.nhom_cau_hoi
            if (record.hinh_anh !== undefined) updateData.hinh_anh = record.hinh_anh || null
            if (record.dap_an_1 !== undefined) updateData.dap_an_1 = record.dap_an_1
            if (record.dap_an_2 !== undefined) updateData.dap_an_2 = record.dap_an_2
            if (record.dap_an_3 !== undefined) updateData.dap_an_3 = record.dap_an_3
            if (record.dap_an_4 !== undefined) updateData.dap_an_4 = record.dap_an_4
            if (record.dap_an_dung !== undefined) updateData.dap_an_dung = record.dap_an_dung
            if (record.chuc_vu_ap_dung !== undefined) updateData.chuc_vu_ap_dung = record.chuc_vu_ap_dung || null
            
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
          const insertRecords = toInsert.map(item => item.record)
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
      queryClient.invalidateQueries({ queryKey: lichDangQueryKeys.all() })
      
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

