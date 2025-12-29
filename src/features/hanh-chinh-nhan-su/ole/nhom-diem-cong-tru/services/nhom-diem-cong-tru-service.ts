import { nhomDiemCongTruSchema, type NhomDiemCongTru } from "../schema"
import type { CreateNhomDiemCongTruInput, UpdateNhomDiemCongTruInput } from "../types"

/**
 * Domain service cho Nhóm Điểm Cộng Trừ.
 *
 * - Không phụ thuộc Next.js hay Supabase
 * - Xử lý validation, chuẩn hoá dữ liệu
 */
export class NhomDiemCongTruService {
  /**
   * Validate & chuẩn hoá input tạo mới từ form/UI.
   */
  validateCreateInput(input: CreateNhomDiemCongTruInput): CreateNhomDiemCongTruInput {
    const result = nhomDiemCongTruSchema.omit({ 
      id: true, 
      tg_tao: true, 
      tg_cap_nhat: true, 
      nguoi_tao_id: true,
      nguoi_tao_ten: true,
      nguoi_tao: true,
    }).safeParse(input)

    if (!result.success) {
      const message =
        "Dữ liệu nhóm điểm cộng trừ không hợp lệ: " +
        result.error.issues.map((e) => e.message).join(", ")
      throw new Error(message)
    }

    return result.data as CreateNhomDiemCongTruInput
  }

  /**
   * Chuẩn hoá payload update:
   * - Bỏ các field undefined
   * - Giữ null để cho phép clear giá trị
   * - Không cho phép đổi id
   */
  buildUpdatePayload(input: UpdateNhomDiemCongTruInput): Partial<NhomDiemCongTru> {
    const payload: Partial<NhomDiemCongTru> = {}

    const assignIfDefined = <K extends keyof NhomDiemCongTru>(
      key: K,
      value: NhomDiemCongTru[K] | undefined
    ) => {
      if (value !== undefined) {
        payload[key] = value
      }
    }

    assignIfDefined("hang_muc", input.hang_muc as any)
    assignIfDefined("nhom", input.nhom as any)
    assignIfDefined("min", input.min as any)
    assignIfDefined("max", input.max as any)
    assignIfDefined("mo_ta", input.mo_ta as any)
    assignIfDefined("pb_ap_dung_ib", input.pb_ap_dung_ib as any)
    assignIfDefined("tg_cap_nhat", input.tg_cap_nhat as any)

    return payload
  }
}

