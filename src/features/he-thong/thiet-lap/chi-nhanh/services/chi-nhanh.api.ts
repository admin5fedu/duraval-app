import { supabase } from "@/lib/supabase"
import { ChiNhanh, CreateChiNhanhInput, UpdateChiNhanhInput } from "../schema"

const TABLE_NAME = "var_chi_nhanh"

/**
 * API service for Chi Nhánh
 * Handles all Supabase operations
 */
export class ChiNhanhAPI {
    /**
     * Get all chi nhánh
     */
    static async getAll(): Promise<ChiNhanh[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("tg_tao", { ascending: false })

        if (error) {
            console.error("Lỗi khi tải danh sách chi nhánh:", error)
            throw new Error(error.message)
        }

        return (data || []) as ChiNhanh[]
    }

    /**
     * Get chi nhánh by ID
     */
    static async getById(id: number): Promise<ChiNhanh | null> {
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
            console.error("Lỗi khi tải chi tiết chi nhánh:", error)
            throw new Error(error.message)
        }

        return data as ChiNhanh
    }

    /**
     * Create new chi nhánh
     */
    static async create(input: CreateChiNhanhInput): Promise<ChiNhanh> {
        // Sanitize input: convert empty strings to null for optional fields
        const sanitizedInput = {
            ...input,
            dia_chi: input.dia_chi && input.dia_chi.trim() !== "" ? input.dia_chi : null,
            dinh_vi: input.dinh_vi && input.dinh_vi.trim() !== "" ? input.dinh_vi : null,
            hinh_anh: input.hinh_anh && input.hinh_anh.trim() !== "" ? input.hinh_anh : null,
            mo_ta: input.mo_ta && input.mo_ta.trim() !== "" ? input.mo_ta : null,
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(sanitizedInput)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo chi nhánh:", error)
            throw new Error(error.message)
        }

        return data as ChiNhanh
    }

    /**
     * Update chi nhánh
     */
    static async update(id: number, input: UpdateChiNhanhInput): Promise<ChiNhanh> {
        // Sanitize input: convert empty strings to null for optional fields
        const sanitizedInput: UpdateChiNhanhInput = {}
        if (input.ma_chi_nhanh !== undefined) sanitizedInput.ma_chi_nhanh = input.ma_chi_nhanh
        if (input.ten_chi_nhanh !== undefined) sanitizedInput.ten_chi_nhanh = input.ten_chi_nhanh
        if (input.dia_chi !== undefined) {
            sanitizedInput.dia_chi = input.dia_chi && input.dia_chi.trim() !== "" ? input.dia_chi : null
        }
        if (input.dinh_vi !== undefined) {
            sanitizedInput.dinh_vi = input.dinh_vi && input.dinh_vi.trim() !== "" ? input.dinh_vi : null
        }
        if (input.hinh_anh !== undefined) {
            sanitizedInput.hinh_anh = input.hinh_anh && input.hinh_anh.trim() !== "" ? input.hinh_anh : null
        }
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
            console.error("Lỗi khi cập nhật chi nhánh:", error)
            throw new Error(error.message)
        }

        return data as ChiNhanh
    }

    /**
     * Delete chi nhánh
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa chi nhánh:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete chi nhánh
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt chi nhánh:", error)
            throw new Error(error.message)
        }
    }
}

