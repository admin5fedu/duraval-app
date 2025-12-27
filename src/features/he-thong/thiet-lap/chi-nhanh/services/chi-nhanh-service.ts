import { chiNhanhSchema, type ChiNhanh } from "../schema"
import type {
  CreateChiNhanhInput,
  UpdateChiNhanhInput,
} from "../schema"

/**
 * Domain service cho Chi nhánh.
 *
 * - Không phụ thuộc Next.js hay Supabase
 * - Xử lý validation, chuẩn hoá dữ liệu
 */
export class ChiNhanhService {
  /**
   * Validate & chuẩn hoá input tạo mới từ form/UI.
   */
  validateCreateInput(input: CreateChiNhanhInput): CreateChiNhanhInput {
    const result = chiNhanhSchema.omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true }).safeParse(input)

    if (!result.success) {
      const message =
        "Dữ liệu chi nhánh không hợp lệ: " +
        result.error.issues.map((e) => e.message).join(", ")
      throw new Error(message)
    }

    return result.data as CreateChiNhanhInput
  }

  /**
   * Chuẩn hoá payload update:
   * - Bỏ các field undefined
   * - Giữ null để cho phép clear giá trị
   * - Không cho phép đổi id
   */
  buildUpdatePayload(input: UpdateChiNhanhInput): Partial<ChiNhanh> {
    const payload: Partial<ChiNhanh> = {}

    const assignIfDefined = <K extends keyof ChiNhanh>(
      key: K,
      value: ChiNhanh[K] | undefined
    ) => {
      if (value !== undefined) {
        payload[key] = value
      }
    }

    assignIfDefined("ma_chi_nhanh", input.ma_chi_nhanh as any)
    assignIfDefined("ten_chi_nhanh", input.ten_chi_nhanh as any)
    assignIfDefined("dia_chi", input.dia_chi as any)
    assignIfDefined("dinh_vi", input.dinh_vi as any)
    assignIfDefined("hinh_anh", input.hinh_anh as any)
    assignIfDefined("mo_ta", input.mo_ta as any)
    assignIfDefined("tg_cap_nhat", input.tg_cap_nhat as any)

    return payload
  }
}

