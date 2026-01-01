import { nhomApDoanhSoSchema, type NhomApDoanhSo } from "../schema"
import type {
  CreateNhomApDoanhSoInput,
  UpdateNhomApDoanhSoInput,
} from "../schema"

/**
 * Domain service cho Nhóm áp doanh số.
 *
 * - Không phụ thuộc Next.js hay Supabase
 * - Xử lý validation, chuẩn hoá dữ liệu
 */
export class NhomApDoanhSoService {
  /**
   * Validate & chuẩn hoá input tạo mới từ form/UI.
   */
  validateCreateInput(input: CreateNhomApDoanhSoInput): CreateNhomApDoanhSoInput {
    const result = nhomApDoanhSoSchema.omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true }).safeParse(input)

    if (!result.success) {
      const message =
        "Dữ liệu nhóm áp doanh số không hợp lệ: " +
        result.error.issues.map((e) => e.message).join(", ")
      throw new Error(message)
    }

    return result.data as CreateNhomApDoanhSoInput
  }

  /**
   * Chuẩn hoá payload update:
   * - Bỏ các field undefined
   * - Giữ null để cho phép clear giá trị
   * - Không cho phép đổi id
   */
  buildUpdatePayload(input: UpdateNhomApDoanhSoInput): Partial<NhomApDoanhSo> {
    const payload: Partial<NhomApDoanhSo> = {}

    const assignIfDefined = <K extends keyof NhomApDoanhSo>(
      key: K,
      value: NhomApDoanhSo[K] | undefined
    ) => {
      if (value !== undefined) {
        payload[key] = value
      }
    }

    assignIfDefined("ma_nhom_ap", input.ma_nhom_ap as any)
    assignIfDefined("ten_nhom_ap", input.ten_nhom_ap as any)
    assignIfDefined("mo_ta", input.mo_ta as any)
    assignIfDefined("tg_cap_nhat", input.tg_cap_nhat as any)

    return payload
  }
}

