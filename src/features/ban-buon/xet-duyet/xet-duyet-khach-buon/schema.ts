import { z } from "zod"

/**
 * Base schema matching 'bb_xet_duyet_khach_buon' table in Supabase
 */
export const xetDuyetKhachBuonBaseSchema = z.object({
  id: z.number().optional(), // Auto-generated, optional for create
  ngay: z.string({ required_error: "Ngày là bắt buộc" }).min(1, "Ngày là bắt buộc"), // date
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
  tsn_tinh_thanh_id: z.preprocess(
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
  tsn_ten_tinh_thanh: z.string().optional().nullable(),
  ssn_tinh_thanh_id: z.preprocess(
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
  ssn_ten_tinh_thanh: z.string().optional().nullable(),
  muc_dang_ky_id: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return undefined
      if (typeof val === 'string') {
        const num = parseFloat(val)
        return isNaN(num) ? undefined : num
      }
      return typeof val === 'number' ? val : undefined
    },
    z.number({ required_error: "Mức đăng ký là bắt buộc", invalid_type_error: "Mức đăng ký phải là số" })
  ),
  ten_muc_dang_ky: z.string().optional().nullable(),
  doanh_so_min_quy: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return undefined
      if (typeof val === 'string') {
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
        const cleaned = val.replace(/[,\s]/g, '')
        const num = parseFloat(cleaned)
        return isNaN(num) ? undefined : num
      }
      return typeof val === 'number' ? val : undefined
    },
    z.number({ required_error: "Doanh số max năm là bắt buộc", invalid_type_error: "Doanh số max năm phải là số" })
  ),
  ngay_ap_dung: z.string({ required_error: "Ngày áp dụng là bắt buộc" }).min(1, "Ngày áp dụng là bắt buộc"), // date
  ghi_chu: z.string().optional().nullable(),
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
  tg_quan_ly_duyet: z.string().optional().nullable(), // timestamp with time zone
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
  tg_bgd_duyet: z.string().optional().nullable(), // timestamp with time zone
  trao_doi: z.any().optional().nullable(), // jsonb
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
  link_hop_dong: z.string().optional().nullable(),
  file_hop_dong: z.string().optional().nullable(),
  giai_doan_id: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return undefined
      if (typeof val === 'string') {
        const num = parseFloat(val)
        return isNaN(num) ? undefined : num
      }
      return typeof val === 'number' ? val : undefined
    },
    z.number({ required_error: "Giai đoạn là bắt buộc", invalid_type_error: "Giai đoạn phải là số" })
  ),
  ten_giai_doan: z.string().optional().nullable(),
  trang_thai_id: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return undefined
      if (typeof val === 'string') {
        const num = parseFloat(val)
        return isNaN(num) ? undefined : num
      }
      return typeof val === 'number' ? val : undefined
    },
    z.number({ required_error: "Trạng thái là bắt buộc", invalid_type_error: "Trạng thái phải là số" })
  ),
  ten_trang_thai: z.string().optional().nullable(),
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
  da_thuc_thi: z.boolean().optional().nullable(), // Đánh dấu đã thực thi cập nhật khách buôn
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
export const xetDuyetKhachBuonSchema = xetDuyetKhachBuonBaseSchema

export type XetDuyetKhachBuon = z.infer<typeof xetDuyetKhachBuonSchema>

/**
 * Schema for creating new xét duyệt khách buôn
 */
export type CreateXetDuyetKhachBuonInput = Omit<XetDuyetKhachBuon, "id" | "tg_tao" | "tg_cap_nhat" | "tg_quan_ly_duyet" | "tg_bgd_duyet"> & {
  nguoi_tao_id?: number | null
}

/**
 * Schema for updating xét duyệt khách buôn
 */
export type UpdateXetDuyetKhachBuonInput = Partial<Omit<XetDuyetKhachBuon, "id" | "tg_tao" | "nguoi_tao_id" | "tg_quan_ly_duyet" | "tg_bgd_duyet">>

