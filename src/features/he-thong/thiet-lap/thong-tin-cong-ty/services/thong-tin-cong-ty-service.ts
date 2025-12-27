import { thongTinCongTySchema, type ThongTinCongTy } from "../schema"
import type {
  CreateThongTinCongTyInput,
  UpdateThongTinCongTyInput,
} from "../schema"

/**
 * Domain service cho Thông tin công ty.
 *
 * - Không phụ thuộc Next.js hay Supabase
 * - Xử lý validation, chuẩn hoá dữ liệu
 */
export class ThongTinCongTyService {
  /**
   * Validate & chuẩn hoá input tạo mới từ form/UI.
   */
  validateCreateInput(input: CreateThongTinCongTyInput): CreateThongTinCongTyInput {
    const result = thongTinCongTySchema.omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true }).safeParse(input)

    if (!result.success) {
      const message =
        "Dữ liệu thông tin công ty không hợp lệ: " +
        result.error.issues.map((e) => e.message).join(", ")
      throw new Error(message)
    }

    return result.data as CreateThongTinCongTyInput
  }

  /**
   * Chuẩn hoá payload update:
   * - Bỏ các field undefined
   * - Giữ null để cho phép clear giá trị
   * - Không cho phép đổi id
   */
  buildUpdatePayload(input: UpdateThongTinCongTyInput): Partial<ThongTinCongTy> {
    const payload: Partial<ThongTinCongTy> = {}

    const assignIfDefined = <K extends keyof ThongTinCongTy>(
      key: K,
      value: ThongTinCongTy[K] | undefined
    ) => {
      if (value !== undefined) {
        payload[key] = value
      }
    }

    assignIfDefined("ma_cong_ty", input.ma_cong_ty as any)
    assignIfDefined("ten_cong_ty", input.ten_cong_ty as any)
    assignIfDefined("ten_day_du", input.ten_day_du as any)
    assignIfDefined("link_logo", input.link_logo as any)
    assignIfDefined("dia_chi", input.dia_chi as any)
    assignIfDefined("so_dien_thoai", input.so_dien_thoai as any)
    assignIfDefined("email", input.email as any)
    assignIfDefined("website", input.website as any)
    assignIfDefined("ap_dung", input.ap_dung as any)
    assignIfDefined("tg_cap_nhat", input.tg_cap_nhat as any)

    return payload
  }
}

