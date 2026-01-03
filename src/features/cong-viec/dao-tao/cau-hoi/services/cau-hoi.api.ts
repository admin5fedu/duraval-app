import { supabase } from "@/lib/supabase"
import { CauHoi, CreateCauHoiInput, UpdateCauHoiInput } from "../schema"

const TABLE_NAME = "dao_tao_cau_hoi"

/**
 * API service for Câu hỏi
 * Handles all Supabase operations
 */
export class CauHoiAPI {
    /**
     * Get all câu hỏi with chuyên đề info
     */
    static async getAll(): Promise<CauHoi[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("tg_tao", { ascending: false })

        if (error) {
            console.error("Lỗi khi tải danh sách câu hỏi:", error)
            throw new Error(error.message)
        }

        if (!data || data.length === 0) {
            return []
        }

        // Get unique chuyen_de_ids
        const chuyenDeIds = [...new Set(data.map((item: any) => item.chuyen_de_id).filter(Boolean))]
        
        // Fetch chuyên đề names
        const chuyenDeMap = new Map<number, string>()
        if (chuyenDeIds.length > 0) {
            const { data: chuyenDeList } = await supabase
                .from("dao_tao_chuyen_de")
                .select("id, ten_chuyen_de")
                .in("id", chuyenDeIds)

            if (chuyenDeList) {
                chuyenDeList.forEach((chuyenDe: any) => {
                    if (chuyenDe.id && chuyenDe.ten_chuyen_de) {
                        chuyenDeMap.set(chuyenDe.id, chuyenDe.ten_chuyen_de)
                    }
                })
            }
        }

        // Map data to include ten_chuyen_de
        return data.map((item: any) => ({
            ...item,
            ten_chuyen_de: item.chuyen_de_id ? chuyenDeMap.get(item.chuyen_de_id) || null : null,
            hinh_anh: Array.isArray(item.hinh_anh) ? item.hinh_anh : (item.hinh_anh ? [item.hinh_anh] : []),
        })) as CauHoi[]
    }

    /**
     * Get câu hỏi by ID
     */
    static async getById(id: number): Promise<CauHoi | null> {
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
            console.error("Lỗi khi tải chi tiết câu hỏi:", error)
            throw new Error(error.message)
        }

        if (!data) {
            return null
        }

        // Fetch chuyên đề name if chuyen_de_id exists
        let tenChuyenDe: string | null = null
        if (data.chuyen_de_id) {
            const { data: chuyenDe } = await supabase
                .from("dao_tao_chuyen_de")
                .select("ten_chuyen_de")
                .eq("id", data.chuyen_de_id)
                .single()

            if (chuyenDe) {
                tenChuyenDe = chuyenDe.ten_chuyen_de || null
            }
        }

