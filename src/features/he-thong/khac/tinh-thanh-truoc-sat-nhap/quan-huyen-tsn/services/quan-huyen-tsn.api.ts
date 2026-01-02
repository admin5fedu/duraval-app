import { supabase } from "@/lib/supabase"
import { QuanHuyenTSN, CreateQuanHuyenTSNInput, UpdateQuanHuyenTSNInput } from "../schema"

const TABLE_NAME = "var_tsn_quan_huyen"

/**
 * API service for Quận huyện TSN
 * Handles all Supabase operations
 */
export class QuanHuyenTSNAPI {
    /**
     * Get all quận huyện TSN
     */
    static async getAll(): Promise<QuanHuyenTSN[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("tg_tao", { ascending: false })

        if (error) {
            console.error("Lỗi khi tải danh sách quận huyện TSN:", error)
            throw new Error(error.message)
        }

        if (!data || data.length === 0) {
            return []
        }

        return data as QuanHuyenTSN[]
    }

    /**
     * Get quận huyện TSN by ID
     */
    static async getById(id: number): Promise<QuanHuyenTSN | null> {
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
            console.error("Lỗi khi tải chi tiết quận huyện TSN:", error)
            throw new Error(error.message)
        }

        if (!data) {
            return null
        }

        return data as QuanHuyenTSN
    }

    /**
     * Create new quận huyện TSN
     */
    static async create(input: CreateQuanHuyenTSNInput): Promise<QuanHuyenTSN> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(input)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo quận huyện TSN:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi tạo quận huyện TSN")
        }

        return data as QuanHuyenTSN
    }

    /**
     * Update quận huyện TSN
     */
    static async update(id: number, input: UpdateQuanHuyenTSNInput): Promise<QuanHuyenTSN> {
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
            console.error("Lỗi khi cập nhật quận huyện TSN:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi cập nhật quận huyện TSN")
        }

        return data as QuanHuyenTSN
    }

    /**
     * Delete quận huyện TSN
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa quận huyện TSN:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete quận huyện TSN
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt quận huyện TSN:", error)
            throw new Error(error.message)
        }
    }
}

