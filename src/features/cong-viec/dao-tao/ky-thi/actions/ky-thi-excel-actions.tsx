"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { KyThi, CreateKyThiInput } from "../schema"
import { kyThi as kyThiQueryKeys } from "@/lib/react-query/query-keys/ky-thi"
import { useAuthStore } from "@/shared/stores/auth-store"

const TABLE_NAME = "dao_tao_ky_thi"

/**
 * Batch operation result
 */
export interface BatchKyThiOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

/**
 * Hook for batch upsert (import) kỳ thi from Excel
 */
export function useBatchUpsertKyThi() {
  const queryClient = useQueryClient()
  const { employee } = useAuthStore()

  return useMutation({
    mutationFn: async (records: Partial<KyThi>[]): Promise<BatchKyThiOperationResult> => {
      let inserted = 0
      let updated = 0
      const errors: BatchKyThiOperationResult["errors"] = []

      // Get current employee ma_nhan_vien for nguoi_tao_id
      const nguoiTaoId = employee?.ma_nhan_vien || null
      if (!nguoiTaoId) {
        throw new Error("Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.")
      }

      // Process in batches of 1000
      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)

        // Check which records exist by ten_ky_thi and ngay
        const existingRecords = new Map<string, number>()
        const checkKeys: Array<{ ten_ky_thi: string; ngay: string }> = []
        
        batch.forEach((record) => {
          if (record.ten_ky_thi && record.ngay) {
            checkKeys.push({
              ten_ky_thi: String(record.ten_ky_thi).trim(),
              ngay: String(record.ngay).trim(),
            })
          }
        })

        if (checkKeys.length > 0) {
          // Check existing records
          for (const key of checkKeys) {
            const { data: existing } = await supabase
              .from(TABLE_NAME)
              .select("id")
              .eq("ten_ky_thi", key.ten_ky_thi)
              .eq("ngay", key.ngay)
              .single()

            if (existing) {
              existingRecords.set(`${key.ten_ky_thi}|${key.ngay}`, existing.id)
            }
          }
        }

        // Validate and sanitize records
        const toInsert: CreateKyThiInput[] = []
        const toUpdate: Array<{ id: number; data: Partial<KyThi> }> = []

        batch.forEach((record, batchIndex) => {
          const originalIndex = i + batchIndex

          // Validate required fields
          if (!record.ngay || !String(record.ngay).trim()) {
            errors.push({
              row: originalIndex,
              error: "Ngày là bắt buộc",
            })
            return
          }

          if (!record.ten_ky_thi || !String(record.ten_ky_thi).trim()) {
            errors.push({
              row: originalIndex,
              error: "Tên kỳ thi là bắt buộc",
            })
            return
          }

          // Parse arrays
          const parseArray = (value: any): number[] | null => {
            if (!value || value === "") return null
            if (Array.isArray(value)) {
              return value.map(id => typeof id === 'string' ? parseInt(id, 10) : id).filter(id => !isNaN(id) && id > 0)
            }
            if (typeof value === 'string') {
              return value.split(",").map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id) && id > 0)
            }
            return null
          }

          // Validate so_cau_hoi
          let soCauHoi = record.so_cau_hoi
          if (typeof soCauHoi === 'string') {
            soCauHoi = parseInt(soCauHoi, 10)
          }
          if (!soCauHoi || soCauHoi <= 0) {
            soCauHoi = 10 // Default
          }

          // Validate so_phut_lam_bai
          let soPhutLamBai = record.so_phut_lam_bai
          if (typeof soPhutLamBai === 'string') {
            soPhutLamBai = parseInt(soPhutLamBai, 10)
          }
          if (!soPhutLamBai || soPhutLamBai <= 0) {
            soPhutLamBai = 15 // Default
          }

          const tenKyThi = String(record.ten_ky_thi).trim()
          const ngay = String(record.ngay).trim()
          const key = `${tenKyThi}|${ngay}`

          const sanitizedRecord: CreateKyThiInput = {
            ngay: ngay,
            ten_ky_thi: tenKyThi,
            trang_thai: record.trang_thai || "Mở",
            so_cau_hoi: soCauHoi,
            so_phut_lam_bai: soPhutLamBai,
            nhom_chuyen_de_ids: parseArray(record.nhom_chuyen_de_ids) || [],
            chuyen_de_ids: parseArray(record.chuyen_de_ids) || [],
            chuc_vu_ids: parseArray(record.chuc_vu_ids) || null,
            ghi_chu: record.ghi_chu ? String(record.ghi_chu).trim() : null,
            nguoi_tao_id: nguoiTaoId,
          }

          if (existingRecords.has(key)) {
            // Update existing record
            toUpdate.push({
              id: existingRecords.get(key)!,
              data: {
                ngay: sanitizedRecord.ngay,
                ten_ky_thi: sanitizedRecord.ten_ky_thi,
                trang_thai: sanitizedRecord.trang_thai,
                so_cau_hoi: sanitizedRecord.so_cau_hoi,
                so_phut_lam_bai: sanitizedRecord.so_phut_lam_bai,
                nhom_chuyen_de_ids: sanitizedRecord.nhom_chuyen_de_ids,
                chuyen_de_ids: sanitizedRecord.chuyen_de_ids,
                chuc_vu_ids: sanitizedRecord.chuc_vu_ids,
                ghi_chu: sanitizedRecord.ghi_chu,
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
      await queryClient.invalidateQueries({ queryKey: kyThiQueryKeys.all() })

      return { inserted, updated, errors }
    },
    onSuccess: (result) => {
      const total = result.inserted + result.updated
      if (total > 0) {
        toast.success(`Đã import ${total} kỳ thi thành công (${result.inserted} mới, ${result.updated} cập nhật)`)
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

