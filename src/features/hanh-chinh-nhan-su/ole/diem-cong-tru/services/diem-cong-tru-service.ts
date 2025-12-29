import { diemCongTruSchema, type DiemCongTru } from "../schema"
import type { CreateDiemCongTruInput, UpdateDiemCongTruInput } from "../types"

/**
 * Domain service cho Điểm Cộng Trừ.
 *
 * - Không phụ thuộc Next.js hay Supabase
 * - Xử lý validation, chuẩn hoá dữ liệu
 */
export class DiemCongTruService {
  /**
   * Validate & chuẩn hoá input tạo mới từ form/UI.
   */
  validateCreateInput(input: CreateDiemCongTruInput): CreateDiemCongTruInput {
    const result = diemCongTruSchema.omit({ 
      id: true, 
      tg_tao: true, 
      tg_cap_nhat: true, 
      nguoi_tao_id: true,
      nhan_vien: true,
      phong_ban: true,
      nhom_luong: true,
      nguoi_tao: true,
    }).safeParse(input)

    if (!result.success) {
      const message =
        "Dữ liệu điểm cộng trừ không hợp lệ: " +
        result.error.issues.map((e) => e.message).join(", ")
      throw new Error(message)
    }

    return result.data as CreateDiemCongTruInput
  }

  /**
   * Chuẩn hoá payload update:
   * - Bỏ các field undefined
   * - Giữ null để cho phép clear giá trị
   * - Không cho phép đổi id
   */
  buildUpdatePayload(input: UpdateDiemCongTruInput): Partial<DiemCongTru> {
    const payload: Partial<DiemCongTru> = {}

    const assignIfDefined = <K extends keyof DiemCongTru>(
      key: K,
      value: DiemCongTru[K] | undefined
    ) => {
      if (value !== undefined) {
        payload[key] = value
      }
    }

    assignIfDefined("nhan_vien_id", input.nhan_vien_id as any)
    assignIfDefined("ho_va_ten", input.ho_va_ten as any)
    assignIfDefined("ngay", input.ngay as any)
    assignIfDefined("ma_phong_id", input.ma_phong_id as any)
    assignIfDefined("phong_ban_id", input.phong_ban_id as any)
    assignIfDefined("loai", input.loai as any)
    assignIfDefined("nhom", input.nhom as any)
    assignIfDefined("diem", input.diem as any)
    assignIfDefined("tien", input.tien as any)
    assignIfDefined("nhom_luong_id", input.nhom_luong_id as any)
    assignIfDefined("ten_nhom_luong", input.ten_nhom_luong as any)
    assignIfDefined("mo_ta", input.mo_ta as any)
    assignIfDefined("trang_thai", input.trang_thai as any)
    assignIfDefined("tg_cap_nhat", input.tg_cap_nhat as any)

    return payload
  }
}

