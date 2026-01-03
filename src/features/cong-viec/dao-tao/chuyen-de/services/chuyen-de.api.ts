import { supabase } from "@/lib/supabase"
import { ChuyenDe, CreateChuyenDeInput, UpdateChuyenDeInput } from "../schema"

const TABLE_NAME = "dao_tao_chuyen_de"

/**
 * API service for Chuyên đề
 * Handles all Supabase operations
 */
export class ChuyenDeAPI {
    /**
     * Get all chuyên đề with nhóm chuyên đề info
     */
    static async getAll(): Promise<ChuyenDe[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("tg_tao", { ascending: false })

        if (error) {
            console.error("Lỗi khi tải danh sách chuyên đề:", error)
            throw new Error(error.message)
        }

        if (!data || data.length === 0) {
            return []
        }

        // Get unique nhom_chuyen_de_ids
        const nhomChuyenDeIds = [...new Set(data.map((item: any) => item.nhom_chuyen_de_id).filter(Boolean))]
        
        // Fetch nhóm chuyên đề names
        const nhomChuyenDeMap = new Map<number, string>()
        if (nhomChuyenDeIds.length > 0) {
            const { data: nhomChuyenDeList } = await supabase
                .from("dao_tao_nhom_chuyen_de")
                .select("id, ten_nhom")
                .in("id", nhomChuyenDeIds)

            if (nhomChuyenDeList) {
                nhomChuyenDeList.forEach((nhom: any) => {
                    if (nhom.id && nhom.ten_nhom) {
                        nhomChuyenDeMap.set(nhom.id, nhom.ten_nhom)
                    }
                })
            }
        }

        // Map data to include ten_nhom_chuyen_de
        return data.map((item: any) => ({
            ...item,
            ten_nhom_chuyen_de: item.nhom_chuyen_de_id ? nhomChuyenDeMap.get(item.nhom_chuyen_de_id) || null : null,
        })) as ChuyenDe[]
    }

    /**
     * Get chuyên đề by ID
     */
    static async getById(id: number): Promise<ChuyenDe | null> {
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
            console.error("Lỗi khi tải chi tiết chuyên đề:", error)
            throw new Error(error.message)
        }

        if (!data) {
            return null
        }

        // Fetch nhóm chuyên đề name if nhom_chuyen_de_id exists
        let tenNhomChuyenDe: string | null = null
        if (data.nhom_chuyen_de_id) {
            const { data: nhomChuyenDe } = await supabase
                .from("dao_tao_nhom_chuyen_de")
                .select("ten_nhom")
                .eq("id", data.nhom_chuyen_de_id)
                .single()

            if (nhomChuyenDe) {
                tenNhomChuyenDe = nhomChuyenDe.ten_nhom || null
            }
        }

