import { keHoach168Schema, type KeHoach168 } from "../schema"
import type {
  CreateKeHoach168Input,
  UpdateKeHoach168Input,
  BatchKeHoach168OperationResult,
} from "../types/ke-hoach-168-types"

/**
 * Domain service cho Kế hoạch 168.
 *
 * - Không phụ thuộc Next.js hay Supabase
 * - Xử lý validation, chuẩn hoá dữ liệu
 */
export class KeHoach168Service {
  /**
   * Validate & chuẩn hoá input tạo mới từ form/UI.
   */
  validateCreateInput(input: CreateKeHoach168Input): CreateKeHoach168Input {
    const result = keHoach168Schema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true })
      .safeParse(input)

    if (!result.success) {
      const message =
        "Dữ liệu kế hoạch 168 không hợp lệ: " +
        result.error.issues.map((e) => e.message).join(", ")
      throw new Error(message)
    }

    return result.data as CreateKeHoach168Input
  }

  /**
   * Xây dựng payload update:
   * - Bỏ tg_tao
   * - Set tg_cap_nhat = now
   */
  buildUpdatePayload(input: UpdateKeHoach168Input): Partial<KeHoach168> {
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
    records: Partial<KeHoach168>[],
    existingMap: Map<string, number>
  ): {
    toInsert: Array<{ record: Partial<KeHoach168>; originalIndex: number }>
    toUpdate: Array<{
      id: number
      data: Partial<KeHoach168>
      originalIndex: number
    }>
    errors: BatchKeHoach168OperationResult["errors"]
  } {
    const errors: BatchKeHoach168OperationResult["errors"] = []
    const toInsert: Array<{ record: Partial<KeHoach168>; originalIndex: number }> = []
    const toUpdate: Array<{
      id: number
      data: Partial<KeHoach168>
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
        const updateData: Partial<KeHoach168> = {}
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

