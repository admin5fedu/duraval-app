"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { BaiThi, CreateBaiThiInput } from "../schema"
import { baiThi as baiThiQueryKeys } from "@/lib/react-query/query-keys/bai-thi"

const TABLE_NAME = "dao_tao_bai_thi"

/**
 * Batch operation result
 */
export interface BatchBaiThiOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

/**
 * Hook for batch upsert (import) bài thi from Excel
 */
export function useBatchUpsertBaiThi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (records: Partial<BaiThi>[]): Promise<BatchBaiThiOperationResult> => {
      let inserted = 0
      let updated = 0
      const errors: BatchBaiThiOperationResult["errors"] = []

      // Process in batches of 1000
      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)

        // Check which records exist by ky_thi_id, nhan_vien_id, and ngay_lam_bai
        const existingRecords = new Map<string, number>()
        const checkKeys: Array<{ ky_thi_id: number; nhan_vien_id: number; ngay_lam_bai: string }> = []
        
        batch.forEach((record) => {
          if (record.ky_thi_id && record.nhan_vien_id && record.ngay_lam_bai) {
            checkKeys.push({
              ky_thi_id: typeof record.ky_thi_id === 'string' ? parseInt(record.ky_thi_id, 10) : record.ky_thi_id,
              nhan_vien_id: typeof record.nhan_vien_id === 'string' ? parseInt(record.nhan_vien_id, 10) : record.nhan_vien_id,
              ngay_lam_bai: String(record.ngay_lam_bai).trim(),
            })
          }
        })

        if (checkKeys.length > 0) {
          // Check existing records
          for (const key of checkKeys) {
            const { data: existing } = await supabase
              .from(TABLE_NAME)
              .select("id")
              .eq("ky_thi_id", key.ky_thi_id)
              .eq("nhan_vien_id", key.nhan_vien_id)
              .eq("ngay_lam_bai", key.ngay_lam_bai)
              .single()

            if (existing) {
              existingRecords.set(`${key.ky_thi_id}|${key.nhan_vien_id}|${key.ngay_lam_bai}`, existing.id)
            }
          }
        }

        // Validate and sanitize records
        const toInsert: CreateBaiThiInput[] = []
        const toUpdate: Array<{ id: number; data: Partial<BaiThi> }> = []

        batch.forEach((record, batchIndex) => {
          const originalIndex = i + batchIndex

          // Validate required fields
          if (!record.ky_thi_id) {
            errors.push({
              row: originalIndex,
              error: "Kỳ thi là bắt buộc",
            })
            return
          }

          if (!record.nhan_vien_id) {
            errors.push({
              row: originalIndex,
              error: "Nhân viên là bắt buộc",
            })
            return
          }

          if (!record.ngay_lam_bai || !String(record.ngay_lam_bai).trim()) {
            errors.push({
              row: originalIndex,
              error: "Ngày làm bài là bắt buộc",
            })
            return
          }

          // Parse numbers
          const parseNumber = (value: any, defaultValue: number | null = null): number | null => {
            if (value === null || value === undefined || value === "") return defaultValue
            if (typeof value === 'number') return value
            const num = parseInt(String(value), 10)
            return isNaN(num) ? defaultValue : num
          }

          // Parse datetime strings
          const parseDateTime = (value: any): string | null => {
            if (!value || value === "") return null
            if (typeof value === 'string') {
              // Try to parse as ISO string or datetime-local format
              try {
                const date = new Date(value)
                if (!isNaN(date.getTime())) {
                  return date.toISOString()
                }
              } catch {
                return null
              }
            }
            return null
          }

          const kyThiId = typeof record.ky_thi_id === 'string' ? parseInt(record.ky_thi_id, 10) : record.ky_thi_id
          const nhanVienId = typeof record.nhan_vien_id === 'string' ? parseInt(record.nhan_vien_id, 10) : record.nhan_vien_id
          const ngayLamBai = String(record.ngay_lam_bai).trim()
          const key = `${kyThiId}|${nhanVienId}|${ngayLamBai}`

          const sanitizedRecord: CreateBaiThiInput = {
            ky_thi_id: kyThiId,
            nhan_vien_id: nhanVienId,
            ngay_lam_bai: ngayLamBai,
            trang_thai: record.trang_thai || "Chưa thi",
            thoi_gian_bat_dau: parseDateTime(record.thoi_gian_bat_dau),
            thoi_gian_ket_thuc: parseDateTime(record.thoi_gian_ket_thuc),
            diem_so: parseNumber(record.diem_so, 0),
            tong_so_cau: parseNumber(record.tong_so_cau, 0),
            trao_doi: record.trao_doi || null,
          }

          if (existingRecords.has(key)) {
            // Update existing record
            toUpdate.push({
              id: existingRecords.get(key)!,
              data: {
                ky_thi_id: sanitizedRecord.ky_thi_id,
                nhan_vien_id: sanitizedRecord.nhan_vien_id,
                ngay_lam_bai: sanitizedRecord.ngay_lam_bai,
                trang_thai: sanitizedRecord.trang_thai,
                thoi_gian_bat_dau: sanitizedRecord.thoi_gian_bat_dau,
                thoi_gian_ket_thuc: sanitizedRecord.thoi_gian_ket_thuc,
                diem_so: sanitizedRecord.diem_so,
                tong_so_cau: sanitizedRecord.tong_so_cau,
                trao_doi: sanitizedRecord.trao_doi,
              },
            })
          } else {
            // Insert new record
            toInsert.push(sanitizedRecord)
          }
        })

        // Perform batch insert
        if (toInsert.length > 0) {
          const { error: insertError } = await supabase
            .from(TABLE_NAME)
            .insert(toInsert)

          if (insertError) {
            errors.push({
              row: i,
              error: `Lỗi khi thêm mới: ${insertError.message}`,
            })
          } else {
            inserted += toInsert.length
          }
        }

        // Perform batch update
        if (toUpdate.length > 0) {
          for (const { id, data } of toUpdate) {
            const { error: updateError } = await supabase
              .from(TABLE_NAME)
              .update({
                ...data,
                tg_cap_nhat: new Date().toISOString(),
              })
              .eq("id", id)

            if (updateError) {
              errors.push({
                row: i,
                error: `Lỗi khi cập nhật ID ${id}: ${updateError.message}`,
              })
            } else {
              updated++
            }
          }
        }
      }

      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: baiThiQueryKeys.all() })

      return { inserted, updated, errors }
    },
    onSuccess: (result) => {
      const total = result.inserted + result.updated
      if (total > 0) {
        toast.success(`Đã import ${total} bài thi thành công (${result.inserted} mới, ${result.updated} cập nhật)`)
      }
      if (result.errors.length > 0) {
        toast.warning(`Có ${result.errors.length} lỗi trong quá trình import`)
      }
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi import: ${error.message}`)
    },
  })
}

