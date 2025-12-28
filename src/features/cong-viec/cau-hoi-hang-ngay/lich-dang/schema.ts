import { z } from "zod"

// Schema matching 'chhn_lich_dang_bai' table in Supabase
export const lichDangSchema = z.object({
  id: z.number().optional(),
  ngay_dang: z.string().min(1, "Ngày đăng là bắt buộc"), // date - required
  gio_dang: z.string().min(1, "Giờ đăng là bắt buộc").regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Giờ đăng phải có định dạng HH:mm"), // time - required (HH:mm format)
  nhom_cau_hoi: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return undefined
      if (typeof val === "string") {
        const num = Number(val)
        return isNaN(num) ? undefined : num
      }
      return typeof val === "number" ? val : undefined
    },
    z.number({ message: "Nhóm câu hỏi là bắt buộc" })
  ), // bigint - FK to chhn_nhom_cau_hoi - required
  cau_hoi: z.string().min(1, "Câu hỏi là bắt buộc"), // text - required
  hinh_anh: z.string().optional().nullable(), // text - Cloudinary URL
  dap_an_1: z.string().min(1, "Đáp án 1 là bắt buộc"), // text - required
  dap_an_2: z.string().min(1, "Đáp án 2 là bắt buộc"), // text - required
  dap_an_3: z.string().min(1, "Đáp án 3 là bắt buộc"), // text - required
  dap_an_4: z.string().min(1, "Đáp án 4 là bắt buộc"), // text - required
  dap_an_dung: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return undefined
      if (typeof val === "string") {
        const num = Number(val)
        return isNaN(num) ? undefined : num
      }
      return typeof val === "number" ? val : undefined
    },
    z.number().int().min(1).max(4, "Đáp án đúng là bắt buộc")
  ), // integer 1-4 - required
  chuc_vu_ap_dung: z.array(z.number()).optional().nullable(), // jsonb - array of chuc_vu ids
  nguoi_tao_id: z.number().optional().nullable(), // bigint
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
  // Joined fields
  nhom_cau_hoi_ten: z.string().optional().nullable(), // Joined from chhn_nhom_cau_hoi
  nguoi_tao_ten: z.string().optional().nullable(), // Joined from var_nhan_su
})

export type LichDang = z.infer<typeof lichDangSchema>

