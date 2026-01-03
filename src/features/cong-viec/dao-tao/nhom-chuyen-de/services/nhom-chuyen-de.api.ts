import { supabase } from "@/lib/supabase"
import { NhomChuyenDe, CreateNhomChuyenDeInput, UpdateNhomChuyenDeInput } from "../schema"

const TABLE_NAME = "dao_tao_nhom_chuyen_de"

/**
 * API service for Nhóm chuyên đề
 * Handles all Supabase operations
 */
export class NhomChuyenDeAPI {
    /**
     * Get all nhóm chuyên đề
     */
    static async getAll(): Promise<NhomChuyenDe[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("tg_tao", { ascending: false })

        if (error) {
            console.error("Lỗi khi tải danh sách nhóm chuyên đề:", error)
            throw new Error(error.message)
        }

        if (!data || data.length === 0) {
            return []
        }

        return data as NhomChuyenDe[]
    }

    /**
     * Get nhóm chuyên đề by ID
     */
    static async getById(id: number): Promise<NhomChuyenDe | null> {
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
            console.error("Lỗi khi tải chi tiết nhóm chuyên đề:", error)
            throw new Error(error.message)
        }

        if (!data) {
            return null
        }

        return data as NhomChuyenDe
    }

    /**
     * Create new nhóm chuyên đề
     */
    static async create(input: CreateNhomChuyenDeInput): Promise<NhomChuyenDe> {
        // Validate input
        if (!input.ten_nhom || !String(input.ten_nhom).trim()) {
            throw new Error("Tên nhóm là bắt buộc")
        }

        if (!input.nguoi_tao_id || input.nguoi_tao_id <= 0) {
            throw new Error("Người tạo là bắt buộc")
        }

        // Check for duplicate ten_nhom
        const { data: existing } = await supabase
            .from(TABLE_NAME)
            .select("id, ten_nhom")
            .eq("ten_nhom", input.ten_nhom.trim())
            .single()

        if (existing) {
            throw new Error(`Nhóm chuyên đề với tên "${input.ten_nhom}" đã tồn tại`)
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert({
                ...input,
                ten_nhom: input.ten_nhom.trim(),
                mo_ta: input.mo_ta?.trim() || null,
            })
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo nhóm chuyên đề:", error)
            // Handle unique constraint violation
            if (error.code === "23505") {
                throw new Error(`Nhóm chuyên đề với tên "${input.ten_nhom}" đã tồn tại`)
            }
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi tạo nhóm chuyên đề")
        }

        return data as NhomChuyenDe
    }

    /**
     * Update nhóm chuyên đề
     */
    static async update(id: number, input: UpdateNhomChuyenDeInput): Promise<NhomChuyenDe> {
        // Validate input
        if (!input || typeof input !== 'object') {
            throw new Error("Input không hợp lệ")
        }

        // If ten_nhom is being updated, check for duplicates
        if (input.ten_nhom !== undefined && input.ten_nhom.trim()) {
            const { data: existing } = await supabase
                .from(TABLE_NAME)
                .select("id, ten_nhom")
                .eq("ten_nhom", input.ten_nhom.trim())
                .neq("id", id)
                .single()

            if (existing) {
                throw new Error(`Nhóm chuyên đề với tên "${input.ten_nhom}" đã tồn tại`)
            }
        }
        
        // Add update timestamp and sanitize
        const sanitizedInput: UpdateNhomChuyenDeInput = {
            ...input,
            ten_nhom: input.ten_nhom?.trim(),
            mo_ta: input.mo_ta?.trim() || null,
            tg_cap_nhat: new Date().toISOString(),
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(sanitizedInput)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật nhóm chuyên đề:", error)
            // Handle unique constraint violation
            if (error.code === "23505") {
                throw new Error(`Nhóm chuyên đề với tên "${input.ten_nhom}" đã tồn tại`)
            }
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi cập nhật nhóm chuyên đề")
        }

        return data as NhomChuyenDe
    }

    /**
     * Delete nhóm chuyên đề with cascade delete
     * Xóa tất cả chuyên đề con và câu hỏi cháu
     */
    static async delete(id: number): Promise<void> {
        // 1. Lấy tất cả chuyên đề con
        const { data: chuyenDeList } = await supabase
            .from("dao_tao_chuyen_de")
            .select("id")
            .eq("nhom_chuyen_de_id", id)

        if (chuyenDeList && chuyenDeList.length > 0) {
            const chuyenDeIds = chuyenDeList.map((cd: any) => cd.id).filter(Boolean)
            
            // 2. Xóa tất cả câu hỏi cháu (câu hỏi của các chuyên đề con)
            if (chuyenDeIds.length > 0) {
                const { error: cauHoiError } = await supabase
                    .from("dao_tao_cau_hoi")
                    .delete()
                    .in("chuyen_de_id", chuyenDeIds)

                if (cauHoiError) {
                    console.error("Lỗi khi xóa câu hỏi cháu:", cauHoiError)
                    throw new Error(`Lỗi khi xóa câu hỏi: ${cauHoiError.message}`)
                }
            }

            // 3. Xóa tất cả chuyên đề con
            const { error: chuyenDeError } = await supabase
                .from("dao_tao_chuyen_de")
                .delete()
                .in("id", chuyenDeIds)

            if (chuyenDeError) {
                console.error("Lỗi khi xóa chuyên đề con:", chuyenDeError)
                throw new Error(`Lỗi khi xóa chuyên đề: ${chuyenDeError.message}`)
            }
        }

        // 4. Xóa nhóm chuyên đề
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa nhóm chuyên đề:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete nhóm chuyên đề with cascade delete
     * Xóa tất cả chuyên đề con và câu hỏi cháu
     */
    static async batchDelete(ids: number[]): Promise<void> {
        // 1. Lấy tất cả chuyên đề con của các nhóm
        const { data: chuyenDeList } = await supabase
            .from("dao_tao_chuyen_de")
            .select("id")
            .in("nhom_chuyen_de_id", ids)

        if (chuyenDeList && chuyenDeList.length > 0) {
            const chuyenDeIds = chuyenDeList.map((cd: any) => cd.id).filter(Boolean)
            
            // 2. Xóa tất cả câu hỏi cháu (câu hỏi của các chuyên đề con)
            if (chuyenDeIds.length > 0) {
                const { error: cauHoiError } = await supabase
                    .from("dao_tao_cau_hoi")
                    .delete()
                    .in("chuyen_de_id", chuyenDeIds)

                if (cauHoiError) {
                    console.error("Lỗi khi xóa câu hỏi cháu:", cauHoiError)
                    throw new Error(`Lỗi khi xóa câu hỏi: ${cauHoiError.message}`)
                }
            }

            // 3. Xóa tất cả chuyên đề con
            const { error: chuyenDeError } = await supabase
                .from("dao_tao_chuyen_de")
                .delete()
                .in("id", chuyenDeIds)

            if (chuyenDeError) {
                console.error("Lỗi khi xóa chuyên đề con:", chuyenDeError)
                throw new Error(`Lỗi khi xóa chuyên đề: ${chuyenDeError.message}`)
            }
        }

        // 4. Xóa các nhóm chuyên đề
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt nhóm chuyên đề:", error)
            throw new Error(error.message)
        }
    }
}

