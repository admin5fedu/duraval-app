import { supabase } from "@/lib/supabase"
import { LoaiPhieu, CreateLoaiPhieuInput, UpdateLoaiPhieuInput } from "../schema"

const TABLE_NAME = "htbh_loai_phieu"

/**
 * API service for Loại Phiếu
 * Handles all Supabase operations
 */
export class LoaiPhieuAPI {
    /**
     * Get all loại phiếu
     */
    static async getAll(): Promise<LoaiPhieu[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("tg_tao", { ascending: false })

        if (error) {
            console.error("Lỗi khi tải danh sách loại phiếu:", error)
            throw new Error(error.message)
        }

        if (!data || data.length === 0) {
            return []
        }

        // Enrich with nguoi_tao_ten from var_nhan_su
        const nguoiTaoIds = [...new Set(data.map(item => item.nguoi_tao_id).filter(Boolean) as number[])]
        
        let nhanSuMap = new Map<number, string>()
        if (nguoiTaoIds.length > 0) {
            const { data: nhanSuData } = await supabase
                .from("var_nhan_su")
                .select("ma_nhan_vien, ho_ten")
                .in("ma_nhan_vien", nguoiTaoIds)
            
            if (nhanSuData) {
                nhanSuMap = new Map(
                    nhanSuData.map(ns => [ns.ma_nhan_vien, ns.ho_ten])
                )
            }
        }

        return data.map(item => ({
            ...item,
            nguoi_tao_ten: item.nguoi_tao_id ? nhanSuMap.get(item.nguoi_tao_id) || null : null,
        })) as LoaiPhieu[]
    }

    /**
     * Get loại phiếu by ID
     */
    static async getById(id: number): Promise<LoaiPhieu | null> {
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
            console.error("Lỗi khi tải chi tiết loại phiếu:", error)
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
            nguoi_tao_ten: nguoiTaoTen,
        } as LoaiPhieu
    }

    /**
     * Create new loại phiếu
     */
    static async create(input: CreateLoaiPhieuInput): Promise<LoaiPhieu> {
        // Sanitize input: convert empty strings to null for optional fields
        const sanitizedInput = {
            ...input,
            mo_ta: input.mo_ta && input.mo_ta.trim() !== "" ? input.mo_ta : null,
            nguoi_tao_id: input.nguoi_tao_id || null,
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(sanitizedInput)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo loại phiếu:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi tạo loại phiếu")
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
            nguoi_tao_ten: nguoiTaoTen,
        } as LoaiPhieu
    }

    /**
     * Update loại phiếu
     */
    static async update(id: number, input: UpdateLoaiPhieuInput): Promise<LoaiPhieu> {
        // Validate input
        if (!input || typeof input !== 'object') {
            throw new Error("Input không hợp lệ")
        }
        
        // Sanitize input: convert empty strings to null for optional fields
        const sanitizedInput: UpdateLoaiPhieuInput = {}
        if (input.ten_loai_phieu !== undefined) sanitizedInput.ten_loai_phieu = input.ten_loai_phieu
        if (input.mo_ta !== undefined) {
            sanitizedInput.mo_ta = input.mo_ta && input.mo_ta.trim() !== "" ? input.mo_ta : null
        }
        if (input.tg_cap_nhat !== undefined) sanitizedInput.tg_cap_nhat = input.tg_cap_nhat

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(sanitizedInput)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật loại phiếu:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi cập nhật loại phiếu")
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
            nguoi_tao_ten: nguoiTaoTen,
        } as LoaiPhieu
    }

    /**
     * Delete loại phiếu
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa loại phiếu:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete loại phiếu
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt loại phiếu:", error)
            throw new Error(error.message)
        }
    }
}

