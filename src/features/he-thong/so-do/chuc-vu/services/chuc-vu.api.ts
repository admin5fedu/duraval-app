import { supabase } from "@/lib/supabase"
import { ChucVu, CreateChucVuInput, UpdateChucVuInput } from "../schema"

const TABLE_NAME = "var_chuc_vu"

/**
 * API service for Chức Vụ
 * Handles all Supabase operations
 */
export class ChucVuAPI {
    /**
     * Get all chức vụ
     */
    static async getAll(): Promise<ChucVu[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("tg_tao", { ascending: false })

        if (error) {
            console.error("Lỗi khi tải danh sách chức vụ:", error)
            throw new Error(error.message)
        }

        return (data || []) as ChucVu[]
    }

    /**
     * Get chức vụ by ID
     */
    static async getById(id: number): Promise<ChucVu | null> {
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
            console.error("Lỗi khi tải chi tiết chức vụ:", error)
            throw new Error(error.message)
        }

        return data as ChucVu
    }

    /**
     * Create new chức vụ
     */
    static async create(input: CreateChucVuInput): Promise<ChucVu> {
        // Sanitize input: convert empty strings to null for optional fields
        const sanitizedInput = {
            ...input,
            ten_cap_bac: input.ten_cap_bac && input.ten_cap_bac.trim() !== "" ? input.ten_cap_bac : null,
            cap_bac: input.cap_bac || null,
            ngach_luong: input.ngach_luong && input.ngach_luong.trim() !== "" ? input.ngach_luong : null,
            so_ngay_nghi_thu_7: input.so_ngay_nghi_thu_7 && input.so_ngay_nghi_thu_7.trim() !== "" ? input.so_ngay_nghi_thu_7 : null,
            nhom_thuong: input.nhom_thuong && input.nhom_thuong.trim() !== "" ? input.nhom_thuong : null,
            muc_dong_bao_hiem: input.muc_dong_bao_hiem || null,
            diem_thuong: input.diem_thuong || null,
            phong_ban_id: input.phong_ban_id || null,
            cap_bac_id: input.cap_bac_id || null,
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(sanitizedInput)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo chức vụ:", error)
            throw new Error(error.message)
        }

        return data as ChucVu
    }

    /**
     * Update chức vụ
     */
    static async update(id: number, input: UpdateChucVuInput): Promise<ChucVu> {
        // Sanitize input: convert empty strings to null for optional fields
        const sanitizedInput: UpdateChucVuInput = {}
        if (input.ma_chuc_vu !== undefined) sanitizedInput.ma_chuc_vu = input.ma_chuc_vu
        if (input.ten_chuc_vu !== undefined) sanitizedInput.ten_chuc_vu = input.ten_chuc_vu
        if (input.cap_bac !== undefined) sanitizedInput.cap_bac = input.cap_bac || null
        if (input.ten_cap_bac !== undefined) {
            sanitizedInput.ten_cap_bac = input.ten_cap_bac && input.ten_cap_bac.trim() !== "" ? input.ten_cap_bac : null
        }
        if (input.ma_phong_ban !== undefined) sanitizedInput.ma_phong_ban = input.ma_phong_ban
        if (input.ngach_luong !== undefined) {
            sanitizedInput.ngach_luong = input.ngach_luong && input.ngach_luong.trim() !== "" ? input.ngach_luong : null
        }
        if (input.muc_dong_bao_hiem !== undefined) sanitizedInput.muc_dong_bao_hiem = input.muc_dong_bao_hiem || null
        if (input.so_ngay_nghi_thu_7 !== undefined) {
            sanitizedInput.so_ngay_nghi_thu_7 = input.so_ngay_nghi_thu_7 && input.so_ngay_nghi_thu_7.trim() !== "" ? input.so_ngay_nghi_thu_7 : null
        }
        if (input.nhom_thuong !== undefined) {
            sanitizedInput.nhom_thuong = input.nhom_thuong && input.nhom_thuong.trim() !== "" ? input.nhom_thuong : null
        }
        if (input.diem_thuong !== undefined) sanitizedInput.diem_thuong = input.diem_thuong || null
        if (input.phong_ban_id !== undefined) sanitizedInput.phong_ban_id = input.phong_ban_id || null
        if (input.cap_bac_id !== undefined) sanitizedInput.cap_bac_id = input.cap_bac_id || null
        if (input.tg_cap_nhat !== undefined) sanitizedInput.tg_cap_nhat = input.tg_cap_nhat

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(sanitizedInput)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật chức vụ:", error)
            throw new Error(error.message)
        }

        return data as ChucVu
    }

    /**
     * Delete chức vụ
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa chức vụ:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete chức vụ
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt chức vụ:", error)
            throw new Error(error.message)
        }
    }
}

