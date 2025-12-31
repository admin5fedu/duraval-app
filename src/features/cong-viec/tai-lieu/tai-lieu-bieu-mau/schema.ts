import { z } from "zod"

/**
 * Schema matching 'tai_lieu_ds_tai_lieu_bieu_mau' table in Supabase
 * 
 * Table structure (from Supabase schema provided):
 * - id: bigint (PK, NOT NULL, auto-increment)
 * - hang_muc: text (NULL)
 * - loai_id: bigint (NULL)
 * - ten_loai: text (NULL)
 * - danh_muc_id: bigint (NULL)
 * - ten_danh_muc: text (NULL) - Tên danh mục (text), được tự động fill từ danh_muc_id
 * - danh_muc_cha_id: bigint (NULL)
 * - ten_danh_muc_cha: text (NULL)
 * - ma_tai_lieu: text (NULL)
 * - ten_tai_lieu: text (NULL)
 * - mo_ta: text (NULL)
 * - link_du_thao: text (NULL)
 * - link_ap_dung: text (NULL)
 * - ghi_chu: text (NULL)
 * - trang_thai: text (NULL)
 * - phan_phoi_pb_id: bigint (NULL)
 * - tai_lieu_cha_id: bigint (NULL)
 * - trao_doi: jsonb (NULL)
 * - nguoi_tao_id: bigint (NULL)
 * - tg_tao: timestamp with time zone (NULL, default now())
 * - tg_cap_nhat: timestamp without time zone (NULL, default CURRENT_TIMESTAMP)
 * 
 * Data Type Mapping:
 * - bigint -> number (JavaScript/TypeScript)
 * - text -> string
 * - jsonb -> any (object/array/null)
 * - timestamp -> string (ISO format)
 */
export const taiLieuBieuMauSchema = z.object({
  id: z.number().optional(),
  hang_muc: z.string().min(1, "Hạng mục là bắt buộc"),
  loai_id: z.number().int("Mã loại phải là số nguyên").min(1, "Loại tài liệu là bắt buộc"),
  ten_loai: z.string().optional().nullable(),
  danh_muc_id: z.number().int("Mã danh mục phải là số nguyên").min(1, "Danh mục là bắt buộc"),
  ten_danh_muc: z.string().optional().nullable(), // text - tên danh mục
  danh_muc_cha_id: z.number().int("Mã danh mục cha phải là số nguyên").optional().nullable(),
  ten_danh_muc_cha: z.string().optional().nullable(),
  ma_tai_lieu: z.string().optional().nullable(),
  ten_tai_lieu: z.string().min(1, "Tên tài liệu là bắt buộc").nullable(),
  mo_ta: z.string().optional().nullable(),
  link_du_thao: z.string().optional().nullable(),
  link_ap_dung: z.string().optional().nullable(),
  ghi_chu: z.string().optional().nullable(),
  trang_thai: z.string().min(1, "Trạng thái là bắt buộc"),
  phan_phoi_pb_id: z.number().int("Mã phân phối phòng ban phải là số nguyên").optional().nullable(),
  tai_lieu_cha_id: z.number().int("Mã tài liệu cha phải là số nguyên").optional().nullable(),
  trao_doi: z.any().optional().nullable(), // jsonb
  nguoi_tao_id: z.number().int("Mã nhân viên phải là số nguyên").optional().nullable(),
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
  nguoi_tao_ten: z.string().optional().nullable(), // Joined from var_nhan_su
})

export type TaiLieuBieuMau = z.infer<typeof taiLieuBieuMauSchema>

