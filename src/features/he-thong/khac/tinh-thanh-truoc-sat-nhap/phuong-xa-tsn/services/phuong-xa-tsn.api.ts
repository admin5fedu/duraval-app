import { supabase } from "@/lib/supabase"
import { PhuongXaTSN, CreatePhuongXaTSNInput, UpdatePhuongXaTSNInput } from "../schema"

const TABLE_NAME = "var_tsn_phuong_xa"

/**
 * API service for Phường Xã TSN
 * Handles all Supabase operations
 */
export class PhuongXaTSNAPI {
    /**
     * Get all phường xã TSN
     */
    static async getAll(): Promise<PhuongXaTSN[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("tg_tao", { ascending: false })

        if (error) {
            console.error("Lỗi khi tải danh sách phường xã TSN:", error)
            throw new Error(error.message)
        }

        if (!data || data.length === 0) {
            return []
        }

        return data as PhuongXaTSN[]
    }

    /**
     * Get phường xã TSN by ID
     */
    static async getById(id: number): Promise<PhuongXaTSN | null> {
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
            console.error("Lỗi khi tải chi tiết phường xã TSN:", error)
            throw new Error(error.message)
        }

        if (!data) {
            return null
        }

        return data as PhuongXaTSN
    }

    /**
     * Create new phường xã TSN
     */
    static async create(input: CreatePhuongXaTSNInput): Promise<PhuongXaTSN> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(input)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo phường xã TSN:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi tạo phường xã TSN")
        }

        return data as PhuongXaTSN
    }

    /**
     * Update phường xã TSN
     */
    static async update(id: number, input: UpdatePhuongXaTSNInput): Promise<PhuongXaTSN> {
        // Validate input
        if (!input || typeof input !== 'object') {
            throw new Error("Input không hợp lệ")
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(input)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật phường xã TSN:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi cập nhật phường xã TSN")
        }

        return data as PhuongXaTSN
    }

    /**
     * Delete phường xã TSN
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa phường xã TSN:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete phường xã TSN
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt phường xã TSN:", error)
            throw new Error(error.message)
        }
    }
}

