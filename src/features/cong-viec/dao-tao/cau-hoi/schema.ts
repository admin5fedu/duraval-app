import { z } from "zod"

/**
 * Schema matching 'dao_tao_cau_hoi' table in Supabase
 */
export const cauHoiSchema = z.object({
  id: z.number().optional(), // Auto-generated, optional for create
  chuyen_de_id: z.number().int().positive("Chuyên đề là bắt buộc"),
  cau_hoi: z.string().min(1, "Câu hỏi là bắt buộc"),
  hinh_anh: z.array(z.string()).optional().nullable(),
  dap_an_1: z.string().min(1, "Đáp án 1 là bắt buộc"),
  dap_an_2: z.string().min(1, "Đáp án 2 là bắt buộc"),
  dap_an_3: z.string().min(1, "Đáp án 3 là bắt buộc"),
  dap_an_4: z.string().min(1, "Đáp án 4 là bắt buộc"),
  dap_an_dung: z.number().int().min(1).max(4, "Đáp án đúng phải từ 1 đến 4"),
  nguoi_tao_id: z.number().int().positive("Người tạo là bắt buộc"),
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
  ten_chuyen_de: z.string().optional().nullable(), // Denormalized field for display
})

export type CauHoi = z.infer<typeof cauHoiSchema>

/**
 * Schema for creating new câu hỏi
 */
export type CreateCauHoiInput = Omit<CauHoi, "id" | "tg_tao" | "tg_cap_nhat" | "ten_chuyen_de">

/**
 * Schema for updating câu hỏi
 */
export type UpdateCauHoiInput = Partial<Omit<CauHoi, "id" | "tg_tao" | "nguoi_tao_id" | "ten_chuyen_de">>

