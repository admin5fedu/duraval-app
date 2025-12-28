import { supabase } from "@/lib/supabase"
import { KeHoach168, CreateKeHoach168Input, UpdateKeHoach168Input } from "../schema"

const TABLE_NAME = "cong_viec_viec_hang_ngay"

/**
 * API service for Kế Hoạch 168
 * Handles all Supabase operations
 */
export class KeHoach168API {
    /**
     * Get all kế hoạch 168
     */
    static async getAll(): Promise<KeHoach168[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("ngay_bao_cao", { ascending: false })
            .order("tg_tao", { ascending: false })
            .range(0, 99999) // Get up to 100k rows

        if (error) {
            console.error("Lỗi khi tải danh sách kế hoạch 168:", error)
            throw new Error(error.message)
        }

        // Ensure IDs are numbers
        const normalizedData = (data || []).map(item => ({
            ...item,
            id: typeof item.id === 'string' ? parseInt(item.id, 10) : item.id,
            ma_nhan_vien: typeof item.ma_nhan_vien === 'string' ? parseInt(item.ma_nhan_vien, 10) : item.ma_nhan_vien,
            phong_ban_id: item.phong_ban_id && typeof item.phong_ban_id === 'string' 
                ? parseInt(item.phong_ban_id, 10) 
                : item.phong_ban_id,
        })) as KeHoach168[]

        return normalizedData
    }

    /**
     * Get kế hoạch 168 by ID
     */
    static async getById(id: number): Promise<KeHoach168 | null> {
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
            console.error("Lỗi khi tải chi tiết kế hoạch 168:", error)
            throw new Error(error.message)
        }

        // Normalize IDs
        if (data) {
            return {
                ...data,
                id: typeof data.id === 'string' ? parseInt(data.id, 10) : data.id,
                ma_nhan_vien: typeof data.ma_nhan_vien === 'string' ? parseInt(data.ma_nhan_vien, 10) : data.ma_nhan_vien,
                phong_ban_id: data.phong_ban_id && typeof data.phong_ban_id === 'string'
                    ? parseInt(data.phong_ban_id, 10)
                    : data.phong_ban_id,
            } as KeHoach168
        }

        return null
    }

    /**
     * Create new kế hoạch 168
     */
    static async create(input: CreateKeHoach168Input): Promise<KeHoach168> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert([input])
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo kế hoạch 168:", error)
            throw new Error(error.message)
        }

        // Normalize IDs
        return {
            ...data,
            id: typeof data.id === 'string' ? parseInt(data.id, 10) : data.id,
            ma_nhan_vien: typeof data.ma_nhan_vien === 'string' ? parseInt(data.ma_nhan_vien, 10) : data.ma_nhan_vien,
            phong_ban_id: data.phong_ban_id && typeof data.phong_ban_id === 'string'
                ? parseInt(data.phong_ban_id, 10)
                : data.phong_ban_id,
        } as KeHoach168
    }

    /**
     * Update kế hoạch 168
     */
    static async update(id: number, input: UpdateKeHoach168Input): Promise<KeHoach168> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(input)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật kế hoạch 168:", error)
            throw new Error(error.message)
        }

        // Normalize IDs
        return {
            ...data,
            id: typeof data.id === 'string' ? parseInt(data.id, 10) : data.id,
            ma_nhan_vien: typeof data.ma_nhan_vien === 'string' ? parseInt(data.ma_nhan_vien, 10) : data.ma_nhan_vien,
            phong_ban_id: data.phong_ban_id && typeof data.phong_ban_id === 'string'
                ? parseInt(data.phong_ban_id, 10)
                : data.phong_ban_id,
        } as KeHoach168
    }

    /**
     * Delete kế hoạch 168
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa kế hoạch 168:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete kế hoạch 168
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt kế hoạch 168:", error)
            throw new Error(error.message)
        }
    }
}

