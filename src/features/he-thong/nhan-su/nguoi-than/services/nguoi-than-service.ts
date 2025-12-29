import { nguoiThanSchema, type NguoiThan } from "../schema"
import type {
  CreateNguoiThanInput,
  UpdateNguoiThanInput,
} from "../schema"

/**
 * Domain service cho Người thân.
 *
 * - Không phụ thuộc Next.js hay Supabase
 * - Xử lý validation, chuẩn hoá dữ liệu
 */
export class NguoiThanService {
  /**
   * Validate & chuẩn hoá input tạo mới từ form/UI.
   */
  validateCreateInput(input: CreateNguoiThanInput): CreateNguoiThanInput {
    const result = nguoiThanSchema.omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao: true }).safeParse(input)

    if (!result.success) {
      const message =
        "Dữ liệu người thân không hợp lệ: " +
        result.error.issues.map((e) => e.message).join(", ")
      throw new Error(message)
    }

    return result.data as CreateNguoiThanInput
  }

  /**
   * Chuẩn hoá payload update:
   * - Bỏ các field undefined
   * - Giữ null để cho phép clear giá trị
   * - Không cho phép đổi id, ma_nhan_vien
   */
  buildUpdatePayload(input: UpdateNguoiThanInput): Partial<NguoiThan> {
    const payload: Partial<NguoiThan> = {}

    const assignIfDefined = <K extends keyof NguoiThan>(
      key: K,
      value: NguoiThan[K] | undefined
    ) => {
      if (value !== undefined) {
        payload[key] = value
      }
    }

    assignIfDefined("ho_va_ten", input.ho_va_ten as any)
    assignIfDefined("moi_quan_he", input.moi_quan_he as any)
    assignIfDefined("ngay_sinh", input.ngay_sinh as any)
    assignIfDefined("so_dien_thoai", input.so_dien_thoai as any)
    assignIfDefined("ghi_chu", input.ghi_chu as any)

    return payload
  }
}

