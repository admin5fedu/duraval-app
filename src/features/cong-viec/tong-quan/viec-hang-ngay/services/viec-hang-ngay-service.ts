import { viecHangNgaySchema, type ViecHangNgay } from "../schema"
import type {
  CreateViecHangNgayInput,
  UpdateViecHangNgayInput,
  BatchViecHangNgayOperationResult,
} from "../types"

/**
 * Domain service cho Việc hàng ngày.
 *
 * - Không phụ thuộc Next.js hay Supabase
 * - Xử lý validation, chuẩn hoá dữ liệu
 */
export class ViecHangNgayService {
  /**
   * Validate & chuẩn hoá input tạo mới từ form/UI.
   */
  validateCreateInput(input: CreateViecHangNgayInput): CreateViecHangNgayInput {
    const result = viecHangNgaySchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true })
      .safeParse(input)

    if (!result.success) {
      const message =
        "Dữ liệu việc hàng ngày không hợp lệ: " +
        result.error.issues.map((e) => e.message).join(", ")
      throw new Error(message)
    }

    return result.data as CreateViecHangNgayInput
  }

  /**
   * Xây dựng payload update:
   * - Bỏ tg_tao
   * - Set tg_cap_nhat = now
   */
  buildUpdatePayload(input: UpdateViecHangNgayInput): Partial<ViecHangNgay> {
    const { tg_tao: _tg_tao, ...rest } = input as any
    void _tg_tao

    return {
      ...rest,
      tg_cap_nhat: new Date().toISOString(),
    }
  }

  /**
   * Helper cho batch upsert: tách insert / update theo key (ma_nhan_vien + ngay_bao_cao).
   * existingMap: key "ma_nhan_vien_ngay" -> id record hiện có.
   */
  splitBatchRecordsByEmployeeAndDate(
    records: Partial<ViecHangNgay>[],
    existingMap: Map<string, number>
  ): {
    toInsert: Array<{ record: Partial<ViecHangNgay>; originalIndex: number }>
    toUpdate: Array<{
      id: number
      data: Partial<ViecHangNgay>
      originalIndex: number
    }>
    errors: BatchViecHangNgayOperationResult["errors"]
  } {
    const errors: BatchViecHangNgayOperationResult["errors"] = []
    const toInsert: Array<{ record: Partial<ViecHangNgay>; originalIndex: number }> = []
    const toUpdate: Array<{
      id: number
      data: Partial<ViecHangNgay>
      originalIndex: number
    }> = []

    records.forEach((record, index) => {
      const originalIndex = index

      if (!record.ma_nhan_vien || !record.ngay_bao_cao) {
        errors.push({
          row: originalIndex,
          error: "Mã nhân viên và ngày báo cáo không được để trống",
        })
        return
      }

      const key = `${record.ma_nhan_vien}_${record.ngay_bao_cao}`
      const existingId = existingMap.get(key)

      if (existingId) {
        const updateData: Partial<ViecHangNgay> = {}
        Object.entries(record).forEach(([k, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            (updateData as any)[k] = value
          }
        })
        delete (updateData as any).id

        toUpdate.push({
          id: existingId,
          data: updateData,
          originalIndex,
        })
      } else {
        toInsert.push({ record, originalIndex })
      }
    })

    return { toInsert, toUpdate, errors }
  }
}

