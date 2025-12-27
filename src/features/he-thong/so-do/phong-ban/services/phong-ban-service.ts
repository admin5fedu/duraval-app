import { phongBanSchema, type PhongBan } from "../schema"
import type {
  CreatePhongBanInput,
  UpdatePhongBanInput,
} from "../schema"

/**
 * Domain service cho Phòng ban.
 *
 * - Không phụ thuộc Next.js hay Supabase
 * - Xử lý validation, chuẩn hoá dữ liệu
 */
export class PhongBanService {
  /**
   * Validate & chuẩn hoá input tạo mới từ form/UI.
   */
  validateCreateInput(input: CreatePhongBanInput): CreatePhongBanInput {
    const result = phongBanSchema.omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao: true }).safeParse(input)

    if (!result.success) {
      const message =
        "Dữ liệu phòng ban không hợp lệ: " +
        result.error.issues.map((e) => e.message).join(", ")
      throw new Error(message)
    }

    return result.data as CreatePhongBanInput
  }

  /**
   * Chuẩn hoá payload update:
   * - Bỏ các field undefined
   * - Giữ null để cho phép clear giá trị
   * - Không cho phép đổi id
   */
  buildUpdatePayload(input: UpdatePhongBanInput): Partial<PhongBan> {
    const payload: Partial<PhongBan> = {}

    const assignIfDefined = <K extends keyof PhongBan>(
      key: K,
      value: PhongBan[K] | undefined
    ) => {
      if (value !== undefined) {
        payload[key] = value
      }
    }

    assignIfDefined("tt", input.tt as any)
    assignIfDefined("ma_phong_ban", input.ma_phong_ban as any)
    assignIfDefined("ten_phong_ban", input.ten_phong_ban as any)
    assignIfDefined("cap_do", input.cap_do as any)
    assignIfDefined("truc_thuoc_phong_ban", input.truc_thuoc_phong_ban as any)
    assignIfDefined("truc_thuoc_id", input.truc_thuoc_id as any)
    assignIfDefined("tg_cap_nhat", input.tg_cap_nhat as any)

    return payload
  }
}

