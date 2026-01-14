import { capBacSchema, type CapBac, type CreateCapBacInput, type UpdateCapBacInput } from "../schema"

/**
 * Domain service cho Cấp bậc.
 *
 * - Không phụ thuộc Next.js hay Supabase
 * - Xử lý validation, chuẩn hoá dữ liệu
 */
export class CapBacService {
  /**
   * Validate & chuẩn hoá input tạo mới từ form/UI.
   */
  validateCreateInput(input: CreateCapBacInput): CreateCapBacInput {
    const result = capBacSchema.omit({ id: true, tg_tao: true, tg_cap_nhat: true }).safeParse(input)

    if (!result.success) {
      const message =
        "Dữ liệu cấp bậc không hợp lệ: " +
        result.error.issues.map((e) => e.message).join(", ")
      throw new Error(message)
    }

    return result.data as CreateCapBacInput
  }

  /**
   * Chuẩn hoá payload update:
   * - Bỏ các field undefined
   * - Giữ null để cho phép clear giá trị
   * - Không cho phép đổi id
   */
  buildUpdatePayload(input: UpdateCapBacInput): Partial<CapBac> {
    const payload: Partial<CapBac> = {}

    const assignIfDefined = <K extends keyof CapBac>(
      key: K,
      value: CapBac[K] | undefined
    ) => {
      if (value !== undefined) {
        payload[key] = value
      }
    }

    assignIfDefined("ten_cap_bac", input.ten_cap_bac as any)
    assignIfDefined("cap_bac", input.cap_bac as any)
    assignIfDefined("tg_cap_nhat", input.tg_cap_nhat as any)

    return payload
  }
}

