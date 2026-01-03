import { z } from "zod"

/**
 * Schema matching 'dao_tao_chuyen_de' table in Supabase
 */
export const chuyenDeSchema = z.object({
  id: z.number().optional(), // Auto-generated, optional for create
  nhom_chuyen_de_id: z.number().int().positive("Nhóm chuyên đề là bắt buộc"),
  ten_chuyen_de: z.string().min(1, "Tên chuyên đề là bắt buộc"),
  mo_ta: z.string().optional().nullable(),
  nguoi_tao_id: z.number().int().positive("Người tạo là bắt buộc"),
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
  ten_nhom_chuyen_de: z.string().optional().nullable(), // Denormalized field for display
})

export type ChuyenDe = z.infer<typeof chuyenDeSchema>

/**
 * Schema for creating new chuyên đề
 */
export type CreateChuyenDeInput = Omit<ChuyenDe, "id" | "tg_tao" | "tg_cap_nhat" | "ten_nhom_chuyen_de">

/**
 * Schema for updating chuyên đề
 */
export type UpdateChuyenDeInput = Partial<Omit<ChuyenDe, "id" | "tg_tao" | "nguoi_tao_id" | "ten_nhom_chuyen_de">>

