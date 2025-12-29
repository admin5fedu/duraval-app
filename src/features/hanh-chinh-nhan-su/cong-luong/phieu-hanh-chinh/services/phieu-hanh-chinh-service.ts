import { phieuHanhChinhSchema, type PhieuHanhChinh } from "../schema"
import type { CreatePhieuHanhChinhInput, UpdatePhieuHanhChinhInput } from "../types"

/**
 * Domain service cho Phiếu Hành Chính.
 *
 * - Không phụ thuộc Next.js hay Supabase
 * - Xử lý validation, chuẩn hoá dữ liệu
 */
export class PhieuHanhChinhService {
  /**
   * Validate & chuẩn hoá input tạo mới từ form/UI.
   */
  validateCreateInput(input: CreatePhieuHanhChinhInput): CreatePhieuHanhChinhInput {
    const result = phieuHanhChinhSchema.omit({ 
      id: true, 
      tg_tao: true, 
      tg_cap_nhat: true, 
      nguoi_tao_ten: true 
    }).safeParse(input)

    if (!result.success) {
      const message =
        "Dữ liệu phiếu hành chính không hợp lệ: " +
        result.error.issues.map((e) => e.message).join(", ")
      throw new Error(message)
    }

    return result.data as CreatePhieuHanhChinhInput
  }

  /**
   * Chuẩn hoá payload update:
   * - Bỏ các field undefined
   * - Giữ null để cho phép clear giá trị
   * - Không cho phép đổi id
   */
  buildUpdatePayload(input: UpdatePhieuHanhChinhInput): Partial<PhieuHanhChinh> {
    const payload: Partial<PhieuHanhChinh> = {}

    const assignIfDefined = <K extends keyof PhieuHanhChinh>(
      key: K,
      value: PhieuHanhChinh[K] | undefined
    ) => {
      if (value !== undefined) {
        payload[key] = value
      }
    }

    assignIfDefined("ngay", input.ngay as any)
    assignIfDefined("loai_phieu", input.loai_phieu as any)
    assignIfDefined("ma_phieu", input.ma_phieu as any)
    assignIfDefined("ca", input.ca as any)
    assignIfDefined("so_gio", input.so_gio as any)
    assignIfDefined("ly_do", input.ly_do as any)
    assignIfDefined("com_trua", input.com_trua as any)
    assignIfDefined("phuong_tien", input.phuong_tien as any)
    assignIfDefined("trang_thai", input.trang_thai as any)
    assignIfDefined("quan_ly_duyet", input.quan_ly_duyet as any)
    assignIfDefined("ten_quan_ly", input.ten_quan_ly as any)
    assignIfDefined("tg_quan_ly_duyet", input.tg_quan_ly_duyet as any)
    assignIfDefined("hcns_duyet", input.hcns_duyet as any)
    assignIfDefined("ten_hcns", input.ten_hcns as any)
    assignIfDefined("tg_hcns_duyet", input.tg_hcns_duyet as any)
    assignIfDefined("trao_doi", input.trao_doi as any)
    assignIfDefined("tg_cap_nhat", input.tg_cap_nhat as any)

    return payload
  }
}

