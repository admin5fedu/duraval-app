import { z } from "zod"

/**
 * Schema matching 'htbh_quy_htbh' table in Supabase
 */
export const quyHTBHTheoThangSchema = z.object({
  id: z.number(),
  nam: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const num = parseInt(val, 10)
        return isNaN(num) ? null : num
      }
      if (typeof val === 'number') {
        return isNaN(val) ? null : val
      }
      return null
    },
    z.number().min(2000, "Năm phải từ 2000 trở lên").max(2100, "Năm không được vượt quá 2100").nullable().optional()
  ),
  thang: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const num = parseInt(val, 10)
        return isNaN(num) ? null : num
      }
      if (typeof val === 'number') {
        return isNaN(val) ? null : val
      }
      return null
    },
    z.number().min(1, "Tháng phải từ 1 đến 12").max(12, "Tháng phải từ 1 đến 12").nullable().optional()
  ),
  nhan_vien_id: z.number().nullable().optional(),
  ten_nhan_vien: z.string().nullable().optional(),
  phong_id: z.number().nullable().optional(),
  ma_phong: z.string().nullable().optional(),
  nhom_id: z.number().nullable().optional(),
  ma_nhom: z.string().nullable().optional(),
  quy: z.string().nullable().optional(),
  so_tien_quy: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const cleaned = val.replace(/[,\s]/g, '')
        const num = parseFloat(cleaned)
        return isNaN(num) ? null : num
      }
      if (typeof val === 'number') {
        return isNaN(val) ? null : val
      }
      return null
    },
    z.number().min(0, "Số tiền quỹ phải >= 0").nullable().optional()
  ),
  da_dung: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const cleaned = val.replace(/[,\s]/g, '')
        const num = parseFloat(cleaned)
        return isNaN(num) ? null : num
      }
      if (typeof val === 'number') {
        return isNaN(val) ? null : val
      }
      return null
    },
    z.number().min(0, "Đã dùng phải >= 0").nullable().optional()
  ),
  con_du: z.number().nullable().optional(),
  ghi_chu: z.string().nullable().optional(),
  nguoi_tao_id: z.number().nullable().optional(),
  tg_tao: z.string().nullable().optional(),
  tg_cap_nhat: z.string().nullable().optional(),
})

export type QuyHTBHTheoThang = z.infer<typeof quyHTBHTheoThangSchema>

/**
 * Schema for creating new record
 */
export const createQuyHTBHTheoThangSchema = quyHTBHTheoThangSchema.omit({ 
  id: true, 
  tg_tao: true, 
  tg_cap_nhat: true 
}).extend({
  nam: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const num = parseInt(val, 10)
        return isNaN(num) ? null : num
      }
      if (typeof val === 'number') {
        return isNaN(val) ? null : val
      }
      return null
    },
    z.number({ invalid_type_error: "Năm phải là số" }).min(2000, "Năm phải từ 2000 trở lên").max(2100, "Năm không được vượt quá 2100")
  ),
  thang: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const num = parseInt(val, 10)
        return isNaN(num) ? null : num
      }
      if (typeof val === 'number') {
        return isNaN(val) ? null : val
      }
      return null
    },
    z.number({ invalid_type_error: "Tháng phải là số" }).min(1, "Tháng phải từ 1 đến 12").max(12, "Tháng phải từ 1 đến 12")
  ),
  nhan_vien_id: z.number({ invalid_type_error: "Nhân viên phải là số" }).nullable(),
  quy: z.string({ required_error: "Quỹ là bắt buộc" }).min(1, "Quỹ là bắt buộc"),
  so_tien_quy: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const cleaned = val.replace(/[,\s]/g, '')
        const num = parseFloat(cleaned)
        return isNaN(num) ? null : num
      }
      if (typeof val === 'number') {
        return isNaN(val) ? null : val
      }
      return null
    },
    z.number({ invalid_type_error: "Số tiền quỹ phải là số" }).min(0, "Số tiền quỹ phải >= 0")
  ),
})

export type CreateQuyHTBHTheoThangInput = z.infer<typeof createQuyHTBHTheoThangSchema>

/**
 * Schema for updating record
 */
export const updateQuyHTBHTheoThangSchema = quyHTBHTheoThangSchema.partial().omit({ 
  id: true,
  tg_tao: true 
})

export type UpdateQuyHTBHTheoThangInput = z.infer<typeof updateQuyHTBHTheoThangSchema>

/**
 * Batch operation result
 */
export interface BatchQuyHTBHTheoThangOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

