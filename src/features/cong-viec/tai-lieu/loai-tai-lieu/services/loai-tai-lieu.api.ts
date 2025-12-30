import { supabase } from "@/lib/supabase"
import { LoaiTaiLieu } from "../schema"
import type { CreateLoaiTaiLieuInput, UpdateLoaiTaiLieuInput } from "../types"

const TABLE_NAME = "tai_lieu_loai"

/**
 * API service for Loại Tài Liệu
 * Handles all Supabase operations
 */
export class LoaiTaiLieuAPI {
    /**
     * Get all loại tài liệu
     */
    static async getAll(): Promise<LoaiTaiLieu[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select(`
                id,
                hang_muc,
                loai,
                mo_ta,
                nguoi_tao_id,
                tg_tao,
                tg_cap_nhat
            `)
            .order("tg_tao", { ascending: false })
            .range(0, 99999) // Get up to 100k rows

        if (error) {
            console.error("Lỗi khi tải danh sách loại tài liệu:", error)
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
            })) as LoaiTaiLieu[]
        }

        return data as LoaiTaiLieu[]
    }

    /**
     * Get loại tài liệu by ID
     */
    static async getById(id: number): Promise<LoaiTaiLieu | null> {
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
            console.error("Lỗi khi tải chi tiết loại tài liệu:", error)
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
        } as LoaiTaiLieu
    }

    /**
     * Create new loại tài liệu
     */
    static async create(input: CreateLoaiTaiLieuInput): Promise<LoaiTaiLieu> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert([{
                hang_muc: input.hang_muc,
                loai: input.loai,
                mo_ta: input.mo_ta || null,
                nguoi_tao_id: input.nguoi_tao_id || null,
            }])
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo loại tài liệu:", error)
            throw new Error(error.message)
        }

        return data as LoaiTaiLieu
    }

    /**
     * Update loại tài liệu
     */
    static async update(id: number, input: UpdateLoaiTaiLieuInput): Promise<LoaiTaiLieu> {
        const updateData: any = {}
        if (input.hang_muc !== undefined) updateData.hang_muc = input.hang_muc
        if (input.loai !== undefined) updateData.loai = input.loai
        if (input.mo_ta !== undefined) updateData.mo_ta = input.mo_ta

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(updateData)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật loại tài liệu:", error)
            throw new Error(error.message)
        }

        return data as LoaiTaiLieu
    }

    /**
     * Delete loại tài liệu
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa loại tài liệu:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete loại tài liệu
     */
    static async batchDelete(ids: number[]): Promise<void> {
        if (ids.length === 0) return

        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt loại tài liệu:", error)
            throw new Error(error.message)
        }
    }
}

