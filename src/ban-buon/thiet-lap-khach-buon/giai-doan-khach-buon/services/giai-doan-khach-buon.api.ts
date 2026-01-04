import { supabase } from "@/lib/supabase"
import { GiaiDoanKhachBuon, CreateGiaiDoanKhachBuonInput, UpdateGiaiDoanKhachBuonInput } from "../schema"

const TABLE_NAME = "bb_giai_doan"

/**
 * API service for Giai Đoạn Khách Buôn
 * Handles all Supabase operations
 */
export class GiaiDoanKhachBuonAPI {
    /**
     * Get all giai đoạn khách buôn
     */
    static async getAll(): Promise<GiaiDoanKhachBuon[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("tt", { ascending: true })

        if (error) {
            console.error("Lỗi khi tải danh sách giai đoạn khách buôn:", error)
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
        })) as GiaiDoanKhachBuon[]
    }

    /**
     * Get giai đoạn khách buôn by ID
     */
    static async getById(id: number): Promise<GiaiDoanKhachBuon | null> {
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
            console.error("Lỗi khi tải chi tiết giai đoạn khách buôn:", error)
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
        } as GiaiDoanKhachBuon
    }

    /**
     * Create new giai đoạn khách buôn
     */
    static async create(input: CreateGiaiDoanKhachBuonInput): Promise<GiaiDoanKhachBuon> {
        // Sanitize input: convert empty strings to null for optional fields
        const sanitizedInput = {
            ...input,
            ma_giai_doan: input.ma_giai_doan && input.ma_giai_doan.trim() !== "" ? input.ma_giai_doan : null,
            mo_ta: input.mo_ta && input.mo_ta.trim() !== "" ? input.mo_ta : null,
            nguoi_tao_id: input.nguoi_tao_id || null,
            tt: input.tt ?? null,
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(sanitizedInput)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo giai đoạn khách buôn:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi tạo giai đoạn khách buôn")
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
        } as GiaiDoanKhachBuon
    }

    /**
     * Update giai đoạn khách buôn
     */
    static async update(id: number, input: UpdateGiaiDoanKhachBuonInput): Promise<GiaiDoanKhachBuon> {
        // Validate input
        if (!input || typeof input !== 'object') {
            throw new Error("Input không hợp lệ")
        }
        
        // Sanitize input: convert empty strings to null for optional fields
        const sanitizedInput: UpdateGiaiDoanKhachBuonInput = {}
        if (input.ten_giai_doan !== undefined) sanitizedInput.ten_giai_doan = input.ten_giai_doan
        if (input.ma_giai_doan !== undefined) {
            sanitizedInput.ma_giai_doan = input.ma_giai_doan && input.ma_giai_doan.trim() !== "" ? input.ma_giai_doan : null
        }
        if (input.mo_ta !== undefined) {
            sanitizedInput.mo_ta = input.mo_ta && input.mo_ta.trim() !== "" ? input.mo_ta : null
        }
        if (input.tt !== undefined) sanitizedInput.tt = input.tt ?? null
        if (input.tg_cap_nhat !== undefined) sanitizedInput.tg_cap_nhat = input.tg_cap_nhat

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(sanitizedInput)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật giai đoạn khách buôn:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi cập nhật giai đoạn khách buôn")
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
        } as GiaiDoanKhachBuon
    }

    /**
     * Delete giai đoạn khách buôn
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa giai đoạn khách buôn:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete giai đoạn khách buôn
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt giai đoạn khách buôn:", error)
            throw new Error(error.message)
        }
    }
}

