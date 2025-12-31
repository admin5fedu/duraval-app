"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { TaiLieuBieuMau } from "../schema"
import type { BatchTaiLieuBieuMauOperationResult } from "../types"
import { taiLieuBieuMauQueryKeys } from "@/lib/react-query/query-keys"
import { useAuthStore } from "@/shared/stores/auth-store"
import { DanhMucTaiLieuAPI } from "@/features/cong-viec/tai-lieu/danh-muc-tai-lieu/services/danh-muc-tai-lieu.api"
import { LoaiTaiLieuAPI } from "@/features/cong-viec/tai-lieu/loai-tai-lieu/services/loai-tai-lieu.api"

const TABLE_NAME = "tai_lieu_ds_tai_lieu_bieu_mau"

/**
 * Hook for batch upsert (import) tài liệu & biểu mẫu from Excel
 * Logic: Check by combination of ma_tai_lieu (if exists) or ten_tai_lieu
 */
export function useBatchUpsertTaiLieuBieuMau() {
  const queryClient = useQueryClient()
  const { employee } = useAuthStore()

  return useMutation({
    mutationFn: async (records: Partial<TaiLieuBieuMau>[]): Promise<BatchTaiLieuBieuMauOperationResult> => {
      let inserted = 0
      let updated = 0
      const errors: BatchTaiLieuBieuMauOperationResult["errors"] = []

      // Get current user's ma_nhan_vien for nguoi_tao_id
      const nguoiTaoId = employee?.ma_nhan_vien
      if (!nguoiTaoId) {
        throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.")
      }

      // Get danh muc tai lieu list to map danh_muc_id to ten_danh_muc
      const danhMucTaiLieuList = await DanhMucTaiLieuAPI.getAll()
      const danhMucMap = new Map<number, string>()
      danhMucTaiLieuList.forEach(dm => {
        if (dm.id && dm.ten_danh_muc) {
          danhMucMap.set(dm.id, dm.ten_danh_muc)
        }
      })

      // Get loai tai lieu list to map loai_id to ten_loai
      const loaiTaiLieuList = await LoaiTaiLieuAPI.getAll()
      const loaiMap = new Map<number, string>()
      loaiTaiLieuList.forEach(loai => {
        if (loai.id && loai.loai) {
          loaiMap.set(loai.id, loai.loai)
        }
      })

      // Process in batches of 1000
      const BATCH_SIZE = 1000
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)
        
        // Get all existing records to check for duplicates
        // We'll match by ma_tai_lieu if exists, otherwise by ten_tai_lieu
        const { data: existingRecords } = await supabase
          .from(TABLE_NAME)
          .select("id, ma_tai_lieu, ten_tai_lieu")

        // Create maps for matching
        const existingByMaTaiLieu = new Map<string, number>()
        const existingByTenTaiLieu = new Map<string, number>()
        
        existingRecords?.forEach(record => {
          if (record.ma_tai_lieu) {
            existingByMaTaiLieu.set(String(record.ma_tai_lieu).trim().toLowerCase(), record.id)
          }
          if (record.ten_tai_lieu) {
            existingByTenTaiLieu.set(String(record.ten_tai_lieu).trim().toLowerCase(), record.id)
          }
        })

        // Separate into inserts and updates
        const toInsert: Array<{ record: Partial<TaiLieuBieuMau>; originalIndex: number }> = []
        const toUpdate: Array<{
          id: number
          data: Partial<TaiLieuBieuMau>
          originalIndex: number
        }> = []

        batch.forEach((record, index) => {
          const originalIndex = index + i

          // Validate hang_muc if provided
          if (record.hang_muc) {
            const hangMuc = String(record.hang_muc).trim()
            if (hangMuc !== "Biểu mẫu & Kế hoạch" && hangMuc !== "Văn bản hệ thống" && hangMuc !== "") {
              errors.push({
                row: originalIndex,
                error: "Hạng mục phải là 'Biểu mẫu & Kế hoạch' hoặc 'Văn bản hệ thống'",
              })
              return
            }
          }

          // Validate loai_id if provided
          if (record.loai_id !== undefined && record.loai_id !== null) {
            const loaiId = Number(record.loai_id)
            if (isNaN(loaiId) || loaiId < 1) {
              errors.push({
                row: originalIndex,
                error: "Loại ID phải là số nguyên dương",
              })
              return
            }
          }

          // Validate danh_muc_id if provided
          if (record.danh_muc_id !== undefined && record.danh_muc_id !== null) {
            const danhMucId = Number(record.danh_muc_id)
            if (isNaN(danhMucId) || danhMucId < 1) {
              errors.push({
                row: originalIndex,
                error: "Danh mục ID phải là số nguyên dương",
              })
              return
            }
          }

          // ten_tai_lieu is required
          const tenTaiLieu = record.ten_tai_lieu ? String(record.ten_tai_lieu).trim() : ""
          
          if (!tenTaiLieu) {
              errors.push({
                  row: originalIndex,
                  error: "Tên tài liệu là bắt buộc",
              })
              return
          }

          // Find existing record: use ten_tai_lieu for identification
          const existingId = existingByTenTaiLieu.get(tenTaiLieu.toLowerCase())

          if (existingId) {
            // Update existing
            const updateData: Partial<TaiLieuBieuMau> = {}
            if (record.hang_muc !== undefined) updateData.hang_muc = record.hang_muc || undefined
            if (record.loai_id !== undefined) {
              const loaiId = record.loai_id ? Number(record.loai_id) : undefined
              updateData.loai_id = loaiId
              // Auto-set ten_loai from loai_id
              updateData.ten_loai = loaiId ? (loaiMap.get(loaiId) || null) : null
            }
            if (record.danh_muc_id !== undefined) {
              const danhMucId = record.danh_muc_id ? Number(record.danh_muc_id) : undefined
              updateData.danh_muc_id = danhMucId
              // Auto-set ten_danh_muc from danh_muc_id
              updateData.ten_danh_muc = danhMucId ? (danhMucMap.get(danhMucId) || null) : null
            }
            if (record.danh_muc_cha_id !== undefined) updateData.danh_muc_cha_id = record.danh_muc_cha_id ? Number(record.danh_muc_cha_id) : null
            if (record.ten_danh_muc_cha !== undefined) updateData.ten_danh_muc_cha = record.ten_danh_muc_cha || null
            if (record.ma_tai_lieu !== undefined) updateData.ma_tai_lieu = record.ma_tai_lieu || null
            if (record.ten_tai_lieu !== undefined) updateData.ten_tai_lieu = record.ten_tai_lieu || null
            if (record.mo_ta !== undefined) updateData.mo_ta = record.mo_ta || null
            if (record.link_du_thao !== undefined) updateData.link_du_thao = record.link_du_thao || null
            if (record.link_ap_dung !== undefined) updateData.link_ap_dung = record.link_ap_dung || null
            if (record.ghi_chu !== undefined) updateData.ghi_chu = record.ghi_chu || null
            if (record.trang_thai !== undefined) updateData.trang_thai = record.trang_thai || undefined
            if (record.phan_phoi_pb_id !== undefined) updateData.phan_phoi_pb_id = record.phan_phoi_pb_id ? Number(record.phan_phoi_pb_id) : null
            if (record.tai_lieu_cha_id !== undefined) updateData.tai_lieu_cha_id = record.tai_lieu_cha_id ? Number(record.tai_lieu_cha_id) : null
            
            toUpdate.push({
              id: existingId,
              data: updateData,
              originalIndex,
            })
          } else {
            // Insert new
            toInsert.push({
              record: {
                hang_muc: record.hang_muc || undefined,
                loai_id: record.loai_id ? Number(record.loai_id) : undefined,
                ten_loai: record.loai_id ? (loaiMap.get(Number(record.loai_id)) || null) : null,
                danh_muc_id: record.danh_muc_id ? Number(record.danh_muc_id) : undefined,
                ten_danh_muc: record.danh_muc_id ? (danhMucMap.get(Number(record.danh_muc_id)) || null) : null,
                danh_muc_cha_id: record.danh_muc_cha_id ? Number(record.danh_muc_cha_id) : null,
                ten_danh_muc_cha: record.ten_danh_muc_cha || null,
                ma_tai_lieu: record.ma_tai_lieu || null,
                ten_tai_lieu: tenTaiLieu,
                mo_ta: record.mo_ta || null,
                link_du_thao: record.link_du_thao || null,
                link_ap_dung: record.link_ap_dung || null,
                ghi_chu: record.ghi_chu || null,
                trang_thai: record.trang_thai || undefined,
                phan_phoi_pb_id: record.phan_phoi_pb_id ? Number(record.phan_phoi_pb_id) : null,
                tai_lieu_cha_id: record.tai_lieu_cha_id ? Number(record.tai_lieu_cha_id) : null,
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
      queryClient.invalidateQueries({ queryKey: taiLieuBieuMauQueryKeys.all() })
      
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

