import { z } from "zod"

/**
 * Base schema matching 'bb_xet_duyet_cong_no' table in Supabase
 */
export const xetDuyetCongNoBaseSchema = z.object({
  id: z.number().optional(), // Auto-generated, optional for create
  khach_buon_id: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return undefined
      if (typeof val === 'string') {
        const num = parseFloat(val)
        return isNaN(num) ? undefined : num
      }
      return typeof val === 'number' ? val : undefined
    },
    z.number({ required_error: "Khách buôn là bắt buộc", invalid_type_error: "Khách buôn phải là số" })
  ),
  ten_khach_buon: z.string().optional().nullable(),
  loai_hinh: z.string({ required_error: "Loại hình là bắt buộc" }).min(1, "Loại hình là bắt buộc"),
  muc_cong_no: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return undefined
      if (typeof val === 'string') {
        // Remove commas (thousand separators) and spaces
        const cleaned = val.replace(/[,\s]/g, '')
        const num = parseFloat(cleaned)
        return isNaN(num) ? undefined : num
      }
      return typeof val === 'number' ? val : undefined
    },
    z.number({ required_error: "Mức công nợ là bắt buộc", invalid_type_error: "Mức công nợ phải là số" })
  ),
  de_xuat_ngay_ap_dung: z.string({ required_error: "Đề xuất ngày áp dụng là bắt buộc" }).min(1, "Đề xuất ngày áp dụng là bắt buộc"), // date
  ghi_chu: z.string().optional().nullable(),
  ngay_ap_dung: z.string().optional().nullable(), // date
  trang_thai: z.string().optional().nullable(),
  quan_ly_duyet: z.string().optional().nullable(),
  quan_ly_id: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const num = parseFloat(val)
        return isNaN(num) ? null : num
      }
      return typeof val === 'number' ? val : null
    },
    z.number().nullable().optional()
  ),
  bgd_duyet: z.string().optional().nullable(),
  bgd_id: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const num = parseFloat(val)
        return isNaN(num) ? null : num
      }
      return typeof val === 'number' ? val : null
    },
    z.number().nullable().optional()
  ),
  tg_quan_ly_duyet: z.string().optional().nullable(), // timestamp with time zone
  tg_bgd_duyet: z.string().optional().nullable(), // timestamp with time zone
  trao_doi: z.any().optional().nullable(), // jsonb
  audit_log: z.any().optional().nullable(), // jsonb - lưu lịch sử duyệt
  nguoi_huy_id: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const num = parseFloat(val)
        return isNaN(num) ? null : num
      }
      return typeof val === 'number' ? val : null
    },
    z.number().nullable().optional()
  ),
  nguoi_tao_id: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const num = parseFloat(val)
        return isNaN(num) ? null : num
      }
      return typeof val === 'number' ? val : null
    },
    z.number().nullable().optional()
  ),
  tg_tao: z.string().optional().nullable(), // timestamp with time zone
  tg_cap_nhat: z.string().optional().nullable(), // timestamp without time zone
  // Enriched fields from related tables (optional, not in DB)
  ten_nguoi_tao: z.string().optional().nullable(), // Format: "mã - tên" or just "tên"
  ma_nguoi_tao: z.number().optional().nullable(), // For display
  ten_quan_ly: z.string().optional().nullable(),
  ten_bgd: z.string().optional().nullable(),
  ten_nguoi_huy: z.string().optional().nullable(), // Enriched from var_nhan_su
})

/**
 * Schema with validation rules
 */
export const xetDuyetCongNoSchema = xetDuyetCongNoBaseSchema

export type XetDuyetCongNo = z.infer<typeof xetDuyetCongNoSchema>

/**
 * Schema for creating new xét duyệt công nợ
 */
export type CreateXetDuyetCongNoInput = Omit<XetDuyetCongNo, "id" | "tg_tao" | "tg_cap_nhat" | "tg_quan_ly_duyet" | "tg_bgd_duyet"> & {
  nguoi_tao_id?: number | null
}

/**
 * Schema for updating xét duyệt công nợ
 */
export type UpdateXetDuyetCongNoInput = Partial<Omit<XetDuyetCongNo, "id" | "tg_tao" | "nguoi_tao_id" | "tg_quan_ly_duyet" | "tg_bgd_duyet">>

