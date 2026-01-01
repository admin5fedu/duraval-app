import { supabase } from "@/lib/supabase"
import { DangKyDoanhSo, CreateDangKyDoanhSoInput, UpdateDangKyDoanhSoInput } from "../schema"

const TABLE_NAME = "var_dk_doanh_so"

/**
 * API service for Đăng Ký Doanh Số
 * Handles all Supabase operations
 */
export class DangKyDoanhSoAPI {
    /**
     * Get all đăng ký doanh số
     */
    static async getAll(): Promise<DangKyDoanhSo[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("tg_tao", { ascending: false })

        if (error) {
            console.error("Lỗi khi tải danh sách đăng ký doanh số:", error)
            throw new Error(error.message)
        }

        return (data || []) as DangKyDoanhSo[]
    }

    /**
     * Get đăng ký doanh số by ID
     */
    static async getById(id: number): Promise<DangKyDoanhSo | null> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .eq("id", id)
            .single()

        if (error) {
            if (error.code === "PGRST116") {
                // Not found
                return null
            }
            console.error("Lỗi khi tải chi tiết đăng ký doanh số:", error)
            throw new Error(error.message)
        }

        return data as DangKyDoanhSo
    }

    /**
     * Create new đăng ký doanh số
     */
    static async create(input: CreateDangKyDoanhSoInput & { nguoi_tao_id?: number | null }): Promise<DangKyDoanhSo> {
        // Sanitize input: convert empty strings to null for optional fields
        const sanitizedInput = {
            ...input,
            ten_nhan_vien: input.ten_nhan_vien && input.ten_nhan_vien.trim() !== "" ? input.ten_nhan_vien : null,
            bac_dt: input.bac_dt && input.bac_dt.trim() !== "" ? input.bac_dt : null,
            ten_nhom_ap_doanh_thu: input.ten_nhom_ap_doanh_thu && input.ten_nhom_ap_doanh_thu.trim() !== "" ? input.ten_nhom_ap_doanh_thu : null,
            phong_id: input.phong_id ?? null,
            ma_phong: input.ma_phong && input.ma_phong.trim() !== "" ? input.ma_phong : null,
            nhom_id: input.nhom_id ?? null,
            ma_nhom: input.ma_nhom && input.ma_nhom.trim() !== "" ? input.ma_nhom : null,
            mo_ta: input.mo_ta && input.mo_ta.trim() !== "" ? input.mo_ta : null,
            trao_doi: input.trao_doi || null,
            nguoi_tao_id: input.nguoi_tao_id || null,
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(sanitizedInput)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo đăng ký doanh số:", error)
            throw new Error(error.message)
        }

        return data as DangKyDoanhSo
    }

    /**
     * Update đăng ký doanh số
     */
    static async update(id: number, input: UpdateDangKyDoanhSoInput): Promise<DangKyDoanhSo> {
        // Sanitize input: convert empty strings to null for optional fields
        const sanitizedInput: UpdateDangKyDoanhSoInput = {}
        if (input.nam !== undefined) sanitizedInput.nam = input.nam
        if (input.thang !== undefined) sanitizedInput.thang = input.thang
        if (input.nhan_vien_id !== undefined) sanitizedInput.nhan_vien_id = input.nhan_vien_id
        if (input.ten_nhan_vien !== undefined) {
            sanitizedInput.ten_nhan_vien = input.ten_nhan_vien && input.ten_nhan_vien.trim() !== "" ? input.ten_nhan_vien : null
        }
        if (input.bac_dt !== undefined) {
            sanitizedInput.bac_dt = input.bac_dt && input.bac_dt.trim() !== "" ? input.bac_dt : undefined
        }
        if (input.doanh_thu !== undefined) sanitizedInput.doanh_thu = input.doanh_thu
        if (input.nhom_ap_doanh_thu_id !== undefined) sanitizedInput.nhom_ap_doanh_thu_id = input.nhom_ap_doanh_thu_id
        if (input.ten_nhom_ap_doanh_thu !== undefined) {
            sanitizedInput.ten_nhom_ap_doanh_thu = input.ten_nhom_ap_doanh_thu && input.ten_nhom_ap_doanh_thu.trim() !== "" ? input.ten_nhom_ap_doanh_thu : null
        }
        if (input.phong_id !== undefined) sanitizedInput.phong_id = input.phong_id ?? null
        if (input.ma_phong !== undefined) {
            sanitizedInput.ma_phong = input.ma_phong && input.ma_phong.trim() !== "" ? input.ma_phong : null
        }
        if (input.nhom_id !== undefined) sanitizedInput.nhom_id = input.nhom_id ?? null
        if (input.ma_nhom !== undefined) {
            sanitizedInput.ma_nhom = input.ma_nhom && input.ma_nhom.trim() !== "" ? input.ma_nhom : null
        }
        if (input.mo_ta !== undefined) {
            sanitizedInput.mo_ta = input.mo_ta && input.mo_ta.trim() !== "" ? input.mo_ta : null
        }
        if (input.trao_doi !== undefined) sanitizedInput.trao_doi = input.trao_doi
        if (input.tg_cap_nhat !== undefined) sanitizedInput.tg_cap_nhat = input.tg_cap_nhat

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(sanitizedInput)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật đăng ký doanh số:", error)
            throw new Error(error.message)
        }

        return data as DangKyDoanhSo
    }

    /**
     * Delete đăng ký doanh số
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa đăng ký doanh số:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete đăng ký doanh số
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt đăng ký doanh số:", error)
            throw new Error(error.message)
        }
    }
}

