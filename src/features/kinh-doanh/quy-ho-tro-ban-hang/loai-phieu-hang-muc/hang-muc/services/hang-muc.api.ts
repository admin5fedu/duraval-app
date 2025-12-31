import { supabase } from "@/lib/supabase"
import { HangMuc, CreateHangMucInput, UpdateHangMucInput } from "../schema"

const TABLE_NAME = "htbh_hang_muc"

/**
 * API service for Hạng Mục
 * Handles all Supabase operations
 */
export class HangMucAPI {
    /**
     * Get all hạng mục with enriched loai_phieu data
     */
    static async getAll(): Promise<HangMuc[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("tg_tao", { ascending: false })

        if (error) {
            console.error("Lỗi khi tải danh sách hạng mục:", error)
            throw new Error(error.message)
        }

        if (!data || data.length === 0) {
            return []
        }

        // Get unique loai_phieu_ids and nguoi_tao_ids for batch fetching
        const loaiPhieuIds = [...new Set(data.map(item => item.loai_phieu_id).filter(Boolean) as number[])]
        const nguoiTaoIds = [...new Set(data.map(item => item.nguoi_tao_id).filter(Boolean) as number[])]

        // Fetch loai_phieu data in batch
        let loaiPhieuMap = new Map<number, string>()
        if (loaiPhieuIds.length > 0) {
            const { data: loaiPhieuData } = await supabase
                .from("htbh_loai_phieu")
                .select("id, ten_loai_phieu")
                .in("id", loaiPhieuIds)
            
            if (loaiPhieuData) {
                loaiPhieuMap = new Map(
                    loaiPhieuData.map(lp => [lp.id, lp.ten_loai_phieu])
                )
            }
        }

        // Fetch nguoi_tao data in batch
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

        // Enrich data
        return data.map(item => ({
            ...item,
            ten_loai_phieu: item.loai_phieu_id ? (loaiPhieuMap.get(item.loai_phieu_id) || item.ten_loai_phieu || null) : (item.ten_loai_phieu || null),
            nguoi_tao_ten: item.nguoi_tao_id ? (nhanSuMap.get(item.nguoi_tao_id) || null) : null,
        })) as HangMuc[]
    }

    /**
     * Get hạng mục by ID with enriched loai_phieu data
     */
    static async getById(id: number): Promise<HangMuc | null> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .eq("id", id)
            .single()

        if (error) {
            if (error.code === "PGRST116") {
                return null
            }
            console.error("Lỗi khi tải chi tiết hạng mục:", error)
            throw new Error(error.message)
        }

        if (!data) {
            return null
        }

        // Fetch ten_loai_phieu if loai_phieu_id exists
        let tenLoaiPhieu: string | null = data.ten_loai_phieu || null
        if (data.loai_phieu_id && !tenLoaiPhieu) {
            const { data: loaiPhieuData } = await supabase
                .from("htbh_loai_phieu")
                .select("ten_loai_phieu")
                .eq("id", data.loai_phieu_id)
                .single()
            
            tenLoaiPhieu = loaiPhieuData?.ten_loai_phieu || null
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
            ten_loai_phieu: tenLoaiPhieu,
        } as HangMuc
    }

    /**
     * Create new hạng mục
     */
    static async create(input: CreateHangMucInput): Promise<HangMuc> {
        // Get ten_loai_phieu from loai_phieu_id if provided
        let tenLoaiPhieu: string | null = null
        if (input.loai_phieu_id) {
            const { data: loaiPhieuData } = await supabase
                .from("htbh_loai_phieu")
                .select("ten_loai_phieu")
                .eq("id", input.loai_phieu_id)
                .single()
            
            tenLoaiPhieu = loaiPhieuData?.ten_loai_phieu || null
        }

        const insertData: any = {
            ...input,
            ten_loai_phieu: tenLoaiPhieu,
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(insertData)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo hạng mục:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi tạo hạng mục")
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
        } as HangMuc
    }

    /**
     * Update hạng mục
     */
    static async update(id: number, input: UpdateHangMucInput): Promise<HangMuc> {
        // Validate input
        if (!input || typeof input !== 'object') {
            throw new Error("Input không hợp lệ")
        }

        // Get ten_loai_phieu from loai_phieu_id if provided
        let tenLoaiPhieu: string | null = null
        if (input.loai_phieu_id !== undefined) {
            if (input.loai_phieu_id) {
                const { data: loaiPhieuData } = await supabase
                    .from("htbh_loai_phieu")
                    .select("ten_loai_phieu")
                    .eq("id", input.loai_phieu_id)
                    .single()
                
                tenLoaiPhieu = loaiPhieuData?.ten_loai_phieu || null
            } else {
                tenLoaiPhieu = null
            }
        }

        // Sanitize input: convert empty strings to null for optional fields
        const sanitizedInput: any = {}
        if (input.ten_hang_muc !== undefined) sanitizedInput.ten_hang_muc = input.ten_hang_muc
        if (input.mo_ta !== undefined) {
            sanitizedInput.mo_ta = input.mo_ta && input.mo_ta.trim() !== "" ? input.mo_ta : null
        }
        if (input.loai_phieu_id !== undefined) {
            sanitizedInput.loai_phieu_id = input.loai_phieu_id
            sanitizedInput.ten_loai_phieu = tenLoaiPhieu
        }
        if (input.tg_cap_nhat !== undefined) sanitizedInput.tg_cap_nhat = input.tg_cap_nhat

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(sanitizedInput)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật hạng mục:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi cập nhật hạng mục")
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
        } as HangMuc
    }

    /**
     * Delete hạng mục
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa hạng mục:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete hạng mục
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt hạng mục:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Get hạng mục by loai_phieu_id
     */
    static async getByLoaiPhieuId(loaiPhieuId: number): Promise<HangMuc[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .eq("loai_phieu_id", loaiPhieuId)
            .order("tg_tao", { ascending: false })

        if (error) {
            console.error("Lỗi khi tải danh sách hạng mục theo loại phiếu:", error)
            throw new Error(error.message)
        }

        if (!data || data.length === 0) {
            return []
        }

        // Fetch nguoi_tao data in batch
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

        // Fetch ten_loai_phieu (should be the same for all, but fetch to be safe)
        let tenLoaiPhieu: string | null = null
        if (loaiPhieuId) {
            const { data: loaiPhieuData } = await supabase
                .from("htbh_loai_phieu")
                .select("ten_loai_phieu")
                .eq("id", loaiPhieuId)
                .single()
            
            tenLoaiPhieu = loaiPhieuData?.ten_loai_phieu || null
        }

        // Enrich data
        return data.map(item => ({
            ...item,
            ten_loai_phieu: tenLoaiPhieu || item.ten_loai_phieu || null,
            nguoi_tao_ten: item.nguoi_tao_id ? (nhanSuMap.get(item.nguoi_tao_id) || null) : null,
        })) as HangMuc[]
    }
}

