import { z } from "zod"

// Schema matching 'chhn_cau_tra_loi' table in Supabase
export const cauTraLoiSchema = z.object({
  id: z.number().optional(),
  lich_dang_id: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return undefined
      if (typeof val === "string") {
        const num = Number(val)
        return isNaN(num) ? undefined : num
      }
      return typeof val === "number" ? val : undefined
    },
    z.number({ message: "Lịch đăng là bắt buộc" })
  ), // bigint - FK to chhn_lich_dang_bai(id) - required
  cau_tra_loi: z.string().min(1, "Câu trả lời là bắt buộc"), // text - required
  ket_qua: z.string().min(1, "Kết quả là bắt buộc"), // text - required
  nguoi_tao_id: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return undefined
      if (typeof val === "string") {
        const num = Number(val)
        return isNaN(num) ? undefined : num
      }
      return typeof val === "number" ? val : undefined
    },
    z.number({ message: "Người tạo là bắt buộc" })
  ), // integer - FK to var_nhan_su(ma_nhan_vien) - required
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
  // Joined fields
  lich_dang_cau_hoi: z.string().optional().nullable(), // Joined from chhn_lich_dang_bai
  nguoi_tao_ten: z.string().optional().nullable(), // Joined from var_nhan_su
})

export type CauTraLoi = z.infer<typeof cauTraLoiSchema>

