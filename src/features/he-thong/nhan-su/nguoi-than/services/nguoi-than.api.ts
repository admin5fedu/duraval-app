import { supabase } from "@/lib/supabase"
import { NguoiThan, CreateNguoiThanInput, UpdateNguoiThanInput } from "../schema"

const TABLE_NAME = "var_nguoi_than"

/**
 * API service for Người Thân
 * Handles all Supabase operations
 */
export class NguoiThanAPI {
    /**
     * Get all người thân
     */
    static async getAll(): Promise<NguoiThan[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("tg_tao", { ascending: false })

        if (error) {
            console.error("Lỗi khi tải danh sách người thân:", error)
            throw new Error(error.message)
        }

        return (data || []) as NguoiThan[]
    }

    /**
     * Get người thân by ID
     */
    static async getById(id: number): Promise<NguoiThan | null> {
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
            console.error("Lỗi khi tải chi tiết người thân:", error)
            throw new Error(error.message)
        }

        return data as NguoiThan
    }

    /**
     * Get người thân by mã nhân viên
     */
    static async getByMaNhanVien(ma_nhan_vien: number): Promise<NguoiThan[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .eq("ma_nhan_vien", ma_nhan_vien)
            .order("tg_tao", { ascending: false })

        if (error) {
            console.error("Lỗi khi tải danh sách người thân theo mã nhân viên:", error)
            throw new Error(error.message)
        }

        return (data || []) as NguoiThan[]
    }

    /**
     * Create new người thân
     */
    static async create(input: CreateNguoiThanInput): Promise<NguoiThan> {
        // Sanitize input: convert empty strings to null for optional fields
        const sanitizedInput = {
            ...input,
            ngay_sinh: input.ngay_sinh && input.ngay_sinh.trim() !== "" ? input.ngay_sinh : null,
            so_dien_thoai: input.so_dien_thoai && input.so_dien_thoai.trim() !== "" ? input.so_dien_thoai : null,
            ghi_chu: input.ghi_chu && input.ghi_chu.trim() !== "" ? input.ghi_chu : null,
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(sanitizedInput)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo người thân:", error)
            throw new Error(error.message)
        }

        return data as NguoiThan
    }

    /**
     * Update người thân
     */
    static async update(id: number, input: UpdateNguoiThanInput): Promise<NguoiThan> {
        // Sanitize input: convert empty strings to null for optional fields
        const sanitizedInput: UpdateNguoiThanInput = {}
        if (input.ho_va_ten !== undefined) sanitizedInput.ho_va_ten = input.ho_va_ten
        if (input.moi_quan_he !== undefined) sanitizedInput.moi_quan_he = input.moi_quan_he
        if (input.ngay_sinh !== undefined) {
            sanitizedInput.ngay_sinh = input.ngay_sinh && input.ngay_sinh.trim() !== "" ? input.ngay_sinh : null
        }
        if (input.so_dien_thoai !== undefined) {
            sanitizedInput.so_dien_thoai = input.so_dien_thoai && input.so_dien_thoai.trim() !== "" ? input.so_dien_thoai : null
        }
        if (input.ghi_chu !== undefined) {
            sanitizedInput.ghi_chu = input.ghi_chu && input.ghi_chu.trim() !== "" ? input.ghi_chu : null
        }
        if (input.tg_cap_nhat !== undefined) sanitizedInput.tg_cap_nhat = input.tg_cap_nhat

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(sanitizedInput)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật người thân:", error)
            throw new Error(error.message)
        }

        return data as NguoiThan
    }

    /**
     * Delete người thân
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa người thân:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete người thân
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt người thân:", error)
            throw new Error(error.message)
        }
    }
}

