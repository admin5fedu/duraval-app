"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { ThongTinCongTy, CreateThongTinCongTyInput } from "../schema"
import type { BatchThongTinCongTyOperationResult } from "../schema"
import { thongTinCongTyQueryKeys } from "@/lib/react-query/query-keys"

const TABLE_NAME = "var_cong_ty"

/**
 * Hook for batch insert (import) thông tin công ty from Excel
 */
export function useBatchUpsertThongTinCongTy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (records: Partial<ThongTinCongTy>[]): Promise<BatchThongTinCongTyOperationResult> => {
      let inserted = 0
      let updated = 0
      const errors: BatchThongTinCongTyOperationResult["errors"] = []

      // Process in batches of 1000
      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)

        // Validate and sanitize records
        const validRecords: CreateThongTinCongTyInput[] = []
        
        batch.forEach((record, batchIndex) => {
          const originalIndex = i + batchIndex
          
          // Validate required fields
          if (!record.ma_cong_ty || !String(record.ma_cong_ty).trim()) {
            errors.push({
              row: originalIndex,
              error: "Mã công ty là bắt buộc",
            })
            return
          }

          if (!record.ten_cong_ty || !String(record.ten_cong_ty).trim()) {
            errors.push({
              row: originalIndex,
              error: "Tên công ty là bắt buộc",
            })
            return
          }

          if (!record.ten_day_du || !String(record.ten_day_du).trim()) {
            errors.push({
              row: originalIndex,
              error: "Tên đầy đủ là bắt buộc",
            })
            return
          }

          if (!record.link_logo || !String(record.link_logo).trim()) {
            errors.push({
              row: originalIndex,
              error: "Link logo là bắt buộc",
            })
            return
          }

          if (!record.dia_chi || !String(record.dia_chi).trim()) {
            errors.push({
              row: originalIndex,
              error: "Địa chỉ là bắt buộc",
            })
            return
          }

          if (!record.so_dien_thoai || !String(record.so_dien_thoai).trim()) {
            errors.push({
              row: originalIndex,
              error: "Số điện thoại là bắt buộc",
            })
            return
          }

          if (!record.email || !String(record.email).trim()) {
            errors.push({
              row: originalIndex,
              error: "Email là bắt buộc",
            })
            return
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(String(record.email).trim())) {
            errors.push({
              row: originalIndex,
              error: "Email không hợp lệ",
            })
            return
          }

          if (!record.website || !String(record.website).trim()) {
            errors.push({
              row: originalIndex,
              error: "Website là bắt buộc",
            })
            return
          }

          // Sanitize input
          const sanitizedRecord: CreateThongTinCongTyInput = {
            ma_cong_ty: String(record.ma_cong_ty).trim(),
            ten_cong_ty: String(record.ten_cong_ty).trim(),
            ten_day_du: String(record.ten_day_du).trim(),
            link_logo: String(record.link_logo).trim(),
            dia_chi: String(record.dia_chi).trim(),
            so_dien_thoai: String(record.so_dien_thoai).trim(),
            email: String(record.email).trim(),
            website: String(record.website).trim(),
            ap_dung: record.ap_dung ?? false,
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
      queryClient.invalidateQueries({ queryKey: thongTinCongTyQueryKeys.all() })
      
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

