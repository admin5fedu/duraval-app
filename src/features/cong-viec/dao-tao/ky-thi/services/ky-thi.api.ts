import { supabase } from "@/lib/supabase"
import { KyThi, CreateKyThiInput, UpdateKyThiInput } from "../schema"

const TABLE_NAME = "dao_tao_ky_thi"

/**
 * API service for Kỳ thi
 * Handles all Supabase operations
 */
export class KyThiAPI {
    /**
     * Get all kỳ thi
     */
    static async getAll(): Promise<KyThi[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("ngay", { ascending: false })

        if (error) {
            console.error("Lỗi khi tải danh sách kỳ thi:", error)
            throw new Error(error.message)
        }

        if (!data || data.length === 0) {
            return []
        }

        // Normalize array fields
        return data.map((item: any) => ({
            ...item,
            nhom_chuyen_de_ids: Array.isArray(item.nhom_chuyen_de_ids) 
                ? item.nhom_chuyen_de_ids.map((id: any) => typeof id === 'string' ? parseInt(id, 10) : id).filter((id: any) => !isNaN(id))
                : [],
            chuyen_de_ids: Array.isArray(item.chuyen_de_ids)
                ? item.chuyen_de_ids.map((id: any) => typeof id === 'string' ? parseInt(id, 10) : id).filter((id: any) => !isNaN(id))
                : [],
            chuc_vu_ids: Array.isArray(item.chuc_vu_ids)
                ? item.chuc_vu_ids.map((id: any) => typeof id === 'string' ? parseInt(id, 10) : id).filter((id: any) => !isNaN(id))
                : (item.chuc_vu_ids ? [] : null),
        })) as KyThi[]
    }

    /**
     * Get kỳ thi by ID
     */
    static async getById(id: number): Promise<KyThi | null> {
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
            console.error("Lỗi khi tải chi tiết kỳ thi:", error)
            throw new Error(error.message)
        }

        if (!data) {
            return null
        }

