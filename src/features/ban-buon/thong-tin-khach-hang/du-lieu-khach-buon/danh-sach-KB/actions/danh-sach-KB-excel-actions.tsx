"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { DanhSachKB, CreateDanhSachKBInput } from "../schema"
import { danhSachKBQueryKeys } from "@/lib/react-query/query-keys"
import { useAuthStore } from "@/shared/stores/auth-store"

const TABLE_NAME = "bb_khach_buon"

/**
 * Batch operation result
 */
export interface BatchDanhSachKBOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

/**
 * Hook for batch insert (import) danh sách KB from Excel
 */
export function useBatchUpsertDanhSachKB() {
  const queryClient = useQueryClient()
  const { employee } = useAuthStore()

  return useMutation({
    mutationFn: async (records: Partial<DanhSachKB>[]): Promise<BatchDanhSachKBOperationResult> => {
      let inserted = 0
      const updated = 0
      const errors: BatchDanhSachKBOperationResult["errors"] = []

      // Process in batches of 1000
      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)

        // Validate and sanitize records
        const validRecords: CreateDanhSachKBInput[] = []
        
        batch.forEach((record, batchIndex) => {
          const originalIndex = i + batchIndex
          
          // Validate required fields
          if (!record.ten_khach_buon || !String(record.ten_khach_buon).trim()) {
            errors.push({
              row: originalIndex,
              error: "Tên khách buôn là bắt buộc",
            })
            return
          }

          if (!record.so_dien_thoai_1 || !String(record.so_dien_thoai_1).trim()) {
            errors.push({
              row: originalIndex,
              error: "Số điện thoại 1 là bắt buộc",
            })
            return
          }

          // Validate and parse giai_doan_id
          let giaiDoanId: number | undefined = undefined
          if (record.giai_doan_id !== null && record.giai_doan_id !== undefined) {
            const parsed = typeof record.giai_doan_id === 'string' ? parseFloat(record.giai_doan_id) : record.giai_doan_id
            if (isNaN(parsed) || parsed < 1) {
              errors.push({
                row: originalIndex,
                error: "Giai đoạn là bắt buộc và phải là số hợp lệ",
              })
              return
            }
            giaiDoanId = parsed
          } else {
            errors.push({
              row: originalIndex,
              error: "Giai đoạn là bắt buộc",
            })
            return
          }

          // Validate and parse trang_thai_id
          let trangThaiId: number | undefined = undefined
          if (record.trang_thai_id !== null && record.trang_thai_id !== undefined) {
            const parsed = typeof record.trang_thai_id === 'string' ? parseFloat(record.trang_thai_id) : record.trang_thai_id
            if (isNaN(parsed) || parsed < 1) {
              errors.push({
                row: originalIndex,
                error: "Trạng thái là bắt buộc và phải là số hợp lệ",
              })
              return
            }
            trangThaiId = parsed
          } else {
            errors.push({
              row: originalIndex,
              error: "Trạng thái là bắt buộc",
            })
            return
          }

          // Sanitize input
          const sanitizedRecord: CreateDanhSachKBInput = {
            ma_so: record.ma_so && String(record.ma_so).trim() !== "" ? String(record.ma_so).trim() : undefined,
            ten_khach_buon: String(record.ten_khach_buon || "").trim(),
            loai_khach: record.loai_khach && String(record.loai_khach).trim() !== "" ? String(record.loai_khach).trim() : "",
            nguon: record.nguon && String(record.nguon).trim() !== "" ? String(record.nguon).trim() : "",
            nam_thanh_lap: record.nam_thanh_lap ?? null,
            hinh_anh: record.hinh_anh && String(record.hinh_anh).trim() !== "" ? String(record.hinh_anh).trim() : null,
            so_dien_thoai_1: String(record.so_dien_thoai_1 || "").trim(),
            so_dien_thoai_2: record.so_dien_thoai_2 && String(record.so_dien_thoai_2).trim() !== "" ? String(record.so_dien_thoai_2).trim() : "",
            nhom_nganh: record.nhom_nganh && String(record.nhom_nganh).trim() !== "" ? String(record.nhom_nganh).trim() : "",
            link_group_zalo: record.link_group_zalo && String(record.link_group_zalo).trim() !== "" ? String(record.link_group_zalo).trim() : null,
            mien: record.mien && String(record.mien).trim() !== "" ? String(record.mien).trim() : null,
            tsn_tinh_thanh_id: record.tsn_tinh_thanh_id ?? null,
            tsn_quan_huyen_id: record.tsn_quan_huyen_id ?? null,
            tsn_phuong_xa_id: record.tsn_phuong_xa_id ?? null,
            tsn_so_nha: record.tsn_so_nha && String(record.tsn_so_nha).trim() !== "" ? String(record.tsn_so_nha).trim() : null,
            tsn_dia_chi_day_du: record.tsn_dia_chi_day_du && String(record.tsn_dia_chi_day_du).trim() !== "" ? String(record.tsn_dia_chi_day_du).trim() : null,
            ssn_tinh_thanh_id: record.ssn_tinh_thanh_id ?? null,
            ssn_phuong_xa_id: record.ssn_phuong_xa_id ?? null,
            ssn_so_nha: record.ssn_so_nha && String(record.ssn_so_nha).trim() !== "" ? String(record.ssn_so_nha).trim() : null,
            ssn_dia_chi_day_du: record.ssn_dia_chi_day_du && String(record.ssn_dia_chi_day_du).trim() !== "" ? String(record.ssn_dia_chi_day_du).trim() : null,
            dinh_vi_gps: record.dinh_vi_gps && String(record.dinh_vi_gps).trim() !== "" ? String(record.dinh_vi_gps).trim() : null,
            giai_doan_id: giaiDoanId,
            trang_thai_id: trangThaiId,
            tele_sale_id: record.tele_sale_id ?? null,
            thi_truong_id: record.thi_truong_id ?? null,
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
      queryClient.invalidateQueries({ queryKey: danhSachKBQueryKeys.all() })
      
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