        // Map data to include ten_nhom_chuyen_de
        return {
            ...data,
            ten_nhom_chuyen_de: tenNhomChuyenDe,
        } as ChuyenDe
    }

    /**
     * Create new chuyên đề
     */
    static async create(input: CreateChuyenDeInput): Promise<ChuyenDe> {
        // Validate input
        if (!input.ten_chuyen_de || !String(input.ten_chuyen_de).trim()) {
            throw new Error("Tên chuyên đề là bắt buộc")
        }

        if (!input.nhom_chuyen_de_id || input.nhom_chuyen_de_id <= 0) {
            throw new Error("Nhóm chuyên đề là bắt buộc")
        }

        if (!input.nguoi_tao_id || input.nguoi_tao_id <= 0) {
            throw new Error("Người tạo là bắt buộc")
        }

        // Check for duplicate ten_chuyen_de in the same nhom_chuyen_de_id
        const { data: existing } = await supabase
            .from(TABLE_NAME)
            .select("id, ten_chuyen_de")
            .eq("ten_chuyen_de", input.ten_chuyen_de.trim())
            .eq("nhom_chuyen_de_id", input.nhom_chuyen_de_id)
            .single()

        if (existing) {
            throw new Error(`Chuyên đề với tên "${input.ten_chuyen_de}" đã tồn tại trong nhóm này`)
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert({
                ...input,
                ten_chuyen_de: input.ten_chuyen_de.trim(),
                mo_ta: input.mo_ta?.trim() || null,
            })
            .select("*")
            .single()

        if (error) {
            console.error("Lỗi khi tạo chuyên đề:", error)
            // Handle unique constraint violation
            if (error.code === "23505") {
                throw new Error(`Chuyên đề với tên "${input.ten_chuyen_de}" đã tồn tại trong nhóm này`)
            }
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi tạo chuyên đề")
        }

        // Fetch nhóm chuyên đề name
        let tenNhomChuyenDe: string | null = null
        if (data.nhom_chuyen_de_id) {
            const { data: nhomChuyenDe } = await supabase
                .from("dao_tao_nhom_chuyen_de")
                .select("ten_nhom")
                .eq("id", data.nhom_chuyen_de_id)
                .single()

            if (nhomChuyenDe) {
                tenNhomChuyenDe = nhomChuyenDe.ten_nhom || null
            }
        }

        // Map data to include ten_nhom_chuyen_de
        return {
            ...data,
            ten_nhom_chuyen_de: tenNhomChuyenDe,
        } as ChuyenDe
    }

    /**
     * Update chuyên đề
     */
    static async update(id: number, input: UpdateChuyenDeInput): Promise<ChuyenDe> {
        // Validate input
        if (!input || typeof input !== 'object') {
            throw new Error("Input không hợp lệ")
        }

        // If ten_chuyen_de or nhom_chuyen_de_id is being updated, check for duplicates
        if (input.ten_chuyen_de !== undefined || input.nhom_chuyen_de_id !== undefined) {
            // Get current record to check both fields
            const { data: current } = await supabase
                .from(TABLE_NAME)
                .select("ten_chuyen_de, nhom_chuyen_de_id")
                .eq("id", id)
                .single()

            if (current) {
                const tenChuyenDe = input.ten_chuyen_de?.trim() || current.ten_chuyen_de
                const nhomChuyenDeId = input.nhom_chuyen_de_id || current.nhom_chuyen_de_id

                const { data: existing } = await supabase
                    .from(TABLE_NAME)
                    .select("id, ten_chuyen_de")
                    .eq("ten_chuyen_de", tenChuyenDe)
                    .eq("nhom_chuyen_de_id", nhomChuyenDeId)
                    .neq("id", id)
                    .single()

                if (existing) {
                    throw new Error(`Chuyên đề với tên "${tenChuyenDe}" đã tồn tại trong nhóm này`)
                }
            }
        }
        
        // Add update timestamp and sanitize
        const sanitizedInput: UpdateChuyenDeInput = {
            ...input,
            ten_chuyen_de: input.ten_chuyen_de?.trim(),
            mo_ta: input.mo_ta?.trim() || null,
            tg_cap_nhat: new Date().toISOString(),
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(sanitizedInput)
            .eq("id", id)
            .select("*")
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật chuyên đề:", error)
            // Handle unique constraint violation
            if (error.code === "23505") {
                throw new Error(`Chuyên đề với tên "${input.ten_chuyen_de}" đã tồn tại trong nhóm này`)
            }
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi cập nhật chuyên đề")
        }

        // Fetch nhóm chuyên đề name
        let tenNhomChuyenDe: string | null = null
        const nhomChuyenDeId = data.nhom_chuyen_de_id || (input.nhom_chuyen_de_id)
        if (nhomChuyenDeId) {
            const { data: nhomChuyenDe } = await supabase
                .from("dao_tao_nhom_chuyen_de")
                .select("ten_nhom")
                .eq("id", nhomChuyenDeId)
                .single()

            if (nhomChuyenDe) {
                tenNhomChuyenDe = nhomChuyenDe.ten_nhom || null
            }
        }

        // Map data to include ten_nhom_chuyen_de
        return {
            ...data,
            ten_nhom_chuyen_de: tenNhomChuyenDe,
        } as ChuyenDe
    }

    /**
     * Delete chuyên đề with cascade delete
     * Xóa tất cả câu hỏi con
     */
    static async delete(id: number): Promise<void> {
        // 1. Xóa tất cả câu hỏi con
        const { error: cauHoiError } = await supabase
            .from("dao_tao_cau_hoi")
            .delete()
            .eq("chuyen_de_id", id)

        if (cauHoiError) {
            console.error("Lỗi khi xóa câu hỏi con:", cauHoiError)
            throw new Error(`Lỗi khi xóa câu hỏi: ${cauHoiError.message}`)
        }

        // 2. Xóa chuyên đề
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa chuyên đề:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete chuyên đề with cascade delete
     * Xóa tất cả câu hỏi con
     */
    static async batchDelete(ids: number[]): Promise<void> {
        // 1. Xóa tất cả câu hỏi con
        const { error: cauHoiError } = await supabase
            .from("dao_tao_cau_hoi")
            .delete()
            .in("chuyen_de_id", ids)

        if (cauHoiError) {
            console.error("Lỗi khi xóa câu hỏi con:", cauHoiError)
            throw new Error(`Lỗi khi xóa câu hỏi: ${cauHoiError.message}`)
        }

        // 2. Xóa các chuyên đề
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt chuyên đề:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Get chuyên đề by nhom_chuyen_de_id
     */
    static async getByNhomChuyenDeId(nhomChuyenDeId: number): Promise<ChuyenDe[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .eq("nhom_chuyen_de_id", nhomChuyenDeId)
            .order("tg_tao", { ascending: false })

        if (error) {
            console.error("Lỗi khi tải danh sách chuyên đề theo nhóm:", error)
            throw new Error(error.message)
        }

        if (!data || data.length === 0) {
            return []
        }

        // Fetch nhóm chuyên đề name
        const { data: nhomChuyenDe } = await supabase
            .from("dao_tao_nhom_chuyen_de")
            .select("ten_nhom")
            .eq("id", nhomChuyenDeId)
            .single()

        const tenNhom = nhomChuyenDe?.ten_nhom || null

        // Map data to include ten_nhom_chuyen_de
        return data.map((item: any) => ({
            ...item,
            ten_nhom_chuyen_de: tenNhom,
        })) as ChuyenDe[]
    }
}

