"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { DanhMucTaiLieu } from "../schema"
import type { BatchDanhMucTaiLieuOperationResult } from "../types"
import { danhMucTaiLieuQueryKeys } from "@/lib/react-query/query-keys"
import { useAuthStore } from "@/shared/stores/auth-store"

const TABLE_NAME = "tai_lieu_danh_muc_tai_lieu"

/**
 * Hook for batch upsert (import) danh mục tài liệu from Excel
 * Logic: Check by combination of hang_muc + ten_danh_muc
 */
export function useBatchUpsertDanhMucTaiLieu() {
  const queryClient = useQueryClient()
  const { employee } = useAuthStore()

  return useMutation({
    mutationFn: async (records: Partial<DanhMucTaiLieu>[]): Promise<BatchDanhMucTaiLieuOperationResult> => {
      let inserted = 0
      let updated = 0
      const errors: BatchDanhMucTaiLieuOperationResult["errors"] = []

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
        // We'll match by combination of hang_muc + ten_danh_muc
        const { data: existingRecords } = await supabase
          .from(TABLE_NAME)
          .select("id, hang_muc, ten_danh_muc")

        // Create a map: key = "hang_muc|ten_danh_muc", value = id
        const existingRecordsMap = new Map<string, number>()
        existingRecords?.forEach(record => {
          const key = `${record.hang_muc || ""}|${record.ten_danh_muc || ""}`
          existingRecordsMap.set(key, record.id)
        })

        // Separate into inserts and updates
        const toInsert: Array<{ record: Partial<DanhMucTaiLieu>; originalIndex: number }> = []
        const toUpdate: Array<{
          id: number
          data: Partial<DanhMucTaiLieu>
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

          // Loại ID bắt buộc
          if (!record.loai_id || isNaN(Number(record.loai_id))) {
            errors.push({
              row: originalIndex,
              error: "Loại ID là bắt buộc và phải là số",
            })
            return
          }

          // Tự động tính cap từ danh_muc_cha_id
          let cap: number
          let tenDanhMucCha: string | null = null
          
          if (record.danh_muc_cha_id) {
            cap = 2
            // Tìm ten_danh_muc_cha từ danh sách
            const danhMucCha = existingRecords?.find(item => item.id === Number(record.danh_muc_cha_id))
            tenDanhMucCha = danhMucCha?.ten_danh_muc || null
          } else {
            cap = 1
          }

          // Validate cap nếu có trong record
          if (record.cap !== undefined && record.cap !== null) {
            const recordCap = Number(record.cap)
            if (recordCap !== cap) {
              errors.push({
                row: originalIndex,
                error: `Cấp không khớp: có danh mục cha thì cấp phải là 2, không có thì cấp phải là 1`,
              })
              return
            }
          }

          // Validate ten_danh_muc (required)
          const tenDanhMuc = record.ten_danh_muc ? String(record.ten_danh_muc).trim() : ""
          if (!tenDanhMuc) {
            errors.push({
              row: originalIndex,
              error: "Tên danh mục là bắt buộc",
            })
            return
          }

          // Create key for matching
          const key = `${hangMuc}|${tenDanhMuc}`
          const existingId = existingRecordsMap.get(key)

          if (existingId) {
            // Update existing
            const updateData: Partial<DanhMucTaiLieu> = {}
            if (record.hang_muc !== undefined) updateData.hang_muc = hangMuc
            if (record.loai_id !== undefined) updateData.loai_id = Number(record.loai_id)
            if (record.loai_tai_lieu !== undefined) updateData.loai_tai_lieu = record.loai_tai_lieu || null
            updateData.cap = cap // Tự động tính
            if (record.ten_danh_muc !== undefined) {
                updateData.ten_danh_muc = tenDanhMuc
            }
            if (record.danh_muc_cha_id !== undefined) updateData.danh_muc_cha_id = record.danh_muc_cha_id ? Number(record.danh_muc_cha_id) : null
            if (tenDanhMucCha) {
                updateData.ten_danh_muc_cha = tenDanhMucCha // Tự động tính
            }
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
                loai_id: Number(record.loai_id),
                loai_tai_lieu: record.loai_tai_lieu || null,
                cap: cap, // Tự động tính
                ten_danh_muc: tenDanhMuc, // Required, đã validate ở trên
                danh_muc_cha_id: record.danh_muc_cha_id ? Number(record.danh_muc_cha_id) : null,
                ten_danh_muc_cha: tenDanhMucCha || null, // Tự động tính
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
      queryClient.invalidateQueries({ queryKey: danhMucTaiLieuQueryKeys.all() })
      
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

