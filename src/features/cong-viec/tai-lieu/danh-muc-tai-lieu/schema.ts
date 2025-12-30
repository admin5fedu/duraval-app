import { z } from "zod"

/**
 * Schema matching 'tai_lieu_danh_muc_tai_lieu' table in Supabase
 */
/**
 * Schema matching 'tai_lieu_danh_muc_tai_lieu' table in Supabase
 * 
 * Table structure:
 * - id: bigint (PK, NOT NULL, auto-increment)
 * - hang_muc: text (NOT NULL)
 * - loai_id: bigint (NULL) - Required by business logic
 * - loai_tai_lieu: text (NULL)
 * - cap: numeric (NULL) - Required by business logic (1 or 2)
 * - ten_danh_muc: text (NULL)
 * - danh_muc_cha_id: bigint (NULL) - Added later
 * - ten_danh_muc_cha: text (NULL) - Added later
 * - mo_ta: text (NULL)
 * - nguoi_tao_id: bigint (NULL)
 * - tg_tao: timestamp with time zone (NULL, default now())
 * - tg_cap_nhat: timestamp without time zone (NULL, default CURRENT_TIMESTAMP)
 */
export const danhMucTaiLieuSchema = z.object({
  id: z.number().optional(),
  hang_muc: z.string().min(1, "Hạng mục là bắt buộc"),
  loai_id: z.number().int("Mã loại phải là số nguyên").min(1, "Loại tài liệu là bắt buộc"),
  loai_tai_lieu: z.string().optional().nullable(),
  cap: z.number().min(1).max(2, "Cấp chỉ có thể là 1 hoặc 2"), // numeric in DB, not int
  ten_danh_muc: z.string().min(1, "Tên danh mục là bắt buộc"),
  danh_muc_cha_id: z.number().int("Mã danh mục cha phải là số nguyên").optional().nullable(),
  ten_danh_muc_cha: z.string().optional().nullable(),
  mo_ta: z.string().optional().nullable(),
  nguoi_tao_id: z.number().int("Mã nhân viên phải là số nguyên").optional().nullable(),
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
  nguoi_tao_ten: z.string().optional().nullable(), // Joined from var_nhan_su
})

export type DanhMucTaiLieu = z.infer<typeof danhMucTaiLieuSchema>

