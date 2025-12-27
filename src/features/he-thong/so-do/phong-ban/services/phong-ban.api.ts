import { supabase } from "@/lib/supabase"
import { PhongBan, CreatePhongBanInput, UpdatePhongBanInput } from "../schema"

const TABLE_NAME = "var_phong_ban"

/**
 * API service for Phòng Ban
 * Handles all Supabase operations
 */
export class PhongBanAPI {
    /**
     * Get all phòng ban
     */
    static async getAll(): Promise<PhongBan[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("tg_tao", { ascending: false })

        if (error) {
            console.error("Lỗi khi tải danh sách phòng ban:", error)
            throw new Error(error.message)
        }

        return (data || []) as PhongBan[]
    }

    /**
     * Get phòng ban by ID
     */
    static async getById(id: number): Promise<PhongBan | null> {
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
            console.error("Lỗi khi tải chi tiết phòng ban:", error)
            throw new Error(error.message)
        }

        return data as PhongBan
    }

    /**
     * Create new phòng ban
     */
    static async create(input: CreatePhongBanInput): Promise<PhongBan> {
        // Sanitize input: convert empty strings to null for optional fields
        const sanitizedInput = {
            ...input,
            tt: input.tt || null,
            truc_thuoc_phong_ban: input.truc_thuoc_phong_ban && input.truc_thuoc_phong_ban.trim() !== "" ? input.truc_thuoc_phong_ban : null,
            truc_thuoc_id: input.truc_thuoc_id || null,
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(sanitizedInput)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo phòng ban:", error)
            throw new Error(error.message)
        }

        return data as PhongBan
    }

    /**
     * Update phòng ban
     */
    static async update(id: number, input: UpdatePhongBanInput): Promise<PhongBan> {
        // Sanitize input: convert empty strings to null for optional fields
        const sanitizedInput: UpdatePhongBanInput = {}
        if (input.tt !== undefined) sanitizedInput.tt = input.tt || null
        if (input.ma_phong_ban !== undefined) sanitizedInput.ma_phong_ban = input.ma_phong_ban
        if (input.ten_phong_ban !== undefined) sanitizedInput.ten_phong_ban = input.ten_phong_ban
        if (input.cap_do !== undefined) sanitizedInput.cap_do = input.cap_do
        if (input.truc_thuoc_phong_ban !== undefined) {
            sanitizedInput.truc_thuoc_phong_ban = input.truc_thuoc_phong_ban && input.truc_thuoc_phong_ban.trim() !== "" ? input.truc_thuoc_phong_ban : null
        }
        if (input.truc_thuoc_id !== undefined) {
            sanitizedInput.truc_thuoc_id = input.truc_thuoc_id || null
        }
        if (input.tg_cap_nhat !== undefined) sanitizedInput.tg_cap_nhat = input.tg_cap_nhat

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(sanitizedInput)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật phòng ban:", error)
            throw new Error(error.message)
        }

        return data as PhongBan
    }

    /**
     * Delete phòng ban
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa phòng ban:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete phòng ban
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt phòng ban:", error)
            throw new Error(error.message)
        }
    }
}

