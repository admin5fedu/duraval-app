import { nhomPhieuHanhChinhSchema, type NhomPhieuHanhChinh } from "../schema"
import type { CreateNhomPhieuHanhChinhInput, UpdateNhomPhieuHanhChinhInput } from "../types"

/**
 * Domain service cho Nhóm Phiếu Hành Chính.
 *
 * - Không phụ thuộc Next.js hay Supabase
 * - Xử lý validation, chuẩn hoá dữ liệu
 */
export class NhomPhieuHanhChinhService {
  /**
   * Validate & chuẩn hoá input tạo mới từ form/UI.
   */
  validateCreateInput(input: CreateNhomPhieuHanhChinhInput): CreateNhomPhieuHanhChinhInput {
    const result = nhomPhieuHanhChinhSchema.omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true }).safeParse(input)

    if (!result.success) {
      const message =
        "Dữ liệu nhóm phiếu hành chính không hợp lệ: " +
        result.error.issues.map((e) => e.message).join(", ")
      throw new Error(message)
    }

    return result.data as CreateNhomPhieuHanhChinhInput
  }

  /**
   * Chuẩn hoá payload update:
   * - Bỏ các field undefined
   * - Giữ null để cho phép clear giá trị
   * - Không cho phép đổi id
   */
  buildUpdatePayload(input: UpdateNhomPhieuHanhChinhInput): Partial<NhomPhieuHanhChinh> {
    const payload: Partial<NhomPhieuHanhChinh> = {}

    const assignIfDefined = <K extends keyof NhomPhieuHanhChinh>(
      key: K,
      value: NhomPhieuHanhChinh[K] | undefined
    ) => {
      if (value !== undefined) {
        payload[key] = value
      }
    }

    assignIfDefined("loai_phieu", input.loai_phieu as any)
    assignIfDefined("ma_nhom_phieu", input.ma_nhom_phieu as any)
    assignIfDefined("ten_nhom_phieu", input.ten_nhom_phieu as any)
    assignIfDefined("so_luong_cho_phep_thang", input.so_luong_cho_phep_thang as any)
    assignIfDefined("can_hcns_duyet", input.can_hcns_duyet as any)
    assignIfDefined("ca_toi", input.ca_toi as any)
    assignIfDefined("tg_cap_nhat", input.tg_cap_nhat as any)

    return payload
  }
}

