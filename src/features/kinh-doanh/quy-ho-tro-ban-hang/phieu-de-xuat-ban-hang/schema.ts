import { z } from "zod"

/**
 * Schema matching 'htbh_de_xuat_chiet_khau' table in Supabase
 */
export const phieuDeXuatBanHangSchema = z.object({
  id: z.number(),
  ngay: z.string().min(1, "Ngày là bắt buộc"),
  nhan_vien_id: z.number().nullable().optional(),
  ten_nhan_vien: z.string().nullable().optional(),
  nhom_id: z.number().nullable().optional(),
  ma_nhom: z.string().nullable().optional(),
  ten_nhom: z.string().nullable().optional(),
  phong_id: z.number().nullable().optional(),
  ma_phong: z.string().nullable().optional(),
  ten_phong_ban: z.string().nullable().optional(),
  loai_phieu_id: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const num = parseInt(val, 10)
        return isNaN(num) ? null : num
      }
      return typeof val === 'number' ? val : null
    },
    z.number().nullable().optional()
  ),
  ten_loai_phieu: z.string().nullable().optional(),
  hang_muc_id: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const num = parseInt(val, 10)
        return isNaN(num) ? null : num
      }
      return typeof val === 'number' ? val : null
    },
    z.number().nullable().optional()
  ),
  ten_hang_muc: z.string().nullable().optional(),
  mo_ta: z.string().min(1, "Mô tả là bắt buộc"),
  so_hoa_don: z.string().nullable().optional(),
  tien_don_hang: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const cleaned = val.replace(/[,\s]/g, '')
        const num = parseFloat(cleaned)
        return isNaN(num) ? null : num
      }
      return typeof val === 'number' ? val : null
    },
    z.number().nullable().optional()
  ),
  tong_ck: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const cleaned = val.replace(/[,\s]/g, '')
        const num = parseFloat(cleaned)
        return isNaN(num) ? null : num
      }
      return typeof val === 'number' ? val : null
    },
    z.number().nullable().optional()
  ),
  ty_le: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const cleaned = val.replace(/[,\s]/g, '')
        const num = parseFloat(cleaned)
        return isNaN(num) ? null : num
      }
      return typeof val === 'number' ? val : null
    },
    z.number().nullable().optional()
  ),
  nguoi_nhan_quy_id: z.number().nullable().optional(),
  ten_nguoi_nhan_quy: z.string().nullable().optional(),
  hinh_anh: z.string().nullable().optional(),
  trang_thai: z.string().nullable().optional(),
  quan_ly_duyet: z.string().nullable().optional(),
  quan_ly_id: z.number().nullable().optional(),
  tg_quan_ly_duyet: z.string().nullable().optional(),
  bgd_duyet: z.string().nullable().optional(),
  bgd_id: z.number().nullable().optional(),
  tg_bgd_duyet: z.string().nullable().optional(),
  loai_doanh_thu_id: z.number().nullable().optional(),
  ten_loai_doanh_thu: z.string().nullable().optional(),
  trang_thai_chi_tien: z.string().nullable().optional(),
  ma_com_bo: z.string().nullable().optional(),
  trao_doi: z.any().nullable().optional(), // jsonb
  nguoi_tao_id: z.number().nullable().optional(),
  tg_tao: z.string().nullable().optional(),
  tg_cap_nhat: z.string().nullable().optional(),
})

export type PhieuDeXuatBanHang = z.infer<typeof phieuDeXuatBanHangSchema>

/**
 * Schema for creating new record
 */
export const createPhieuDeXuatBanHangSchema = phieuDeXuatBanHangSchema.omit({ 
  id: true, 
  tg_tao: true, 
  tg_cap_nhat: true 
})

export type CreatePhieuDeXuatBanHangInput = z.infer<typeof createPhieuDeXuatBanHangSchema>

/**
 * Schema for updating record
 */
export const updatePhieuDeXuatBanHangSchema = phieuDeXuatBanHangSchema.partial().omit({ 
  id: true,
  tg_tao: true 
})

export type UpdatePhieuDeXuatBanHangInput = z.infer<typeof updatePhieuDeXuatBanHangSchema>

/**
 * Batch operation result
 */
export interface BatchPhieuDeXuatBanHangOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

