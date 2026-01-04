import { supabase } from "@/lib/supabase"
import { TrangThaiKhachBuon, CreateTrangThaiKhachBuonInput, UpdateTrangThaiKhachBuonInput } from "../schema"

const TABLE_NAME = "bb_trang_thai"

/**
 * API service for Trạng Thái Khách Buôn
 * Handles all Supabase operations
 */
export class TrangThaiKhachBuonAPI {
    /**
     * Get all trạng thái khách buôn
     */
    static async getAll(): Promise<TrangThaiKhachBuon[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("tt", { ascending: true })

        if (error) {
            console.error("Lỗi khi tải danh sách trạng thái khách buôn:", error)
            throw new Error(error.message)
        }

        if (!data || data.length === 0) {
            return []
        }

        // Enrich with nguoi_tao_ten from var_nhan_su and ten_giai_doan from bb_giai_doan
        const nguoiTaoIds = [...new Set(data.map(item => item.nguoi_tao_id).filter(Boolean) as number[])]
        const giaiDoanIds = [...new Set(data.map(item => item.giai_doan_id).filter(Boolean) as number[])]
        
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
        
        let giaiDoanMap = new Map<number, string>()
        if (giaiDoanIds.length > 0) {
            const { data: giaiDoanData } = await supabase
                .from("bb_giai_doan")
                .select("id, ten_giai_doan")
                .in("id", giaiDoanIds)
            
            if (giaiDoanData) {
                giaiDoanMap = new Map(
                    giaiDoanData.map(gd => [gd.id, gd.ten_giai_doan || ""])
                )
            }
        }

        return data.map(item => ({
            ...item,
            nguoi_tao_ten: item.nguoi_tao_id ? nhanSuMap.get(item.nguoi_tao_id) || null : null,
            ten_giai_doan: item.giai_doan_id ? giaiDoanMap.get(item.giai_doan_id) || null : null,
        })) as TrangThaiKhachBuon[]
    }

    /**
     * Get trạng thái khách buôn by ID
     */
    static async getById(id: number): Promise<TrangThaiKhachBuon | null> {
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
            console.error("Lỗi khi tải chi tiết trạng thái khách buôn:", error)
            throw new Error(error.message)
        }

        if (!data) {
            return null
        }

        // Enrich with nguoi_tao_ten and ten_giai_doan
        let nguoiTaoTen: string | null = null
        if (data.nguoi_tao_id) {
            const { data: nhanSuData } = await supabase
                .from("var_nhan_su")
                .select("ho_ten")
                .eq("ma_nhan_vien", data.nguoi_tao_id)
                .single()
            
            nguoiTaoTen = nhanSuData?.ho_ten || null
        }
        
        let tenGiaiDoan: string | null = null
        if (data.giai_doan_id) {
            const { data: giaiDoanData } = await supabase
                .from("bb_giai_doan")
                .select("ten_giai_doan")
                .eq("id", data.giai_doan_id)
                .single()
            
            tenGiaiDoan = giaiDoanData?.ten_giai_doan || null
        }

