import { chucVuSchema, type ChucVu } from "../schema"
import type {
  CreateChucVuInput,
  UpdateChucVuInput,
} from "../schema"

/**
 * Domain service cho Chức vụ.
 *
 * - Không phụ thuộc Next.js hay Supabase
 * - Xử lý validation, chuẩn hoá dữ liệu
 */
export class ChucVuService {
  /**
   * Validate & chuẩn hoá input tạo mới từ form/UI.
   */
  validateCreateInput(input: CreateChucVuInput): CreateChucVuInput {
    const result = chucVuSchema.omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao: true }).safeParse(input)

    if (!result.success) {
      const message =
        "Dữ liệu chức vụ không hợp lệ: " +
        result.error.issues.map((e) => e.message).join(", ")
      throw new Error(message)
    }

    return result.data as CreateChucVuInput
  }

  /**
   * Chuẩn hoá payload update:
   * - Bỏ các field undefined
   * - Giữ null để cho phép clear giá trị
   * - Không cho phép đổi id
   */
  buildUpdatePayload(input: UpdateChucVuInput): Partial<ChucVu> {
    const payload: Partial<ChucVu> = {}

    const assignIfDefined = <K extends keyof ChucVu>(
      key: K,
      value: ChucVu[K] | undefined
    ) => {
      if (value !== undefined) {
        payload[key] = value
      }
    }

    assignIfDefined("ma_chuc_vu", input.ma_chuc_vu as any)
    assignIfDefined("ten_chuc_vu", input.ten_chuc_vu as any)
    assignIfDefined("ma_cap_bac", input.ma_cap_bac as any)
    assignIfDefined("ten_cap_bac", input.ten_cap_bac as any)
    assignIfDefined("ma_phong_ban", input.ma_phong_ban as any)
    assignIfDefined("ma_nhom", input.ma_nhom as any)
    assignIfDefined("ma_bo_phan", input.ma_bo_phan as any)
    assignIfDefined("ma_phong", input.ma_phong as any)
    assignIfDefined("ngach_luong", input.ngach_luong as any)
    assignIfDefined("muc_dong_bao_hiem", input.muc_dong_bao_hiem as any)
    assignIfDefined("so_ngay_nghi_thu_7", input.so_ngay_nghi_thu_7 as any)
    assignIfDefined("nhom_thuong", input.nhom_thuong as any)
    assignIfDefined("diem_thuong", input.diem_thuong as any)
    assignIfDefined("phong_ban_id", input.phong_ban_id as any)
    assignIfDefined("cap_bac_id", input.cap_bac_id as any)
    assignIfDefined("tg_cap_nhat", input.tg_cap_nhat as any)

    return payload
  }
}