        // Normalize array fields
        return {
            ...data,
            nhom_chuyen_de_ids: Array.isArray(data.nhom_chuyen_de_ids)
                ? data.nhom_chuyen_de_ids.map((id: any) => typeof id === 'string' ? parseInt(id, 10) : id).filter((id: any) => !isNaN(id))
                : [],
            chuyen_de_ids: Array.isArray(data.chuyen_de_ids)
                ? data.chuyen_de_ids.map((id: any) => typeof id === 'string' ? parseInt(id, 10) : id).filter((id: any) => !isNaN(id))
                : [],
            chuc_vu_ids: Array.isArray(data.chuc_vu_ids)
                ? data.chuc_vu_ids.map((id: any) => typeof id === 'string' ? parseInt(id, 10) : id).filter((id: any) => !isNaN(id))
                : (data.chuc_vu_ids ? [] : null),
        } as KyThi
    }

    /**
     * Create new kỳ thi
     */
    static async create(input: CreateKyThiInput): Promise<KyThi> {
        // Validate input
        if (!input.ngay || !String(input.ngay).trim()) {
            throw new Error("Ngày là bắt buộc")
        }

        if (!input.ten_ky_thi || !String(input.ten_ky_thi).trim()) {
            throw new Error("Tên kỳ thi là bắt buộc")
        }

        if (!input.nguoi_tao_id || input.nguoi_tao_id <= 0) {
            throw new Error("Người tạo là bắt buộc")
        }

        if (!input.so_cau_hoi || input.so_cau_hoi <= 0) {
            throw new Error("Số câu hỏi phải lớn hơn 0")
        }

        if (!input.so_phut_lam_bai || input.so_phut_lam_bai <= 0) {
            throw new Error("Số phút làm bài phải lớn hơn 0")
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert({
                ...input,
                ten_ky_thi: input.ten_ky_thi.trim(),
                nhom_chuyen_de_ids: input.nhom_chuyen_de_ids && input.nhom_chuyen_de_ids.length > 0 ? input.nhom_chuyen_de_ids : [],
                chuyen_de_ids: input.chuyen_de_ids && input.chuyen_de_ids.length > 0 ? input.chuyen_de_ids : [],
                chuc_vu_ids: input.chuc_vu_ids && input.chuc_vu_ids.length > 0 ? input.chuc_vu_ids : null,
                ghi_chu: input.ghi_chu?.trim() || null,
                trang_thai: input.trang_thai || "Mở",
            })
            .select("*")
            .single()

        if (error) {
            console.error("Lỗi khi tạo kỳ thi:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi tạo kỳ thi")
        }

        // Normalize array fields
        return {
            ...data,
            nhom_chuyen_de_ids: Array.isArray(data.nhom_chuyen_de_ids)
                ? data.nhom_chuyen_de_ids.map((id: any) => typeof id === 'string' ? parseInt(id, 10) : id).filter((id: any) => !isNaN(id))
                : [],
            chuyen_de_ids: Array.isArray(data.chuyen_de_ids)
                ? data.chuyen_de_ids.map((id: any) => typeof id === 'string' ? parseInt(id, 10) : id).filter((id: any) => !isNaN(id))
                : [],
            chuc_vu_ids: Array.isArray(data.chuc_vu_ids)
                ? data.chuc_vu_ids.map((id: any) => typeof id === 'string' ? parseInt(id, 10) : id).filter((id: any) => !isNaN(id))
                : (data.chuc_vu_ids ? [] : null),
        } as KyThi
    }

    /**
     * Update kỳ thi
     */
    static async update(id: number, input: UpdateKyThiInput): Promise<KyThi> {
        // Validate input
        if (!input || typeof input !== 'object') {
            throw new Error("Input không hợp lệ")
        }

        if (input.so_cau_hoi !== undefined && input.so_cau_hoi <= 0) {
            throw new Error("Số câu hỏi phải lớn hơn 0")
        }

        if (input.so_phut_lam_bai !== undefined && input.so_phut_lam_bai <= 0) {
            throw new Error("Số phút làm bài phải lớn hơn 0")
        }
        
        // Add update timestamp and sanitize
        const sanitizedInput: any = {
            ...input,
            ten_ky_thi: input.ten_ky_thi?.trim(),
            nhom_chuyen_de_ids: input.nhom_chuyen_de_ids !== undefined
                ? (input.nhom_chuyen_de_ids && input.nhom_chuyen_de_ids.length > 0 ? input.nhom_chuyen_de_ids : [])
                : undefined,
            chuyen_de_ids: input.chuyen_de_ids !== undefined
                ? (input.chuyen_de_ids && input.chuyen_de_ids.length > 0 ? input.chuyen_de_ids : [])
                : undefined,
            chuc_vu_ids: input.chuc_vu_ids !== undefined
                ? (input.chuc_vu_ids && input.chuc_vu_ids.length > 0 ? input.chuc_vu_ids : null)
                : undefined,
            ghi_chu: input.ghi_chu?.trim() || null,
            tg_cap_nhat: new Date().toISOString(),
        }

        // Remove undefined fields
        Object.keys(sanitizedInput).forEach(key => {
            if (sanitizedInput[key] === undefined) {
                delete sanitizedInput[key]
            }
        })

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(sanitizedInput)
            .eq("id", id)
            .select("*")
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật kỳ thi:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi cập nhật kỳ thi")
        }

        // Normalize array fields
        return {
            ...data,
            nhom_chuyen_de_ids: Array.isArray(data.nhom_chuyen_de_ids)
                ? data.nhom_chuyen_de_ids.map((id: any) => typeof id === 'string' ? parseInt(id, 10) : id).filter((id: any) => !isNaN(id))
                : [],
            chuyen_de_ids: Array.isArray(data.chuyen_de_ids)
                ? data.chuyen_de_ids.map((id: any) => typeof id === 'string' ? parseInt(id, 10) : id).filter((id: any) => !isNaN(id))
                : [],
            chuc_vu_ids: Array.isArray(data.chuc_vu_ids)
                ? data.chuc_vu_ids.map((id: any) => typeof id === 'string' ? parseInt(id, 10) : id).filter((id: any) => !isNaN(id))
                : (data.chuc_vu_ids ? [] : null),
        } as KyThi
    }

    /**
     * Delete kỳ thi
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa kỳ thi:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete kỳ thi
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt kỳ thi:", error)
            throw new Error(error.message)
        }
    }
}

