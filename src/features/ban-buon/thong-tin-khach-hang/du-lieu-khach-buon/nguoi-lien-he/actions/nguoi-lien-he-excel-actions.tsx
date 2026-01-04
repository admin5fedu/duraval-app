"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { CreateNguoiLienHeInput } from "../schema"
import { nguoiLienHeQueryKeys } from "@/lib/react-query/query-keys"
import { useAuthStore } from "@/shared/stores/auth-store"

const TABLE_NAME = "bb_lien_he"

/**
 * Batch operation result
 */
export interface BatchNguoiLienHeOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

/**
 * Hook for batch upsert (import) người liên hệ from Excel
 * Uses so_dien_thoai_1 as the unique key for duplicate checking
 */
export function useBatchUpsertNguoiLienHe() {
  const queryClient = useQueryClient()
  const { employee } = useAuthStore()

  return useMutation({
    mutationFn: async (records: Partial<CreateNguoiLienHeInput>[]): Promise<BatchNguoiLienHeOperationResult> => {
      let inserted = 0
      let updated = 0
      const errors: BatchNguoiLienHeOperationResult["errors"] = []

      // Process in batches of 1000
      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)

        // Validate and sanitize records
        const recordsToUpsert: Array<{ record: CreateNguoiLienHeInput; originalIndex: number }> = []
        
        batch.forEach((record, batchIndex) => {
          const originalIndex = i + batchIndex
          
          // Validate required fields
          if (!record.khach_buon_id) {
            errors.push({
              row: originalIndex,
              error: "Khách buôn là bắt buộc",
            })
            return
          }

          if (!record.vai_tro || !String(record.vai_tro).trim()) {
            errors.push({
              row: originalIndex,
              error: "Vai trò là bắt buộc",
            })
            return
          }

          if (!record.ten_lien_he || !String(record.ten_lien_he).trim()) {
            errors.push({
              row: originalIndex,
              error: "Tên liên hệ là bắt buộc",
            })
            return
          }

          if (!record.gioi_tinh || !String(record.gioi_tinh).trim()) {
            errors.push({
              row: originalIndex,
              error: "Giới tính là bắt buộc",
            })
            return
          }

          // Sanitize input
          const sanitizedRecord: CreateNguoiLienHeInput = {
            khach_buon_id: typeof record.khach_buon_id === 'string' ? parseFloat(record.khach_buon_id) : record.khach_buon_id,
            vai_tro: String(record.vai_tro).trim(),
            ten_lien_he: String(record.ten_lien_he).trim(),
            gioi_tinh: String(record.gioi_tinh).trim(),
            hinh_anh: record.hinh_anh && String(record.hinh_anh).trim() !== "" ? String(record.hinh_anh).trim() : null,
            ngay_sinh: record.ngay_sinh && String(record.ngay_sinh).trim() !== "" ? String(record.ngay_sinh).trim() : null,
            so_dien_thoai_1: record.so_dien_thoai_1 && String(record.so_dien_thoai_1).trim() !== "" ? String(record.so_dien_thoai_1).trim() : null,
            so_dien_thoai_2: record.so_dien_thoai_2 && String(record.so_dien_thoai_2).trim() !== "" ? String(record.so_dien_thoai_2).trim() : null,
            email: record.email && String(record.email).trim() !== "" ? String(record.email).trim() : null,
            tinh_cach: record.tinh_cach && String(record.tinh_cach).trim() !== "" ? String(record.tinh_cach).trim() : null,
            so_thich: record.so_thich && String(record.so_thich).trim() !== "" ? String(record.so_thich).trim() : null,
            luu_y_khi_lam_viec: record.luu_y_khi_lam_viec && String(record.luu_y_khi_lam_viec).trim() !== "" ? String(record.luu_y_khi_lam_viec).trim() : null,
            ghi_chu_khac: record.ghi_chu_khac && String(record.ghi_chu_khac).trim() !== "" ? String(record.ghi_chu_khac).trim() : null,
            nguoi_tao_id: employee?.ma_nhan_vien || null,
          }

          recordsToUpsert.push({ record: sanitizedRecord, originalIndex })
        })

        // Check for existing records by so_dien_thoai_1
        const soDienThoaiList = recordsToUpsert
          .map((r) => r.record.so_dien_thoai_1)
          .filter(Boolean) as string[]

        let existingMap = new Map<string, number>() // so_dien_thoai_1 -> id

        if (soDienThoaiList.length > 0) {
          const { data: existingRecords } = await supabase
            .from(TABLE_NAME)
            .select("id, so_dien_thoai_1")
            .in("so_dien_thoai_1", soDienThoaiList)

          if (existingRecords) {
            existingRecords.forEach((r) => {
              if (r.so_dien_thoai_1) {
                existingMap.set(r.so_dien_thoai_1, r.id!)
              }
            })
          }
        }

        // Separate into insert and update
        const toInsert: CreateNguoiLienHeInput[] = []
        const toUpdate: Array<{ id: number; data: CreateNguoiLienHeInput; originalIndex: number }> = []

        recordsToUpsert.forEach(({ record, originalIndex }) => {
          if (record.so_dien_thoai_1 && existingMap.has(record.so_dien_thoai_1)) {
            // Update existing record
            const id = existingMap.get(record.so_dien_thoai_1)!
            toUpdate.push({ id, data: record, originalIndex })
          } else {
            // Insert new record
            toInsert.push(record)
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
        for (const { id, data, originalIndex } of toUpdate) {
          // Remove nguoi_tao_id from update data (keep original creator)
          const { nguoi_tao_id, ...updateData } = data
          
          const { error: updateError } = await supabase
            .from(TABLE_NAME)
            .update(updateData)
            .eq("id", id)

          if (updateError) {
            errors.push({
              row: originalIndex,
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
      queryClient.invalidateQueries({ queryKey: nguoiLienHeQueryKeys.all() })
      
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

