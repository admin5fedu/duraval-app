import { supabase } from "@/lib/supabase"
import { ThongTinCongTy, CreateThongTinCongTyInput, UpdateThongTinCongTyInput } from "../schema"

const TABLE_NAME = "var_cong_ty"

/**
 * API service for Thông Tin Công Ty
 * Handles all Supabase operations
 */
export class ThongTinCongTyAPI {
    /**
     * Get all thông tin công ty
     */
    static async getAll(): Promise<ThongTinCongTy[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("tg_tao", { ascending: false })

        if (error) {
            console.error("Lỗi khi tải danh sách thông tin công ty:", error)
            throw new Error(error.message)
        }

        return (data || []) as ThongTinCongTy[]
    }

    /**
     * Get thông tin công ty by ID
     */
    static async getById(id: number): Promise<ThongTinCongTy | null> {
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
            console.error("Lỗi khi tải chi tiết thông tin công ty:", error)
            throw new Error(error.message)
        }

        return data as ThongTinCongTy
    }

    /**
     * Create new thông tin công ty
     */
    static async create(input: CreateThongTinCongTyInput): Promise<ThongTinCongTy> {
        // Sanitize input: convert empty strings to null for optional fields
        const sanitizedInput = {
            ...input,
            ap_dung: input.ap_dung ?? false,
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(sanitizedInput)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo thông tin công ty:", error)
            throw new Error(error.message)
        }

        return data as ThongTinCongTy
    }

    /**
     * Update thông tin công ty
     */
    static async update(id: number, input: UpdateThongTinCongTyInput): Promise<ThongTinCongTy> {
        // Sanitize input: convert empty strings to null for optional fields
        const sanitizedInput: UpdateThongTinCongTyInput = {}
        if (input.ma_cong_ty !== undefined) sanitizedInput.ma_cong_ty = input.ma_cong_ty
        if (input.ten_cong_ty !== undefined) sanitizedInput.ten_cong_ty = input.ten_cong_ty
        if (input.ten_day_du !== undefined) sanitizedInput.ten_day_du = input.ten_day_du
        if (input.link_logo !== undefined) sanitizedInput.link_logo = input.link_logo
        if (input.dia_chi !== undefined) sanitizedInput.dia_chi = input.dia_chi
        if (input.so_dien_thoai !== undefined) sanitizedInput.so_dien_thoai = input.so_dien_thoai
        if (input.email !== undefined) sanitizedInput.email = input.email
        if (input.website !== undefined) sanitizedInput.website = input.website
        if (input.ap_dung !== undefined) sanitizedInput.ap_dung = input.ap_dung
        if (input.tg_cap_nhat !== undefined) sanitizedInput.tg_cap_nhat = input.tg_cap_nhat

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(sanitizedInput)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật thông tin công ty:", error)
            throw new Error(error.message)
        }

        return data as ThongTinCongTy
    }

    /**
     * Delete thông tin công ty
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa thông tin công ty:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete thông tin công ty
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt thông tin công ty:", error)
            throw new Error(error.message)
        }
    }
}