        return {
            ...data,
            nguoi_tao_ten: nguoiTaoTen,
            ten_giai_doan: tenGiaiDoan,
        } as TrangThaiKhachBuon
    }

    /**
     * Create new trạng thái khách buôn
     */
    static async create(input: CreateTrangThaiKhachBuonInput): Promise<TrangThaiKhachBuon> {
        // Sanitize input: convert empty strings to null for optional fields
        const sanitizedInput = {
            ...input,
            ma_trang_thai: input.ma_trang_thai && input.ma_trang_thai.trim() !== "" ? input.ma_trang_thai.trim() : null,
            mo_ta: input.mo_ta && input.mo_ta.trim() !== "" ? input.mo_ta.trim() : null,
            nguoi_tao_id: input.nguoi_tao_id || null,
            tt: input.tt ?? null,
            mac_dinh_khoi_dau: input.mac_dinh_khoi_dau && input.mac_dinh_khoi_dau.trim() !== "" ? input.mac_dinh_khoi_dau.trim() : null,
            giai_doan_id: input.giai_doan_id ?? null,
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(sanitizedInput)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo trạng thái khách buôn:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi tạo trạng thái khách buôn")
        }

        // Enrich with nguoi_tao_ten and ten_giai_doan
        let nguoiTaoTen: string | null = null
        if (data.nguoi_tao_id) {
            const { data: nhanSuData } = await supabase
                .from("var_nhan_su")
                .select("ho_ten")
                .eq("ma_nhan_vien", data.nguoi_tao_id)
                .single()
            
            nguoiTaoTen = nhanSuData?.ho_ten || null
        }
        
        let tenGiaiDoan: string | null = null
        if (data.giai_doan_id) {
            const { data: giaiDoanData } = await supabase
                .from("bb_giai_doan")
                .select("ten_giai_doan")
                .eq("id", data.giai_doan_id)
                .single()
            
            tenGiaiDoan = giaiDoanData?.ten_giai_doan || null
        }

        return {
            ...data,
            nguoi_tao_ten: nguoiTaoTen,
            ten_giai_doan: tenGiaiDoan,
        } as TrangThaiKhachBuon
    }

    /**
     * Update trạng thái khách buôn
     */
    static async update(id: number, input: UpdateTrangThaiKhachBuonInput): Promise<TrangThaiKhachBuon> {
        // Validate input
        if (!input || typeof input !== 'object') {
            throw new Error("Input không hợp lệ")
        }
        
        // Sanitize input: convert empty strings to null for optional fields
        const sanitizedInput: UpdateTrangThaiKhachBuonInput = {}
        if (input.ten_trang_thai !== undefined) sanitizedInput.ten_trang_thai = input.ten_trang_thai
        if (input.ma_trang_thai !== undefined) {
            sanitizedInput.ma_trang_thai = input.ma_trang_thai && input.ma_trang_thai.trim() !== "" ? input.ma_trang_thai.trim() : undefined
        }
        if (input.mo_ta !== undefined) {
            sanitizedInput.mo_ta = input.mo_ta && input.mo_ta.trim() !== "" ? input.mo_ta.trim() : undefined
        }
        if (input.tt !== undefined) sanitizedInput.tt = input.tt ?? null
        if (input.mac_dinh_khoi_dau !== undefined) {
            sanitizedInput.mac_dinh_khoi_dau = input.mac_dinh_khoi_dau && input.mac_dinh_khoi_dau.trim() !== "" ? (input.mac_dinh_khoi_dau.trim() as "YES" | "NO") : undefined
        }
        if (input.giai_doan_id !== undefined) sanitizedInput.giai_doan_id = input.giai_doan_id ?? null
        if (input.tg_cap_nhat !== undefined) sanitizedInput.tg_cap_nhat = input.tg_cap_nhat

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(sanitizedInput)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật trạng thái khách buôn:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi cập nhật trạng thái khách buôn")
        }

        // Enrich with nguoi_tao_ten and ten_giai_doan
        let nguoiTaoTen: string | null = null
        if (data.nguoi_tao_id) {
            const { data: nhanSuData } = await supabase
                .from("var_nhan_su")
                .select("ho_ten")
                .eq("ma_nhan_vien", data.nguoi_tao_id)
                .single()
            
            nguoiTaoTen = nhanSuData?.ho_ten || null
        }
        
        let tenGiaiDoan: string | null = null
        if (data.giai_doan_id) {
            const { data: giaiDoanData } = await supabase
                .from("bb_giai_doan")
                .select("ten_giai_doan")
                .eq("id", data.giai_doan_id)
                .single()
            
            tenGiaiDoan = giaiDoanData?.ten_giai_doan || null
        }

        return {
            ...data,
            nguoi_tao_ten: nguoiTaoTen,
            ten_giai_doan: tenGiaiDoan,
        } as TrangThaiKhachBuon
    }

    /**
     * Delete trạng thái khách buôn
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa trạng thái khách buôn:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete trạng thái khách buôn
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt trạng thái khách buôn:", error)
            throw new Error(error.message)
        }
    }
}

