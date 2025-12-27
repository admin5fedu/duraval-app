import { supabase } from "@/lib/supabase"
import { CapBac, CreateCapBacInput, UpdateCapBacInput } from "../schema"

const TABLE_NAME = "var_cap_bac"

/**
 * API service for Cấp Bậc
 * Handles all Supabase operations
 */
export class CapBacAPI {
    /**
     * Get all cấp bậc
     */
    static async getAll(): Promise<CapBac[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("bac", { ascending: true })

        if (error) {
            console.error("Lỗi khi tải danh sách cấp bậc:", error)
            throw new Error(error.message)
        }

        return (data || []) as CapBac[]
    }

    /**
     * Get cấp bậc by ID
     */
    static async getById(id: number): Promise<CapBac | null> {
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
            console.error("Lỗi khi tải chi tiết cấp bậc:", error)
            throw new Error(error.message)
        }

        return data as CapBac
    }

    /**
     * Create new cấp bậc
     */
    static async create(input: CreateCapBacInput): Promise<CapBac> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(input)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo cấp bậc:", error)
            throw new Error(error.message)
        }

        return data as CapBac
    }

    /**
     * Update cấp bậc
     */
    static async update(id: number, input: UpdateCapBacInput): Promise<CapBac> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(input)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật cấp bậc:", error)
            throw new Error(error.message)
        }

        return data as CapBac
    }

    /**
     * Delete cấp bậc
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa cấp bậc:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete cấp bậc
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt cấp bậc:", error)
            throw new Error(error.message)
        }
    }
}

