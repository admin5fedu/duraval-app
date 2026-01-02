import { supabase } from "@/lib/supabase"
import { PhuongXaSNN, CreatePhuongXaSNNInput, UpdatePhuongXaSNNInput } from "../schema"

const TABLE_NAME = "var_ssn_phuong_xa"

/**
 * API service for Phường Xã SNN
 * Handles all Supabase operations
 */
export class PhuongXaSNNAPI {
    /**
     * Get all phường xã SNN
     */
    static async getAll(): Promise<PhuongXaSNN[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("tg_tao", { ascending: false })

        if (error) {
            console.error("Lỗi khi tải danh sách phường xã SNN:", error)
            throw new Error(error.message)
        }

        if (!data || data.length === 0) {
            return []
        }

        return data as PhuongXaSNN[]
    }

    /**
     * Get phường xã SNN by ID
     */
    static async getById(id: number): Promise<PhuongXaSNN | null> {
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
            console.error("Lỗi khi tải chi tiết phường xã SNN:", error)
            throw new Error(error.message)
        }

        if (!data) {
            return null
        }

        return data as PhuongXaSNN
    }

    /**
     * Create new phường xã SNN
     */
    static async create(input: CreatePhuongXaSNNInput): Promise<PhuongXaSNN> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(input)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo phường xã SNN:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi tạo phường xã SNN")
        }

        return data as PhuongXaSNN
    }

    /**
     * Update phường xã SNN
     */
    static async update(id: number, input: UpdatePhuongXaSNNInput): Promise<PhuongXaSNN> {
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
            console.error("Lỗi khi cập nhật phường xã SNN:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi cập nhật phường xã SNN")
        }

        return data as PhuongXaSNN
    }

    /**
     * Delete phường xã SNN
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa phường xã SNN:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete phường xã SNN
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt phường xã SNN:", error)
            throw new Error(error.message)
        }
    }
}

