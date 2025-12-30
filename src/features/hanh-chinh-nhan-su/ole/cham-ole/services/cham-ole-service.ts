import { chamOleSchema, type ChamOle } from "../schema"
import type { CreateChamOleInput, UpdateChamOleInput } from "../types"

/**
 * Domain service cho Chấm OLE.
 *
 * - Không phụ thuộc Next.js hay Supabase
 * - Xử lý validation, chuẩn hoá dữ liệu
 */
export class ChamOleService {
  /**
   * Validate & chuẩn hoá input tạo mới từ form/UI.
   */
  validateCreateInput(input: CreateChamOleInput): CreateChamOleInput {
    const result = chamOleSchema.omit({ 
      id: true, 
      tg_tao: true, 
      tg_cap_nhat: true, 
      nguoi_tao_id: true,
      nhan_vien: true,
      phong_ban: true,
      chuc_vu: true,
      nguoi_tao: true,
    }).safeParse(input)

    if (!result.success) {
      const message =
        "Dữ liệu chấm OLE không hợp lệ: " +
        result.error.issues.map((e) => e.message).join(", ")
      throw new Error(message)
    }

    return result.data as CreateChamOleInput
  }

  /**
   * Chuẩn hoá payload update:
   * - Bỏ các field undefined
   * - Giữ null để cho phép clear giá trị
   * - Không cho phép đổi id
   */
  buildUpdatePayload(input: UpdateChamOleInput): Partial<ChamOle> {
    const payload: Partial<ChamOle> = {}

    const assignIfDefined = <K extends keyof ChamOle>(
      key: K,
      value: ChamOle[K] | undefined
    ) => {
      if (value !== undefined) {
        payload[key] = value
      }
    }

    assignIfDefined("nam", input.nam as any)
    assignIfDefined("thang", input.thang as any)
    assignIfDefined("nhan_vien_id", input.nhan_vien_id as any)
    assignIfDefined("phong_id", input.phong_id as any)
    assignIfDefined("nhom_id", input.nhom_id as any)
    assignIfDefined("chuc_vu_id", input.chuc_vu_id as any)
    assignIfDefined("danh_gia", input.danh_gia as any)
    assignIfDefined("ole", input.ole as any)
    assignIfDefined("kpi", input.kpi as any)
    assignIfDefined("cong", input.cong as any)
    assignIfDefined("tru", input.tru as any)
    assignIfDefined("ghi_chu", input.ghi_chu as any)
    assignIfDefined("trao_doi", input.trao_doi as any)
    assignIfDefined("tg_cap_nhat", input.tg_cap_nhat as any)

    return payload
  }
}

