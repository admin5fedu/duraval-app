import { nhomLuongSchema, type NhomLuong } from "../schema"
import type { CreateNhomLuongInput, UpdateNhomLuongInput } from "../types"

/**
 * Domain service cho Nhóm Lương.
 *
 * - Không phụ thuộc Next.js hay Supabase
 * - Xử lý validation, chuẩn hoá dữ liệu
 */
export class NhomLuongService {
  /**
   * Validate & chuẩn hoá input tạo mới từ form/UI.
   */
  validateCreateInput(input: CreateNhomLuongInput): CreateNhomLuongInput {
    const result = nhomLuongSchema.omit({ 
      id: true, 
      tg_tao: true, 
      tg_cap_nhat: true, 
      nguoi_tao_id: true,
      nguoi_tao_ten: true,
      nguoi_tao: true,
    }).safeParse(input)

    if (!result.success) {
      const message =
        "Dữ liệu nhóm lương không hợp lệ: " +
        result.error.issues.map((e) => e.message).join(", ")
      throw new Error(message)
    }

    return result.data as CreateNhomLuongInput
  }

  /**
   * Chuẩn hoá payload update:
   * - Bỏ các field undefined
   * - Giữ null để cho phép clear giá trị
   * - Không cho phép đổi id
   */
  buildUpdatePayload(input: UpdateNhomLuongInput): Partial<NhomLuong> {
    const payload: Partial<NhomLuong> = {}

    const assignIfDefined = <K extends keyof NhomLuong>(
      key: K,
      value: NhomLuong[K] | undefined
    ) => {
      if (value !== undefined) {
        payload[key] = value
      }
    }

    assignIfDefined("ten_nhom", input.ten_nhom as any)
    assignIfDefined("mo_ta", input.mo_ta as any)
    assignIfDefined("tg_cap_nhat", input.tg_cap_nhat as any)

    return payload
  }
}

