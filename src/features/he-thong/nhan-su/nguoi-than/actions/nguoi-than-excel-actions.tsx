"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { NguoiThan, CreateNguoiThanInput } from "../schema"
import type { BatchNguoiThanOperationResult } from "../schema"
import { nguoiThanQueryKeys } from "@/lib/react-query/query-keys"

const TABLE_NAME = "var_nguoi_than"

/**
 * Hook for batch insert (import) người thân from Excel
 * 
 * Note: Unlike nhân sự, người thân doesn't support update on import
 * because one employee can have multiple relatives.
 * We only insert new records.
 */
export function useBatchUpsertNguoiThan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (records: Partial<NguoiThan>[]): Promise<BatchNguoiThanOperationResult> => {
      let inserted = 0
      const updated = 0
      const errors: BatchNguoiThanOperationResult["errors"] = []

      // Process in batches of 1000
      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)

        // Validate and sanitize records
        const validRecords: CreateNguoiThanInput[] = []
        
        batch.forEach((record, batchIndex) => {
          const originalIndex = i + batchIndex
          
          // Validate required fields
          if (!record.ma_nhan_vien) {
            errors.push({
              row: originalIndex,
              error: "Mã nhân viên là bắt buộc",
            })
            return
          }

          if (!record.ho_va_ten || !record.ho_va_ten.trim()) {
            errors.push({
              row: originalIndex,
              error: "Họ và tên là bắt buộc",
            })
            return
          }

          if (!record.moi_quan_he || !record.moi_quan_he.trim()) {
            errors.push({
              row: originalIndex,
              error: "Mối quan hệ là bắt buộc",
            })
            return
          }

          // Sanitize input: convert empty strings to null for optional fields
          const sanitizedRecord: CreateNguoiThanInput = {
            ma_nhan_vien: Number(record.ma_nhan_vien),
            ho_va_ten: String(record.ho_va_ten).trim(),
            moi_quan_he: String(record.moi_quan_he).trim(),
            ngay_sinh: record.ngay_sinh && String(record.ngay_sinh).trim() !== "" 
              ? String(record.ngay_sinh).trim() 
              : null,
            so_dien_thoai: record.so_dien_thoai && String(record.so_dien_thoai).trim() !== "" 
              ? String(record.so_dien_thoai).trim() 
              : null,
            ghi_chu: record.ghi_chu && String(record.ghi_chu).trim() !== "" 
              ? String(record.ghi_chu).trim() 
              : null,
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
      queryClient.invalidateQueries({ queryKey: nguoiThanQueryKeys.all() })
      
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

