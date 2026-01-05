"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ChamSocKhachBuonAPI } from "../services/cham-soc-khach-buon.api"
import type { CreateChamSocKhachBuonInput } from "../schema"
import { chamSocKhachBuonQueryKeys } from "../hooks/use-cham-soc-khach-buon"

const BATCH_SIZE = 100

export interface BatchChamSocKhachBuonOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

/**
 * Hook for batch upserting chăm sóc khách buôn from Excel
 */
export function useBatchUpsertChamSocKhachBuon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (records: Partial<CreateChamSocKhachBuonInput>[]): Promise<BatchChamSocKhachBuonOperationResult> => {
      let inserted = 0
      let updated = 0
      const errors: Array<{ row: number; error: string }> = []

      // Process in batches
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)

        for (let j = 0; j < batch.length; j++) {
          const record = batch[j]
          const rowNumber = i + j + 1 // 1-based row number

          try {
            // Prepare create input
            const createInput: CreateChamSocKhachBuonInput = {
              ngay: record.ngay || null,
              nhan_vien_id: record.nhan_vien_id ?? null,
              khach_buon_id: record.khach_buon_id ?? null,
              hinh_thuc: record.hinh_thuc || "",
              muc_tieu: record.muc_tieu || "",
              ket_qua: record.ket_qua || "",
              hanh_dong_tiep_theo: record.hanh_dong_tiep_theo || null,
              hen_cs_lai: record.hen_cs_lai || null,
              gps: record.gps || null,
              hinh_anh: record.hinh_anh || null,
              nguoi_tao_id: record.nguoi_tao_id ?? null,
            }

            await ChamSocKhachBuonAPI.create(createInput)
            inserted++
          } catch (error: any) {
            errors.push({
              row: rowNumber,
              error: error.message || "Lỗi không xác định",
            })
          }
        }
      }

      return { inserted, updated, errors }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: chamSocKhachBuonQueryKeys.all() })

      if (result.errors.length > 0) {
        toast.warning(
          `Nhập dữ liệu hoàn tất: ${result.inserted} thêm mới, ${result.updated} cập nhật, ${result.errors.length} lỗi`
        )
      } else {
        toast.success(`Nhập dữ liệu thành công: ${result.inserted} thêm mới, ${result.updated} cập nhật`)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Có lỗi xảy ra khi nhập dữ liệu")
    },
  })
}

