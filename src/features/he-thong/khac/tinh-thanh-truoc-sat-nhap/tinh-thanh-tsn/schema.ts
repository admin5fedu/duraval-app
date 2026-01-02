import { z } from "zod"

/**
 * Format rules for Miền
 * Chỉ chấp nhận: "Miền Bắc", "Miền Trung", "Miền Nam" (bắt buộc)
 */
const mienEnum = z.enum(["Miền Bắc", "Miền Trung", "Miền Nam"], {
  errorMap: () => ({ message: "Miền là bắt buộc và chỉ có thể là: Miền Bắc, Miền Trung hoặc Miền Nam" })
})

/**
 * Format rules for Vùng
 * Danh sách các vùng hợp lệ (bắt buộc)
 */
const vungEnum = z.enum([
  "Đồng bằng sông Hồng",
  "Trung du và miền núi phía Bắc",
  "Bắc Trung Bộ",
  "Duyên hải Nam Trung Bộ",
  "Tây Nguyên",
  "Đông Nam Bộ",
  "Đồng bằng sông Cửu Long"
], {
  errorMap: () => ({ message: "Vùng là bắt buộc và phải chọn một trong các vùng hợp lệ" })
})

/**
 * Schema matching 'var_tsn_tinh_thanh' table in Supabase
 */
export const tinhThanhTSNSchema = z.object({
  id: z.number().optional(), // Auto-generated, optional for create
  ma_tinh_thanh: z.string().min(1, "Mã tỉnh thành là bắt buộc"),
  ten_tinh_thanh: z.string().min(1, "Tên tỉnh thành là bắt buộc"),
  mien: mienEnum,
  vung: vungEnum,
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
})

export type TinhThanhTSN = z.infer<typeof tinhThanhTSNSchema>

/**
 * Schema for creating new tỉnh thành TSN
 */
export type CreateTinhThanhTSNInput = Omit<TinhThanhTSN, "id" | "tg_tao" | "tg_cap_nhat">

/**
 * Schema for updating tỉnh thành TSN
 */
export type UpdateTinhThanhTSNInput = Partial<Omit<TinhThanhTSN, "id" | "tg_tao">>

