import { z } from "zod"

/**
 * Schema matching 'dao_tao_ky_thi' table in Supabase
 */
export const kyThiSchema = z.object({
  id: z.number().optional(), // Auto-generated, optional for create
  ngay: z.string().min(1, "Ngày là bắt buộc"), // Date as string (YYYY-MM-DD)
  ten_ky_thi: z.string().min(1, "Tên kỳ thi là bắt buộc"),
  nhom_chuyen_de_ids: z.array(z.number().int().positive()).min(1, "Phải chọn ít nhất một nhóm chuyên đề"),
  chuyen_de_ids: z.array(z.number().int().positive()).min(1, "Phải chọn ít nhất một chuyên đề"),
  chuc_vu_ids: z.array(z.number().int().positive()).optional().nullable(),
  so_cau_hoi: z.number().int().positive("Số câu hỏi phải là số dương").default(10),
  so_phut_lam_bai: z.number().int().positive("Số phút làm bài phải là số dương").default(15),
  ghi_chu: z.string().optional().nullable(),
  trang_thai: z.string().min(1, "Trạng thái là bắt buộc").default("Mở"),
  nguoi_tao_id: z.coerce.number().int().positive("Người tạo là bắt buộc"), // int8 (bigint) in Supabase
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
})

export type KyThi = z.infer<typeof kyThiSchema>

/**
 * Schema for creating new kỳ thi
 */
export type CreateKyThiInput = Omit<KyThi, "id" | "tg_tao" | "tg_cap_nhat">

/**
 * Schema for updating kỳ thi
 */
export type UpdateKyThiInput = Partial<Omit<KyThi, "id" | "tg_tao" | "nguoi_tao_id">>

