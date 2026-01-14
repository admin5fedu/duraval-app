import { z } from "zod"
import { nhanSuSchema, type NhanSu } from "../types"
import type {
  CreateNhanSuInput,
  UpdateNhanSuInput,
  BatchNhanSuOperationResult,
} from "../types"

/**
 * Domain service cho Nhân sự.
 *
 * - Không phụ thuộc Next.js hay Supabase
 * - Xử lý validation, chuẩn hoá dữ liệu, tách logic import/update
 */

export class NhanSuService {
  /**
   * Validate & chuẩn hoá input tạo mới từ form/UI.
   */
  validateCreateInput(input: CreateNhanSuInput): CreateNhanSuInput {
    const result = nhanSuSchema.safeParse(input)

    if (!result.success) {
      const message =
        "Dữ liệu nhân sự không hợp lệ: " +
        result.error.issues.map((e: z.ZodIssue) => e.message).join(", ")
      throw new Error(message)
    }

    return result.data as CreateNhanSuInput
  }

  /**
   * Chuẩn hoá payload update:
   * - Bỏ các field undefined
   * - Giữ null để cho phép clear giá trị
   * - Không cho phép đổi ma_nhan_vien
   */
  buildUpdatePayload(input: UpdateNhanSuInput): Partial<NhanSu> {
    const payload: Partial<NhanSu> = {}

    const assignIfDefined = <K extends keyof NhanSu>(
      key: K,
      value: NhanSu[K] | undefined
    ) => {
      if (value !== undefined) {
        payload[key] = value
      }
    }

    assignIfDefined("ho_ten", input.ho_ten as any)
    assignIfDefined("avatar_url", input.avatar_url as any)
    assignIfDefined("tinh_trang", input.tinh_trang as any)

    // New fields
    assignIfDefined("ma_phong", input.ma_phong as any)
    assignIfDefined("ma_bo_phan", input.ma_bo_phan as any)
    assignIfDefined("ma_nhom", input.ma_nhom as any)
    assignIfDefined("ma_chuc_vu", input.ma_chuc_vu as any)

    assignIfDefined("gioi_tinh", input.gioi_tinh as any)
    assignIfDefined("hon_nhan", input.hon_nhan as any)
    assignIfDefined("so_dien_thoai", input.so_dien_thoai as any)
    assignIfDefined("email_ca_nhan", input.email_ca_nhan as any)
    assignIfDefined("email_cong_ty", input.email_cong_ty as any)
    assignIfDefined("ngay_sinh", input.ngay_sinh as any)
    assignIfDefined("ngay_thu_viec", input.ngay_thu_viec as any)
    assignIfDefined("ngay_chinh_thuc", input.ngay_chinh_thuc as any)
    assignIfDefined("ngay_nghi_viec", input.ngay_nghi_viec as any)
    assignIfDefined("ghi_chu", input.ghi_chu as any)
    assignIfDefined("cap_bac_id", input.cap_bac_id as any)
    assignIfDefined("ten_cap_bac", input.ten_cap_bac as any)
    assignIfDefined("cap_bac", input.cap_bac as any)
    assignIfDefined("chuc_vu_id", input.chuc_vu_id as any)
    assignIfDefined("phong_ban_id", input.phong_ban_id as any)
    assignIfDefined("phong_id", input.phong_id as any)
    assignIfDefined("nhom_id", input.nhom_id as any)
    assignIfDefined("bo_phan_id", input.bo_phan_id as any)

    return payload
  }

  /**
   * Tách batch import thành:
   * - bản ghi cần insert
   * - bản ghi cần update
   * - danh sách lỗi
   *
   * `existingIds` là tập ma_nhan_vien đã tồn tại trong DB.
   */
  splitBatchRecords(
    records: Partial<NhanSu>[],
    existingIds: Set<number>
  ): {
    toInsert: Array<{ record: Partial<NhanSu>; originalIndex: number }>
    toUpdate: Array<{
      ma_nhan_vien: number
      data: Partial<NhanSu>
      originalIndex: number
    }>
    errors: BatchNhanSuOperationResult["errors"]
  } {
    const errors: BatchNhanSuOperationResult["errors"] = []
    const toInsert: Array<{ record: Partial<NhanSu>; originalIndex: number }> = []
    const toUpdate: Array<{
      ma_nhan_vien: number
      data: Partial<NhanSu>
      originalIndex: number
    }> = []

    records.forEach((record, index) => {
      const originalIndex = index

      if (!record.ma_nhan_vien) {
        errors.push({
          row: originalIndex,
          error: "Mã nhân viên không được để trống",
        })
        return
      }

      if (existingIds.has(record.ma_nhan_vien)) {
        const updateData: Partial<NhanSu> = {}
        Object.entries(record).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            (updateData as any)[key] = value
          }
        })
        delete (updateData as any).ma_nhan_vien

        toUpdate.push({
          ma_nhan_vien: record.ma_nhan_vien,
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

