"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { DanhMucCauHoi } from "../schema"
import type { BatchDanhMucCauHoiOperationResult } from "../types"
import { danhMucCauHoiQueryKeys } from "@/lib/react-query/query-keys"
import { useAuthStore } from "@/shared/stores/auth-store"

const TABLE_NAME = "chhn_nhom_cau_hoi"

/**
 * Hook for batch upsert (import) danh mục câu hỏi from Excel
 * Logic: Check by ten_nhom (name)
 */
export function useBatchUpsertDanhMucCauHoi() {
  const queryClient = useQueryClient()
  const { employee } = useAuthStore()

  return useMutation({
    mutationFn: async (records: Partial<DanhMucCauHoi>[]): Promise<BatchDanhMucCauHoiOperationResult> => {
      let inserted = 0
      let updated = 0
      const errors: BatchDanhMucCauHoiOperationResult["errors"] = []

      // Get current user's ma_nhan_vien for nguoi_tao_id
      const nguoiTaoId = employee?.ma_nhan_vien
      if (!nguoiTaoId) {
        throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.")
      }

      // Process in batches of 1000
      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)
        
        // Get existing records by ten_nhom
        const tenNhomList = batch.map(r => r.ten_nhom).filter(Boolean) as string[]
        const existingRecordsMap = new Map<string, number>() // key: ten_nhom, value: id
        
        if (tenNhomList.length > 0) {
          const { data: existingRecords } = await supabase
            .from(TABLE_NAME)
            .select("id, ten_nhom")
            .in("ten_nhom", tenNhomList)

          existingRecords?.forEach(record => {
            if (record.ten_nhom) {
              existingRecordsMap.set(record.ten_nhom, record.id)
            }
          })
        }

        // Separate into inserts and updates
        const toInsert: Array<{ record: Partial<DanhMucCauHoi>; originalIndex: number }> = []
        const toUpdate: Array<{
          id: number
          data: Partial<DanhMucCauHoi>
          originalIndex: number
        }> = []

        batch.forEach((record, index) => {
          const originalIndex = index + i

          if (!record.ten_nhom) {
            errors.push({
              row: originalIndex,
              error: "Tên nhóm không được để trống",
            })
            return
          }

          const existingId = existingRecordsMap.get(record.ten_nhom)
          if (existingId) {
            // Update existing
            const updateData: Partial<DanhMucCauHoi> = {}
            if (record.mo_ta !== undefined) updateData.mo_ta = record.mo_ta || null
            
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
      queryClient.invalidateQueries({ queryKey: danhMucCauHoiQueryKeys.all() })
      
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

