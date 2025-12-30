"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { LoaiTaiLieu } from "../schema"
import type { BatchLoaiTaiLieuOperationResult } from "../types"
import { loaiTaiLieuQueryKeys } from "@/lib/react-query/query-keys"
import { useAuthStore } from "@/shared/stores/auth-store"

const TABLE_NAME = "tai_lieu_loai"

/**
 * Hook for batch upsert (import) loại tài liệu from Excel
 * Logic: Check by combination of hang_muc + loai
 */
export function useBatchUpsertLoaiTaiLieu() {
  const queryClient = useQueryClient()
  const { employee } = useAuthStore()

  return useMutation({
    mutationFn: async (records: Partial<LoaiTaiLieu>[]): Promise<BatchLoaiTaiLieuOperationResult> => {
      let inserted = 0
      let updated = 0
      const errors: BatchLoaiTaiLieuOperationResult["errors"] = []

      // Get current user's ma_nhan_vien for nguoi_tao_id
      const nguoiTaoId = employee?.ma_nhan_vien
      if (!nguoiTaoId) {
        throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.")
      }

      // Process in batches of 1000
      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)
        
        // Get all existing records to check for duplicates
        // We'll match by combination of hang_muc + loai
        const { data: existingRecords } = await supabase
          .from(TABLE_NAME)
          .select("id, hang_muc, loai")

        // Create a map: key = "hang_muc|loai", value = id
        const existingRecordsMap = new Map<string, number>()
        existingRecords?.forEach(record => {
          const key = `${record.hang_muc || ""}|${record.loai || ""}`
          existingRecordsMap.set(key, record.id)
        })

        // Separate into inserts and updates
        const toInsert: Array<{ record: Partial<LoaiTaiLieu>; originalIndex: number }> = []
        const toUpdate: Array<{
          id: number
          data: Partial<LoaiTaiLieu>
          originalIndex: number
        }> = []

        batch.forEach((record, index) => {
          const originalIndex = index + i

          // Required fields validation
          if (!record.hang_muc || String(record.hang_muc).trim() === "") {
            errors.push({
              row: originalIndex,
              error: "Hạng mục là bắt buộc",
            })
            return
          }

          const hangMuc = String(record.hang_muc).trim()
          if (hangMuc !== "Biểu mẫu & Kế hoạch" && hangMuc !== "Văn bản hệ thống") {
            errors.push({
              row: originalIndex,
              error: "Hạng mục phải là 'Biểu mẫu & Kế hoạch' hoặc 'Văn bản hệ thống'",
            })
            return
          }

          if (!record.loai || String(record.loai).trim() === "") {
            errors.push({
              row: originalIndex,
              error: "Loại là bắt buộc",
            })
            return
          }

          // Create key for matching
          const key = `${hangMuc}|${String(record.loai).trim()}`
          const existingId = existingRecordsMap.get(key)

          if (existingId) {
            // Update existing
            const updateData: Partial<LoaiTaiLieu> = {}
            if (record.hang_muc !== undefined) updateData.hang_muc = hangMuc
            if (record.loai !== undefined) updateData.loai = String(record.loai).trim()
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
                hang_muc: hangMuc,
                loai: String(record.loai).trim(),
                mo_ta: record.mo_ta || null,
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
      queryClient.invalidateQueries({ queryKey: loaiTaiLieuQueryKeys.all() })
      
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

