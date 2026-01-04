import { z } from "zod"

/**
 * Base schema matching 'bb_hinh_anh' table in Supabase
 */
export const hinhAnhKhachBuonBaseSchema = z.object({
  id: z.number().optional(), // Auto-generated, optional for create
  khach_buon_id: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const num = parseFloat(val)
        return isNaN(num) ? null : num
      }
      return typeof val === 'number' ? val : null
    },
    z.number({ required_error: "Khách buôn là bắt buộc", invalid_type_error: "Khách buôn phải là số" }).min(1, "Khách buôn là bắt buộc")
  ),
  ten_khach_buon: z.string().optional().nullable(), // Joined from bb_khach_buon
  hang_muc: z.string().min(1, "Hạng mục là bắt buộc"),
  hinh_anh: z.string().min(1, "Hình ảnh là bắt buộc"),
  mo_ta: z.string().optional().nullable(),
  ghi_chu: z.string().optional().nullable(),
  nguoi_tao_id: z.number().optional().nullable(),
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
})

/**
 * Schema with validation rules
 */
export const hinhAnhKhachBuonSchema = hinhAnhKhachBuonBaseSchema

export type HinhAnhKhachBuon = z.infer<typeof hinhAnhKhachBuonSchema>

/**
 * Schema for creating new hình ảnh khách buôn
 */
export type CreateHinhAnhKhachBuonInput = Omit<HinhAnhKhachBuon, "id" | "tg_tao" | "tg_cap_nhat" | "ten_khach_buon"> & {
  nguoi_tao_id?: number | null
}

/**
 * Schema for updating hình ảnh khách buôn
 */
export type UpdateHinhAnhKhachBuonInput = Partial<Omit<HinhAnhKhachBuon, "id" | "tg_tao" | "nguoi_tao_id" | "ten_khach_buon">>

