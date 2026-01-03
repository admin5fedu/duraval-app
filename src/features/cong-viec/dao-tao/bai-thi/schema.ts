import { z } from "zod"

/**
 * Schema matching 'dao_tao_bai_thi' table in Supabase
 */
export const baiThiSchema = z.object({
  id: z.number().optional(), // Auto-generated, optional for create
  ky_thi_id: z.coerce.number().int().positive("Kỳ thi là bắt buộc"), // bigint (int8) in Supabase
  nhan_vien_id: z.number().int().positive("Nhân viên là bắt buộc"),
  ngay_lam_bai: z.string().min(1, "Ngày làm bài là bắt buộc"), // Date as string (YYYY-MM-DD)
  thoi_gian_bat_dau: z.string().optional().nullable(), // timestamp with time zone
  thoi_gian_ket_thuc: z.string().optional().nullable(), // timestamp with time zone
  diem_so: z.number().int().min(0).default(0).optional().nullable(),
  tong_so_cau: z.number().int().min(0).default(0).optional().nullable(),
  trang_thai: z.string().min(1, "Trạng thái là bắt buộc").default("Chưa thi"),
  phong_id: z.number().int().positive().optional().nullable(),
  nhom_id: z.number().int().positive().optional().nullable(),
  chi_tiet_bai_lam: z.any().optional().nullable(), // jsonb
  trao_doi: z.any().optional().nullable(), // jsonb
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
})

export type BaiThi = z.infer<typeof baiThiSchema>

/**
 * Schema for creating new bài thi
 */
export type CreateBaiThiInput = Omit<BaiThi, "id" | "tg_tao" | "tg_cap_nhat">

/**
 * Schema for updating bài thi
 */
export type UpdateBaiThiInput = Partial<Omit<BaiThi, "id" | "tg_tao">>

