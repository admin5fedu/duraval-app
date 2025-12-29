import { supabase } from "@/lib/supabase"
import { NhanSu, CreateNhanSuInput, UpdateNhanSuInput } from "../schema"

const TABLE_NAME = "var_nhan_su"

/**
 * API service for Nhân Sự
 * Handles all Supabase operations
 */
export class NhanSuAPI {
    /**
     * Get all employees
     */
    static async getAll(): Promise<NhanSu[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("ma_nhan_vien", { ascending: false })

        if (error) {
            console.error("Lỗi khi tải danh sách nhân sự:", error)
            throw new Error(error.message)
        }

        return (data || []) as NhanSu[]
    }

    /**
     * Get employee by ID
     */
    static async getById(ma_nhan_vien: number): Promise<NhanSu | null> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .eq("ma_nhan_vien", ma_nhan_vien)
            .single()

        if (error) {
            if (error.code === "PGRST116") {
                // Not found
                return null
            }
            console.error("Lỗi khi tải chi tiết nhân sự:", error)
            throw new Error(error.message)
        }

        return data as NhanSu
    }

    /**
     * Get employee by email (email_cong_ty)
     * Uses ilike for case-insensitive matching
     */
    static async getByEmail(email: string): Promise<NhanSu | null> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .ilike("email_cong_ty", email)
            .single()

        if (error) {
            if (error.code === "PGRST116") {
                // Not found
                return null
            }
            // Handle rate limit errors gracefully
            if ((error as any).status === 429 || (error as any).code === 'over_request_rate_limit') {
                console.warn('Rate limit reached when fetching employee by email')
                return null
            }
            console.error("Lỗi khi tải thông tin nhân sự theo email:", error)
            return null
        }

        return data as NhanSu
    }

    /**
     * Create new employee
     */
    static async create(input: CreateNhanSuInput): Promise<NhanSu> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(input)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo nhân sự:", error)
            throw new Error(error.message)
        }

        return data as NhanSu
    }

    /**
     * Update employee
     */
    static async update(ma_nhan_vien: number, input: UpdateNhanSuInput): Promise<NhanSu> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(input)
            .eq("ma_nhan_vien", ma_nhan_vien)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật nhân sự:", error)
            throw new Error(error.message)
        }

        return data as NhanSu
    }

    /**
     * Delete employee
     */
    static async delete(ma_nhan_vien: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("ma_nhan_vien", ma_nhan_vien)

        if (error) {
            console.error("Lỗi khi xóa nhân sự:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete employees
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("ma_nhan_vien", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt nhân sự:", error)
            throw new Error(error.message)
        }
    }
}

