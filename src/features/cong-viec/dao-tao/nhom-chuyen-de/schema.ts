import { z } from "zod"

/**
 * Schema matching 'dao_tao_nhom_chuyen_de' table in Supabase
 */
export const nhomChuyenDeSchema = z.object({
  id: z.number().optional(), // Auto-generated, optional for create
  ten_nhom: z.string().min(1, "Tên nhóm là bắt buộc"),
  mo_ta: z.string().optional().nullable(),
  nguoi_tao_id: z.number().int().positive("Người tạo là bắt buộc"),
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
})

export type NhomChuyenDe = z.infer<typeof nhomChuyenDeSchema>

/**
 * Schema for creating new nhóm chuyên đề
 */
export type CreateNhomChuyenDeInput = Omit<NhomChuyenDe, "id" | "tg_tao" | "tg_cap_nhat">

/**
 * Schema for updating nhóm chuyên đề
 */
export type UpdateNhomChuyenDeInput = Partial<Omit<NhomChuyenDe, "id" | "tg_tao" | "nguoi_tao_id">>

