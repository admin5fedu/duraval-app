import { z } from "zod"

/**
 * Schema matching 'bb_trang_thai' table in Supabase
 */
export const trangThaiKhachBuonSchema = z.object({
  id: z.number().optional(), // Auto-generated, optional for create
  ma_trang_thai: z.string().min(1, "Mã trạng thái là bắt buộc"),
  ten_trang_thai: z.string().min(1, "Tên trạng thái là bắt buộc"),
  tt: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const num = parseFloat(val)
        return isNaN(num) ? null : num
      }
      return typeof val === 'number' ? val : null
    },
    z.number({ required_error: "Thứ tự là bắt buộc", invalid_type_error: "Thứ tự phải là số" }).min(1, "Thứ tự phải lớn hơn 0")
  ),
  mo_ta: z.string().optional().nullable(),
  nguoi_tao_id: z.number().optional().nullable(),
  nguoi_tao_ten: z.string().optional().nullable(), // Joined from var_nhan_su
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
  mac_dinh_khoi_dau: z.enum(["YES", "NO"], { required_error: "Mặc định khởi đầu là bắt buộc" }),
  giai_doan_id: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const num = parseFloat(val)
        return isNaN(num) ? null : num
      }
      return typeof val === 'number' ? val : null
    },
    z.number({ required_error: "Giai đoạn là bắt buộc", invalid_type_error: "Giai đoạn phải là số" }).min(1, "Giai đoạn là bắt buộc")
  ),
  ten_giai_doan: z.string().optional().nullable(), // Joined from bb_giai_doan
})

export type TrangThaiKhachBuon = z.infer<typeof trangThaiKhachBuonSchema>

/**
 * Schema for creating new trạng thái khách buôn
 */
export type CreateTrangThaiKhachBuonInput = Omit<TrangThaiKhachBuon, "id" | "tg_tao" | "tg_cap_nhat" | "ten_giai_doan" | "nguoi_tao_ten"> & {
  nguoi_tao_id?: number | null
}

/**
 * Schema for updating trạng thái khách buôn
 */
export type UpdateTrangThaiKhachBuonInput = Partial<Omit<TrangThaiKhachBuon, "id" | "tg_tao" | "nguoi_tao_id" | "ten_giai_doan" | "nguoi_tao_ten">>

