import { supabase } from "@/lib/supabase"
import { DanhMucCauHoi } from "../schema"
import type { CreateDanhMucCauHoiInput, UpdateDanhMucCauHoiInput } from "../types"

const TABLE_NAME = "chhn_nhom_cau_hoi"

/**
 * API service for Danh Mục Câu Hỏi
 * Handles all Supabase operations
 */
export class DanhMucCauHoiAPI {
    /**
     * Get all danh mục câu hỏi
     */
    static async getAll(): Promise<DanhMucCauHoi[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select(`
                id,
                ten_nhom,
                mo_ta,
                nguoi_tao_id,
                tg_tao,
                tg_cap_nhat
            `)
            .order("tg_tao", { ascending: false })
            .range(0, 99999) // Get up to 100k rows

        if (error) {
            console.error("Lỗi khi tải danh sách danh mục câu hỏi:", error)
            throw new Error(error.message)
        }

        if (!data || data.length === 0) {
            return []
        }

        // Enrich with nguoi_tao_ten from var_nhan_su
        const nguoiTaoIds = [...new Set(data.map(item => item.nguoi_tao_id).filter(Boolean))]
        
        if (nguoiTaoIds.length > 0) {
            const { data: nhanSuData } = await supabase
                .from("var_nhan_su")
                .select("ma_nhan_vien, ho_ten")
                .in("ma_nhan_vien", nguoiTaoIds)

            const nhanSuMap = new Map(
                (nhanSuData || []).map(ns => [ns.ma_nhan_vien, ns.ho_ten])
            )

            return data.map(item => ({
                ...item,
                nguoi_tao_ten: nhanSuMap.get(item.nguoi_tao_id) || null,
            })) as DanhMucCauHoi[]
        }

        return data as DanhMucCauHoi[]
    }

    /**
     * Get danh mục câu hỏi by ID
     */
    static async getById(id: number): Promise<DanhMucCauHoi | null> {
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
            console.error("Lỗi khi tải chi tiết danh mục câu hỏi:", error)
            throw new Error(error.message)
        }

        if (!data) {
            return null
        }

        // Enrich with nguoi_tao_ten
        let nguoiTaoTen: string | null = null
        if (data.nguoi_tao_id) {
            const { data: nhanSuData } = await supabase
                .from("var_nhan_su")
                .select("ho_ten")
                .eq("ma_nhan_vien", data.nguoi_tao_id)
                .single()
            
            nguoiTaoTen = nhanSuData?.ho_ten || null
        }

        return {
            ...data,
            nguoi_tao_ten: nguoiTaoTen
        } as DanhMucCauHoi
    }

    /**
     * Create new danh mục câu hỏi
     */
    static async create(input: CreateDanhMucCauHoiInput): Promise<DanhMucCauHoi> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert([{
                ten_nhom: input.ten_nhom,
                mo_ta: input.mo_ta || null,
                nguoi_tao_id: input.nguoi_tao_id,
            }])
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo danh mục câu hỏi:", error)
            throw new Error(error.message)
        }

        return data as DanhMucCauHoi
    }

    /**
     * Update danh mục câu hỏi
     */
    static async update(id: number, input: UpdateDanhMucCauHoiInput): Promise<DanhMucCauHoi> {
        const updateData: any = {}
        if (input.ten_nhom !== undefined) updateData.ten_nhom = input.ten_nhom
        if (input.mo_ta !== undefined) updateData.mo_ta = input.mo_ta

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(updateData)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật danh mục câu hỏi:", error)
            throw new Error(error.message)
        }

        return data as DanhMucCauHoi
    }

    /**
     * Delete danh mục câu hỏi
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa danh mục câu hỏi:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete danh mục câu hỏi
     */
    static async batchDelete(ids: number[]): Promise<void> {
        if (ids.length === 0) return

        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt danh mục câu hỏi:", error)
            throw new Error(error.message)
        }
    }
}

