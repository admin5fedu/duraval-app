import { z } from "zod"

/**
 * Base schema matching 'bb_dang_ky_doanh_so' table in Supabase
 */
export const dangKyDoanhSoBaseSchema = z.object({
  id: z.number().optional(), // Auto-generated, optional for create
  nam: z.preprocess(
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
    z.number({ required_error: "Năm là bắt buộc", invalid_type_error: "Năm phải là số" })
  ),
  khach_buon_id: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const num = parseFloat(val)
        return isNaN(num) ? null : num
      }
      return typeof val === 'number' ? val : null
    },
    z.number({ required_error: "Khách buôn là bắt buộc", invalid_type_error: "Khách buôn phải là số" })
  ),
  ten_khach_buon: z.string().optional().nullable(),
  muc_dang_ky_id: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const num = parseFloat(val)
        return isNaN(num) ? null : num
      }
      return typeof val === 'number' ? val : null
    },
    z.number({ required_error: "Mức đăng ký là bắt buộc", invalid_type_error: "Mức đăng ký phải là số" })
  ),
  ten_muc_dang_ky: z.string().optional().nullable(),
  ghi_chu: z.string().optional().nullable(),
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
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
  doanh_so_min_quy: z.preprocess(
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
    z.number({ required_error: "Doanh số min quý là bắt buộc", invalid_type_error: "Doanh số min quý phải là số" })
  ),
  doanh_so_max_quy: z.preprocess(
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
    z.number({ required_error: "Doanh số max quý là bắt buộc", invalid_type_error: "Doanh số max quý phải là số" })
  ),
  doanh_so_min_nam: z.preprocess(
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
    z.number({ required_error: "Doanh số min năm là bắt buộc", invalid_type_error: "Doanh số min năm phải là số" })
  ),
  doanh_so_max_nam: z.preprocess(
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
    z.number({ required_error: "Doanh số max năm là bắt buộc", invalid_type_error: "Doanh số max năm phải là số" })
  ),
  link_hop_dong: z.string().optional().nullable(),
  file_hop_dong: z.string().optional().nullable(),
  // Enriched fields from related tables (optional, not in DB)
  ten_nguoi_tao: z.string().optional().nullable(), // Format: "mã - tên" or just "tên"
  ma_nguoi_tao: z.number().optional().nullable(), // For display
})

/**
 * Schema with validation rules
 */
export const dangKyDoanhSoSchema = dangKyDoanhSoBaseSchema

export type DangKyDoanhSo = z.infer<typeof dangKyDoanhSoSchema>

/**
 * Schema for creating new đăng ký doanh số
 */
export type CreateDangKyDoanhSoInput = Omit<DangKyDoanhSo, "id" | "tg_tao" | "tg_cap_nhat"> & {
  nguoi_tao_id?: number | null
}

/**
 * Schema for updating đăng ký doanh số
 */
export type UpdateDangKyDoanhSoInput = Partial<Omit<DangKyDoanhSo, "id" | "tg_tao" | "nguoi_tao_id">>

