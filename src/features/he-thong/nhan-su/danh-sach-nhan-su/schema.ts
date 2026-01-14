import { z } from "zod"

/**
 * Schema matching 'var_nhan_su' table in Supabase
 */
export const nhanSuSchema = z.object({
  ma_nhan_vien: z.number({ required_error: "Mã nhân viên là bắt buộc", invalid_type_error: "Mã nhân viên phải là số" }),
  ho_ten: z.string().min(1, "Họ và tên là bắt buộc"),
  avatar_url: z.string().optional().nullable(),
  tinh_trang: z.string().default("Thử việc"),

  // New fields replacing text fields
  ma_bo_phan: z.string().optional().nullable(),
  ma_nhom: z.string().optional().nullable(),
  ma_chuc_vu: z.string().optional().nullable(),
  ma_phong: z.string().optional().nullable(),

  gioi_tinh: z.string().optional().nullable(),
  hon_nhan: z.string().optional().nullable(),
  so_dien_thoai: z.string().optional().nullable(),
  email_ca_nhan: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : val),
    z.string().email("Email không hợp lệ").nullable().optional()
  ),
  email_cong_ty: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : val),
    z.string().email("Email không hợp lệ").nullable().optional()
  ),
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
  ngay_sinh: z.string().optional().nullable(),
  ngay_thu_viec: z.string().optional().nullable(),
  ngay_chinh_thuc: z.string().optional().nullable(),
  ngay_nghi_viec: z.string().optional().nullable(),
  ghi_chu: z.string().optional().nullable(),

  // ID fields (bigint -> number)
  cap_bac_id: z.number().optional().nullable(), // Changed from string to number per DB bigint
  ten_cap_bac: z.string().optional().nullable(),
  cap_bac: z.number().optional().nullable(),

  chuc_vu_id: z.number().optional().nullable(),
  phong_ban_id: z.number().optional().nullable(), // Kept as referenced in types view? DB has bo_phan_id, phong_id. Is phong_ban_id alias for phong_id? 
  // User list has: chuc_vu_id, phong_id, nhom_id, bo_phan_id. 
  // Old schema had phong_ban_id. I should probably rename/replace or keep if it's computed. 
  // Given the request "Cập nhật lại cấu trúc bảng", I should stick to table structure.
  // I will replace phong_ban_id with phong_id if strictly following.
  // But wait, list says "phong_id". Old schema had "phong_ban_id" and "phong_id".
  // I'll add all IDs from the list.
  phong_id: z.number().optional().nullable(),
  nhom_id: z.number().optional().nullable(),
  bo_phan_id: z.number().optional().nullable(),
})

export type NhanSu = z.infer<typeof nhanSuSchema>

/**
 * Schema for creating new employee
 */
export const createNhanSuSchema = nhanSuSchema

export type CreateNhanSuInput = z.infer<typeof createNhanSuSchema>

/**
 * Schema for updating employee
 */
export const updateNhanSuSchema = nhanSuSchema.partial().omit({ ma_nhan_vien: true })

export type UpdateNhanSuInput = z.infer<typeof updateNhanSuSchema>

/**
 * Batch operation result
 */
export interface BatchNhanSuOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

