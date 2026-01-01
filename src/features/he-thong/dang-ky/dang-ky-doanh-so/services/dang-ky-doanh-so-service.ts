import { dangKyDoanhSoSchema } from "../schema"
import type { CreateDangKyDoanhSoInput, UpdateDangKyDoanhSoInput, DangKyDoanhSo } from "../schema"

/**
 * Domain service for Đăng Ký Doanh Số
 * Provides business logic and validation
 */
export class DangKyDoanhSoService {
    /**
     * Validate create input
     */
    validateCreateInput(input: CreateDangKyDoanhSoInput): CreateDangKyDoanhSoInput {
        const result = dangKyDoanhSoSchema.omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true }).safeParse(input)
        if (!result.success) {
            throw new Error(result.error.errors.map((e) => e.message).join(", "))
        }
        return result.data as CreateDangKyDoanhSoInput
    }

    /**
     * Build update payload from input
     */
    buildUpdatePayload(input: UpdateDangKyDoanhSoInput): Partial<DangKyDoanhSo> {
        const payload: Partial<DangKyDoanhSo> = {}
        const assignIfDefined = (key: keyof DangKyDoanhSo, value: any) => {
            if (value !== undefined) {
                ;(payload as any)[key] = value
            }
        }

        assignIfDefined("nam", input.nam as any)
        assignIfDefined("thang", input.thang as any)
        assignIfDefined("nhan_vien_id", input.nhan_vien_id as any)
        assignIfDefined("ten_nhan_vien", input.ten_nhan_vien as any)
        assignIfDefined("bac_dt", input.bac_dt as any)
        assignIfDefined("doanh_thu", input.doanh_thu as any)
        assignIfDefined("nhom_ap_doanh_thu_id", input.nhom_ap_doanh_thu_id as any)
        assignIfDefined("ten_nhom_ap_doanh_thu", input.ten_nhom_ap_doanh_thu as any)
        assignIfDefined("mo_ta", input.mo_ta as any)
        assignIfDefined("trao_doi", input.trao_doi as any)
        assignIfDefined("tg_cap_nhat", input.tg_cap_nhat as any)

        return payload
    }
}

