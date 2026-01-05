import { z } from "zod"

/**
 * Base schema matching 'bb_lich_su_cham_soc' table in Supabase
 */
export const chamSocKhachBuonBaseSchema = z.object({
  id: z.number().optional(), // Auto-generated, optional for create
  ngay: z.string().optional().nullable(),
  nhan_vien_id: z.preprocess(
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
  khach_buon_id: z.preprocess(
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
        hinh_thuc: z.string().min(1, "Hình thức là bắt buộc"),
        muc_tieu: z.string().min(1, "Mục tiêu là bắt buộc"),
        ket_qua: z.string().min(1, "Kết quả là bắt buộc"),
  hanh_dong_tiep_theo: z.string().optional().nullable(),
  hen_cs_lai: z.string().optional().nullable(),
  gps: z.string().optional().nullable(),
  hinh_anh: z.string().optional().nullable(),
  nguoi_tao_id: z.number().optional().nullable(),
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
  // Enriched fields from related tables (optional, not in DB)
  ten_nhan_vien: z.string().optional().nullable(), // Format: "mã - tên" or just "tên"
  ma_nhan_vien: z.number().optional().nullable(), // For display
  ten_khach_buon: z.string().optional().nullable(),
  ten_nguoi_tao: z.string().optional().nullable(), // Format: "mã - tên" or just "tên"
  ma_nguoi_tao: z.number().optional().nullable(), // For display
})

/**
 * Schema with validation rules
 */
export const chamSocKhachBuonSchema = chamSocKhachBuonBaseSchema

export type ChamSocKhachBuon = z.infer<typeof chamSocKhachBuonSchema>

/**
 * Schema for creating new chăm sóc khách buôn
 */
export type CreateChamSocKhachBuonInput = Omit<ChamSocKhachBuon, "id" | "tg_tao" | "tg_cap_nhat"> & {
  nguoi_tao_id?: number | null
}

/**
 * Schema for updating chăm sóc khách buôn
 */
export type UpdateChamSocKhachBuonInput = Partial<Omit<ChamSocKhachBuon, "id" | "tg_tao" | "nguoi_tao_id">>

