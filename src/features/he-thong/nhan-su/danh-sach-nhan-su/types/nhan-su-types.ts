import { z } from "zod"

/**
 * Schema matching 'var_nhan_su' table in Supabase
 */
export const nhanSuSchema = z.object({
  ma_nhan_vien: z.number(),
  ho_ten: z.string().min(1, "Họ và tên là bắt buộc"),
  avatar_url: z.string().optional().nullable(),
  tinh_trang: z.string().default("Thử việc"),
  phong_ban: z.string().optional().nullable(),
  bo_phan: z.string().optional().nullable(),
  nhom: z.string().optional().nullable(),
  chuc_vu: z.string().optional().nullable(),
  gioi_tinh: z.string().optional().nullable(),
  hon_nhan: z.string().optional().nullable(),
  so_dien_thoai: z.string().optional().nullable(),
  email_ca_nhan: z.string().email("Email không hợp lệ").optional().nullable(),
  email_cong_ty: z.string().email("Email không hợp lệ"),
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
  ngay_sinh: z.string().optional().nullable(),
  ngay_thu_viec: z.string().optional().nullable(),
  ngay_chinh_thuc: z.string().optional().nullable(),
  ngay_nghi_viec: z.string().optional().nullable(),
  ghi_chu: z.string().optional().nullable(),
  cap_bac_id: z.string().optional().nullable(),
  ten_cap_bac: z.string().optional().nullable(),
  cap_bac: z.number().optional().nullable(),
  chuc_vu_id: z.number().optional().nullable(),
  phong_ban_id: z.number().optional().nullable(),
})

export type NhanSu = z.infer<typeof nhanSuSchema>

export type CreateNhanSuInput = NhanSu

export type UpdateNhanSuInput = Partial<Omit<NhanSu, "ma_nhan_vien">>

export interface BatchNhanSuOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

