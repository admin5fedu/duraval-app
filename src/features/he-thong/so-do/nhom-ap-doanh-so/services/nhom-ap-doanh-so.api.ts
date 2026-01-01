import { supabase } from "@/lib/supabase"
import { NhomApDoanhSo, CreateNhomApDoanhSoInput, UpdateNhomApDoanhSoInput } from "../schema"

const TABLE_NAME = "var_nhom_ap_doanh_so"

/**
 * API service for Nhóm Áp Doanh Số
 * Handles all Supabase operations
 */
export class NhomApDoanhSoAPI {
    /**
     * Get all nhóm áp doanh số
     */
    static async getAll(): Promise<NhomApDoanhSo[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("tg_tao", { ascending: false })

        if (error) {
            console.error("Lỗi khi tải danh sách nhóm áp doanh số:", error)
            throw new Error(error.message)
        }

        return (data || []) as NhomApDoanhSo[]
    }

    /**
     * Get nhóm áp doanh số by ID
     */
    static async getById(id: number): Promise<NhomApDoanhSo | null> {
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
            console.error("Lỗi khi tải chi tiết nhóm áp doanh số:", error)
            throw new Error(error.message)
        }

        return data as NhomApDoanhSo
    }

    /**
     * Create new nhóm áp doanh số
     */
    static async create(input: CreateNhomApDoanhSoInput & { nguoi_tao_id?: number | null }): Promise<NhomApDoanhSo> {
        // Sanitize input: convert empty strings to null for optional fields
        const sanitizedInput = {
            ...input,
            mo_ta: input.mo_ta && input.mo_ta.trim() !== "" ? input.mo_ta : null,
            nguoi_tao_id: input.nguoi_tao_id || null,
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(sanitizedInput)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo nhóm áp doanh số:", error)
            throw new Error(error.message)
        }

        return data as NhomApDoanhSo
    }

    /**
     * Update nhóm áp doanh số
     */
    static async update(id: number, input: UpdateNhomApDoanhSoInput): Promise<NhomApDoanhSo> {
        // Sanitize input: convert empty strings to null for optional fields
        const sanitizedInput: UpdateNhomApDoanhSoInput = {}
        if (input.ma_nhom_ap !== undefined) sanitizedInput.ma_nhom_ap = input.ma_nhom_ap
        if (input.ten_nhom_ap !== undefined) sanitizedInput.ten_nhom_ap = input.ten_nhom_ap
        if (input.mo_ta !== undefined) {
            sanitizedInput.mo_ta = input.mo_ta && input.mo_ta.trim() !== "" ? input.mo_ta : null
        }
        if (input.tg_cap_nhat !== undefined) sanitizedInput.tg_cap_nhat = input.tg_cap_nhat

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(sanitizedInput)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật nhóm áp doanh số:", error)
            throw new Error(error.message)
        }

        return data as NhomApDoanhSo
    }

    /**
     * Delete nhóm áp doanh số
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa nhóm áp doanh số:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete nhóm áp doanh số
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt nhóm áp doanh số:", error)
            throw new Error(error.message)
        }
    }
}