        // Map data to include ten_chuyen_de
        return {
            ...data,
            ten_chuyen_de: tenChuyenDe,
            hinh_anh: Array.isArray(data.hinh_anh) ? data.hinh_anh : (data.hinh_anh ? [data.hinh_anh] : []),
        } as CauHoi
    }

    /**
     * Create new câu hỏi
     */
    static async create(input: CreateCauHoiInput): Promise<CauHoi> {
        // Validate input
        if (!input.cau_hoi || !String(input.cau_hoi).trim()) {
            throw new Error("Câu hỏi là bắt buộc")
        }

        if (!input.chuyen_de_id || input.chuyen_de_id <= 0) {
            throw new Error("Chuyên đề là bắt buộc")
        }

        if (!input.nguoi_tao_id || input.nguoi_tao_id <= 0) {
            throw new Error("Người tạo là bắt buộc")
        }

        // Validate đáp án
        if (!input.dap_an_1?.trim() || !input.dap_an_2?.trim() || !input.dap_an_3?.trim() || !input.dap_an_4?.trim()) {
            throw new Error("Tất cả 4 đáp án là bắt buộc")
        }

        if (!input.dap_an_dung || input.dap_an_dung < 1 || input.dap_an_dung > 4) {
            throw new Error("Đáp án đúng phải từ 1 đến 4")
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert({
                ...input,
                cau_hoi: input.cau_hoi.trim(),
                dap_an_1: input.dap_an_1.trim(),
                dap_an_2: input.dap_an_2.trim(),
                dap_an_3: input.dap_an_3.trim(),
                dap_an_4: input.dap_an_4.trim(),
                hinh_anh: input.hinh_anh && input.hinh_anh.length > 0 ? input.hinh_anh : null,
            })
            .select("*")
            .single()

        if (error) {
            console.error("Lỗi khi tạo câu hỏi:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi tạo câu hỏi")
        }

        // Fetch chuyên đề name
        let tenChuyenDe: string | null = null
        if (data.chuyen_de_id) {
            const { data: chuyenDe } = await supabase
                .from("dao_tao_chuyen_de")
                .select("ten_chuyen_de")
                .eq("id", data.chuyen_de_id)
                .single()

            if (chuyenDe) {
                tenChuyenDe = chuyenDe.ten_chuyen_de || null
            }
        }

        // Map data to include ten_chuyen_de
        return {
            ...data,
            ten_chuyen_de: tenChuyenDe,
            hinh_anh: Array.isArray(data.hinh_anh) ? data.hinh_anh : (data.hinh_anh ? [data.hinh_anh] : []),
        } as CauHoi
    }

    /**
     * Update câu hỏi
     */
    static async update(id: number, input: UpdateCauHoiInput): Promise<CauHoi> {
        // Validate input
        if (!input || typeof input !== 'object') {
            throw new Error("Input không hợp lệ")
        }

        // Validate đáp án đúng nếu được cập nhật
        if (input.dap_an_dung !== undefined && (input.dap_an_dung < 1 || input.dap_an_dung > 4)) {
            throw new Error("Đáp án đúng phải từ 1 đến 4")
        }
        
        // Add update timestamp and sanitize
        const sanitizedInput: UpdateCauHoiInput = {
            ...input,
            cau_hoi: input.cau_hoi?.trim(),
            dap_an_1: input.dap_an_1?.trim(),
            dap_an_2: input.dap_an_2?.trim(),
            dap_an_3: input.dap_an_3?.trim(),
            dap_an_4: input.dap_an_4?.trim(),
            hinh_anh: input.hinh_anh && input.hinh_anh.length > 0 ? input.hinh_anh : null,
            tg_cap_nhat: new Date().toISOString(),
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(sanitizedInput)
            .eq("id", id)
            .select("*")
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật câu hỏi:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi cập nhật câu hỏi")
        }

        // Fetch chuyên đề name
        let tenChuyenDe: string | null = null
        const chuyenDeId = data.chuyen_de_id || input.chuyen_de_id
        if (chuyenDeId) {
            const { data: chuyenDe } = await supabase
                .from("dao_tao_chuyen_de")
                .select("ten_chuyen_de")
                .eq("id", chuyenDeId)
                .single()

            if (chuyenDe) {
                tenChuyenDe = chuyenDe.ten_chuyen_de || null
            }
        }

        // Map data to include ten_chuyen_de
        return {
            ...data,
            ten_chuyen_de: tenChuyenDe,
            hinh_anh: Array.isArray(data.hinh_anh) ? data.hinh_anh : (data.hinh_anh ? [data.hinh_anh] : []),
        } as CauHoi
    }

    /**
     * Delete câu hỏi
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa câu hỏi:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete câu hỏi
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt câu hỏi:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Get câu hỏi by chuyen_de_id
     */
    static async getByChuyenDeId(chuyenDeId: number): Promise<CauHoi[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .eq("chuyen_de_id", chuyenDeId)
            .order("tg_tao", { ascending: false })

        if (error) {
            console.error("Lỗi khi tải danh sách câu hỏi theo chuyên đề:", error)
            throw new Error(error.message)
        }

        if (!data || data.length === 0) {
            return []
        }

        // Fetch chuyên đề name
        const { data: chuyenDe } = await supabase
            .from("dao_tao_chuyen_de")
            .select("ten_chuyen_de")
            .eq("id", chuyenDeId)
            .single()

        const tenChuyenDe = chuyenDe?.ten_chuyen_de || null

        // Map data to include ten_chuyen_de
        return data.map((item: any) => ({
            ...item,
            ten_chuyen_de: tenChuyenDe,
            hinh_anh: Array.isArray(item.hinh_anh) ? item.hinh_anh : (item.hinh_anh ? [item.hinh_anh] : []),
        })) as CauHoi[]
    }
}

