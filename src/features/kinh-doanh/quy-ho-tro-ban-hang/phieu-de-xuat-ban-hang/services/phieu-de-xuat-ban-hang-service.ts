import { createPhieuDeXuatBanHangSchema, type PhieuDeXuatBanHang } from "../schema"
import type {
  CreatePhieuDeXuatBanHangInput,
  UpdatePhieuDeXuatBanHangInput,
  BatchPhieuDeXuatBanHangOperationResult,
} from "../schema"

/**
 * Domain service cho Phiếu đề xuất bán hàng.
 *
 * - Không phụ thuộc Next.js hay Supabase
 * - Xử lý validation, chuẩn hoá dữ liệu
 */

export class PhieuDeXuatBanHangService {
  /**
   * Validate & chuẩn hoá input tạo mới từ form/UI.
   */
  validateCreateInput(input: CreatePhieuDeXuatBanHangInput): CreatePhieuDeXuatBanHangInput {
    const result = createPhieuDeXuatBanHangSchema.safeParse(input)

    if (!result.success) {
      const message =
        "Dữ liệu phiếu đề xuất bán hàng không hợp lệ: " +
        result.error.issues.map((e) => e.message).join(", ")
      throw new Error(message)
    }

    return result.data as CreatePhieuDeXuatBanHangInput
  }

  /**
   * Chuẩn hoá payload update:
   * - Bỏ các field undefined
   * - Giữ null để cho phép clear giá trị
   * - Không cho phép đổi id
   */
  buildUpdatePayload(input: UpdatePhieuDeXuatBanHangInput): Partial<PhieuDeXuatBanHang> {
    const payload: Partial<PhieuDeXuatBanHang> = {}

    const assignIfDefined = <K extends keyof PhieuDeXuatBanHang>(
      key: K,
      value: PhieuDeXuatBanHang[K] | undefined
    ) => {
      if (value !== undefined) {
        payload[key] = value
      }
    }

    // Assign all fields
    Object.keys(input).forEach((key) => {
      assignIfDefined(key as keyof PhieuDeXuatBanHang, (input as any)[key])
    })

    return payload
  }

  /**
   * Tách batch import thành:
   * - bản ghi cần insert
   * - bản ghi cần update
   * - danh sách lỗi
   *
   * `existingIds` là tập id đã tồn tại trong DB.
   */
  splitBatchRecords(
    records: Partial<PhieuDeXuatBanHang>[],
    existingIds: Set<number>
  ): {
    toInsert: Array<{ record: Partial<PhieuDeXuatBanHang>; originalIndex: number }>
    toUpdate: Array<{
      id: number
      data: Partial<PhieuDeXuatBanHang>
      originalIndex: number
    }>
    errors: BatchPhieuDeXuatBanHangOperationResult["errors"]
  } {
    const errors: BatchPhieuDeXuatBanHangOperationResult["errors"] = []
    const toInsert: Array<{ record: Partial<PhieuDeXuatBanHang>; originalIndex: number }> = []
    const toUpdate: Array<{
      id: number
      data: Partial<PhieuDeXuatBanHang>
      originalIndex: number
    }> = []

    records.forEach((record, index) => {
      const originalIndex = index

      // Nếu có id và id đã tồn tại -> update
      if (record.id && existingIds.has(record.id)) {
        const updateData: Partial<PhieuDeXuatBanHang> = {}
        Object.entries(record).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            (updateData as any)[key] = value
          }
        })
        delete (updateData as any).id
        delete (updateData as any).tg_tao

        toUpdate.push({
          id: record.id,
          data: updateData,
          originalIndex,
        })
      } else {
        // Không có id hoặc id chưa tồn tại -> insert
        const insertRecord = { ...record }
        delete (insertRecord as any).id
        delete (insertRecord as any).tg_tao
        delete (insertRecord as any).tg_cap_nhat

        toInsert.push({ record: insertRecord, originalIndex })
      }
    })

    return { toInsert, toUpdate, errors }
  }
}

