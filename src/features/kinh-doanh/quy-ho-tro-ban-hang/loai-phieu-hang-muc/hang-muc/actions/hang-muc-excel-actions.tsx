"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { HangMuc, CreateHangMucInput } from "../schema"
import { hangMucQueryKeys } from "@/lib/react-query/query-keys"

const TABLE_NAME = "htbh_hang_muc"

/**
 * Batch operation result
 */
export interface BatchHangMucOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

/**
 * Hook for batch insert (import) hạng mục from Excel
 */
export function useBatchUpsertHangMuc() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (records: Partial<HangMuc>[]): Promise<BatchHangMucOperationResult> => {
      let inserted = 0
      const updated = 0
      const errors: BatchHangMucOperationResult["errors"] = []

      // Process in batches of 1000
      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)

        // Validate and sanitize records
        const validRecords: CreateHangMucInput[] = []
        
        batch.forEach((record, batchIndex) => {
          const originalIndex = i + batchIndex
          
          // Validate required fields
          if (!record.ten_hang_muc || !String(record.ten_hang_muc).trim()) {
            errors.push({
              row: originalIndex,
              error: "Tên hạng mục là bắt buộc",
            })
            return
          }

          // Sanitize input
          const sanitizedRecord: CreateHangMucInput = {
            loai_phieu_id: record.loai_phieu_id || null,
            ten_hang_muc: String(record.ten_hang_muc).trim(),
            mo_ta: record.mo_ta && String(record.mo_ta).trim() !== "" ? String(record.mo_ta).trim() : null,
          }

          validRecords.push(sanitizedRecord)
        })

        // Execute inserts
        if (validRecords.length > 0) {
          // Get ten_loai_phieu for each record if loai_phieu_id is provided
          const enrichedRecords = await Promise.all(
            validRecords.map(async (record) => {
              let tenLoaiPhieu: string | null = null
              if (record.loai_phieu_id) {
                const { data: loaiPhieuData } = await supabase
                  .from("htbh_loai_phieu")
                  .select("ten_loai_phieu")
                  .eq("id", record.loai_phieu_id)
                  .single()
                
                tenLoaiPhieu = loaiPhieuData?.ten_loai_phieu || null
              }

              return {
                ...record,
                ten_loai_phieu: tenLoaiPhieu,
              }
            })
          )

          const { error: insertError } = await supabase
            .from(TABLE_NAME)
            .insert(enrichedRecords)

          if (insertError) {
            // If batch insert fails, try individual inserts to identify which records failed
            for (let j = 0; j < enrichedRecords.length; j++) {
              const { error: singleError } = await supabase
                .from(TABLE_NAME)
                .insert(enrichedRecords[j])

              if (singleError) {
                const originalIndex = i + (batch.length - enrichedRecords.length + j)
                errors.push({
                  row: originalIndex,
                  error: singleError.message,
                })
              } else {
                inserted++
              }
            }
          } else {
            inserted += enrichedRecords.length
          }
        }
      }

      return { inserted, updated, errors }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: hangMucQueryKeys.all() })
      
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

