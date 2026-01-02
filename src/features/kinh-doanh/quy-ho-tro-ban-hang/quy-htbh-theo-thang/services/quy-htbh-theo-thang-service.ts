import { createQuyHTBHTheoThangSchema, type QuyHTBHTheoThang } from "../schema"
import type {
  CreateQuyHTBHTheoThangInput,
  UpdateQuyHTBHTheoThangInput,
  BatchQuyHTBHTheoThangOperationResult,
} from "../schema"

/**
 * Domain service cho Quỹ HTBH theo tháng.
 *
 * - Không phụ thuộc Next.js hay Supabase
 * - Xử lý validation, chuẩn hoá dữ liệu
 */

export class QuyHTBHTheoThangService {
  /**
   * Validate & chuẩn hoá input tạo mới từ form/UI.
   */
  validateCreateInput(input: CreateQuyHTBHTheoThangInput): CreateQuyHTBHTheoThangInput {
    const result = createQuyHTBHTheoThangSchema.safeParse(input)

    if (!result.success) {
      const message =
        "Dữ liệu quỹ HTBH theo tháng không hợp lệ: " +
        result.error.issues.map((e) => e.message).join(", ")
      throw new Error(message)
    }

    return result.data as CreateQuyHTBHTheoThangInput
  }

  /**
   * Chuẩn hoá payload update:
   * - Bỏ các field undefined
   * - Giữ null để cho phép clear giá trị
   * - Không cho phép đổi id
   */
  buildUpdatePayload(input: UpdateQuyHTBHTheoThangInput): Partial<QuyHTBHTheoThang> {
    const payload: Partial<QuyHTBHTheoThang> = {}

    const assignIfDefined = <K extends keyof QuyHTBHTheoThang>(
      key: K,
      value: QuyHTBHTheoThang[K] | undefined
    ) => {
      if (value !== undefined) {
        payload[key] = value
      }
    }

    assignIfDefined("nam", input.nam as any)
    assignIfDefined("thang", input.thang as any)
    assignIfDefined("nhan_vien_id", input.nhan_vien_id as any)
    assignIfDefined("ten_nhan_vien", input.ten_nhan_vien as any)
    assignIfDefined("phong_id", input.phong_id as any)
    assignIfDefined("ma_phong", input.ma_phong as any)
    assignIfDefined("nhom_id", input.nhom_id as any)
    assignIfDefined("ma_nhom", input.ma_nhom as any)
    assignIfDefined("quy", input.quy as any)
    assignIfDefined("so_tien_quy", input.so_tien_quy as any)
    assignIfDefined("da_dung", input.da_dung as any)
    assignIfDefined("con_du", input.con_du as any)
    assignIfDefined("ghi_chu", input.ghi_chu as any)
    assignIfDefined("nguoi_tao_id", input.nguoi_tao_id as any)

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
    records: Partial<QuyHTBHTheoThang>[],
    existingIds: Set<number>
  ): {
    toInsert: Array<{ record: Partial<QuyHTBHTheoThang>; originalIndex: number }>
    toUpdate: Array<{
      id: number
      data: Partial<QuyHTBHTheoThang>
      originalIndex: number
    }>
    errors: BatchQuyHTBHTheoThangOperationResult["errors"]
  } {
    const errors: BatchQuyHTBHTheoThangOperationResult["errors"] = []
    const toInsert: Array<{ record: Partial<QuyHTBHTheoThang>; originalIndex: number }> = []
    const toUpdate: Array<{
      id: number
      data: Partial<QuyHTBHTheoThang>
      originalIndex: number
    }> = []

    records.forEach((record, index) => {
      const originalIndex = index

      // Nếu có id và id đã tồn tại -> update
      if (record.id && existingIds.has(record.id)) {
        const updateData: Partial<QuyHTBHTheoThang> = {}
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

