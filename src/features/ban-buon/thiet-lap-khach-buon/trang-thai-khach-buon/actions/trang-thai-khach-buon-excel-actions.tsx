"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { TrangThaiKhachBuon, CreateTrangThaiKhachBuonInput } from "../schema"
import { trangThaiKhachBuonQueryKeys } from "@/lib/react-query/query-keys"
import { useAuthStore } from "@/shared/stores/auth-store"

const TABLE_NAME = "bb_trang_thai"

/**
 * Batch operation result
 */
export interface BatchTrangThaiKhachBuonOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

/**
 * Hook for batch insert (import) trạng thái khách buôn from Excel
 */
export function useBatchUpsertTrangThaiKhachBuon() {
  const queryClient = useQueryClient()
  const { employee } = useAuthStore()

  return useMutation({
    mutationFn: async (records: Partial<TrangThaiKhachBuon>[]): Promise<BatchTrangThaiKhachBuonOperationResult> => {
      let inserted = 0
      const updated = 0
      const errors: BatchTrangThaiKhachBuonOperationResult["errors"] = []

      // Process in batches of 1000
      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)

        // Validate and sanitize records
        const validRecords: CreateTrangThaiKhachBuonInput[] = []
        
        batch.forEach((record, batchIndex) => {
          const originalIndex = i + batchIndex
          
          // Validate required fields
          if (!record.ten_trang_thai || !String(record.ten_trang_thai).trim()) {
            errors.push({
              row: originalIndex,
              error: "Tên trạng thái là bắt buộc",
            })
            return
          }
          
          // Validate tt if provided
          if (record.tt !== null && record.tt !== undefined && String(record.tt).trim() !== "") {
            const ttValue = typeof record.tt === 'number' ? record.tt : parseFloat(String(record.tt))
            if (isNaN(ttValue) || ttValue < 1) {
              errors.push({
                row: originalIndex,
                error: "Thứ tự phải là số lớn hơn 0",
              })
              return
            }
          }

          // Sanitize input
          const ttValue = record.tt !== null && record.tt !== undefined && String(record.tt).trim() !== "" 
            ? (typeof record.tt === 'number' ? record.tt : parseFloat(String(record.tt)))
            : null
          const giaiDoanIdValue = record.giai_doan_id ? Number(record.giai_doan_id) : null
          const macDinhKhoiDauValue = record.mac_dinh_khoi_dau === "YES" || record.mac_dinh_khoi_dau === "NO" 
            ? (record.mac_dinh_khoi_dau as "YES" | "NO") 
            : "NO" // Default to "NO" if not provided
          
          const sanitizedRecord: CreateTrangThaiKhachBuonInput = {
            ma_trang_thai: record.ma_trang_thai && String(record.ma_trang_thai).trim() !== "" ? String(record.ma_trang_thai).trim() : "",
            ten_trang_thai: String(record.ten_trang_thai || "").trim(),
            mo_ta: record.mo_ta && String(record.mo_ta).trim() !== "" ? String(record.mo_ta).trim() : null,
            tt: ttValue ?? 1, // Default to 1 if null
            mac_dinh_khoi_dau: macDinhKhoiDauValue,
            giai_doan_id: giaiDoanIdValue ?? 1, // Default to 1 if null (required field)
            nguoi_tao_id: employee?.ma_nhan_vien || null,
          }

          validRecords.push(sanitizedRecord)
        })

        // Execute inserts
        if (validRecords.length > 0) {
          const { error: insertError } = await supabase
            .from(TABLE_NAME)
            .insert(validRecords)

          if (insertError) {
            // If batch insert fails, try individual inserts to identify which records failed
            for (let j = 0; j < validRecords.length; j++) {
              const { error: singleError } = await supabase
                .from(TABLE_NAME)
                .insert(validRecords[j])

              if (singleError) {
                const originalIndex = i + (batch.length - validRecords.length + j)
                errors.push({
                  row: originalIndex,
                  error: singleError.message,
                })
              } else {
                inserted++
              }
            }
          } else {
            inserted += validRecords.length
          }
        }
      }

      return { inserted, updated, errors }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: trangThaiKhachBuonQueryKeys.all() })
      
      if (result.errors.length > 0) {
        toast.warning(
          `Nhập dữ liệu hoàn tất: ${result.inserted} thêm mới, ${result.errors.length} lỗi`
        )
      } else {
        toast.success(
          `Nhập dữ liệu thành công: ${result.inserted} thêm mới`
        )
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Có lỗi xảy ra khi nhập dữ liệu")
    },
  })
}

