import { CreatePhanQuyenInput, UpdatePhanQuyenInput, quyenSchema } from "../schema"

/**
 * Domain service for Phân Quyền
 * Contains business logic and validation
 */
export class PhanQuyenService {
  /**
   * Validate create input
   */
  static validateCreateInput(input: CreatePhanQuyenInput): CreatePhanQuyenInput {
    // Validate quyen structure
    if (input.quyen) {
      quyenSchema.parse(input.quyen)
    }

    return input
  }

  /**
   * Build update payload
   */
  static buildUpdatePayload(input: UpdatePhanQuyenInput): UpdatePhanQuyenInput {
    const payload: UpdatePhanQuyenInput = {}

    if (input.chuc_vu_id !== undefined) {
      payload.chuc_vu_id = input.chuc_vu_id
    }

    if (input.module_id !== undefined) {
      payload.module_id = input.module_id
    }

    if (input.quyen !== undefined) {
      payload.quyen = quyenSchema.parse(input.quyen)
    }

    return payload
  }
}

