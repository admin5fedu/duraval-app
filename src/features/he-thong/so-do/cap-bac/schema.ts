import { z } from "zod"

/**
 * Schema matching 'var_cap_bac' table in Supabase
 */
export const capBacSchema = z.object({
    id: z.number().optional(), // Auto-generated, optional for create
    ma_cap_bac: z.string().min(1, "Mã cấp bậc là bắt buộc"),
    ten_cap_bac: z.string().min(1, "Tên cấp bậc là bắt buộc"),
    bac: z.number().int().min(1, "Bậc phải là số nguyên dương"),
    nguoi_tao: z.number().optional().nullable(),
    tg_tao: z.string().optional().nullable(),
    tg_cap_nhat: z.string().optional().nullable(),
})

export type CapBac = z.infer<typeof capBacSchema>

/**
 * Schema for creating new cấp bậc
 */
export type CreateCapBacInput = Omit<CapBac, "id" | "tg_tao" | "tg_cap_nhat" | "nguoi_tao">

/**
 * Schema for updating cấp bậc
 */
export type UpdateCapBacInput = Partial<Omit<CapBac, "id" | "tg_tao" | "nguoi_tao">>

