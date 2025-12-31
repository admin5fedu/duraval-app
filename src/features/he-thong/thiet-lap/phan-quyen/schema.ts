import { z } from "zod"

/**
 * Schema for quyen (permissions) JSONB field
 */
export const quyenSchema = z.object({
  xem: z.boolean().default(false),
  them: z.boolean().default(false),
  sua: z.boolean().default(false),
  xoa: z.boolean().default(false),
  import: z.boolean().default(false),
  export: z.boolean().default(false),
  quan_tri: z.boolean().default(false),
}).default({
  xem: false,
  them: false,
  sua: false,
  xoa: false,
  import: false,
  export: false,
  quan_tri: false,
})

export type Quyen = z.infer<typeof quyenSchema>

/**
 * Schema matching 'var_chia_quyen' table in Supabase
 */
export const phanQuyenSchema = z.object({
  id: z.number().optional(),
  chuc_vu_id: z.number().nullable().optional(),
  module_id: z.string().nullable().optional(),
  quyen: quyenSchema.nullable().optional(),
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
  nguoi_tao_id: z.number().nullable().optional(),
})

export type PhanQuyen = z.infer<typeof phanQuyenSchema>

/**
 * Schema for creating new phân quyền
 */
export type CreatePhanQuyenInput = Omit<PhanQuyen, "id" | "tg_tao" | "tg_cap_nhat" | "nguoi_tao_id">

/**
 * Schema for updating phân quyền
 */
export type UpdatePhanQuyenInput = Partial<Omit<PhanQuyen, "id" | "tg_tao" | "nguoi_tao_id">>

