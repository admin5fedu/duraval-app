import { supabase } from "@/lib/supabase"
import { TaiLieuBieuMau } from "../schema"
import type { CreateTaiLieuBieuMauInput, UpdateTaiLieuBieuMauInput } from "../types"

const TABLE_NAME = "tai_lieu_ds_tai_lieu_bieu_mau"

/**
 * API service for Tài Liệu & Biểu Mẫu
 * Handles all Supabase operations
 */
export class TaiLieuBieuMauAPI {
    /**
     * Get all tài liệu & biểu mẫu
     */
    static async getAll(): Promise<TaiLieuBieuMau[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select(`
                id,
                hang_muc,
                loai_id,
                ten_loai,
                danh_muc_id,
                ten_danh_muc,
                danh_muc_cha_id,
                ten_danh_muc_cha,
                ma_tai_lieu,
                ten_tai_lieu,
                mo_ta,
                link_du_thao,
                link_ap_dung,
                ghi_chu,
                trang_thai,
                phan_phoi_pb_id,
                tai_lieu_cha_id,
                trao_doi,
                nguoi_tao_id,
                tg_tao,
                tg_cap_nhat
            `)
            .order("tg_tao", { ascending: false })
            .range(0, 99999) // Get up to 100k rows

        if (error) {
            console.error("Lỗi khi tải danh sách tài liệu & biểu mẫu:", error)
            throw new Error(error.message)
        }

        if (!data || data.length === 0) {
            return []
        }

        // Enrich with nguoi_tao_ten from var_nhan_su
        const nguoiTaoIds = [...new Set(data.map(item => item.nguoi_tao_id).filter(Boolean))]
        const nhanSuMap = new Map<number, string>()
        
        if (nguoiTaoIds.length > 0) {
            const { data: nhanSuData } = await supabase
                .from("var_nhan_su")
                .select("ma_nhan_vien, ho_ten")
                .in("ma_nhan_vien", nguoiTaoIds)

            if (nhanSuData) {
                nhanSuData.forEach(ns => {
                    nhanSuMap.set(ns.ma_nhan_vien, ns.ho_ten)
                })
            }
        }

        // ten_danh_muc is now text (name), no need to enrich
        return data.map(item => ({
            ...item,
            nguoi_tao_ten: nhanSuMap.get(item.nguoi_tao_id) || null,
        })) as TaiLieuBieuMau[]
    }

    /**
     * Get tài liệu & biểu mẫu by ID
     */
    static async getById(id: number): Promise<TaiLieuBieuMau | null> {
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
            console.error("Lỗi khi tải chi tiết tài liệu & biểu mẫu:", error)
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
        } as TaiLieuBieuMau
    }

    /**
     * Create new tài liệu & biểu mẫu
     */
    static async create(input: CreateTaiLieuBieuMauInput): Promise<TaiLieuBieuMau> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert([{
                hang_muc: input.hang_muc || null,
                loai_id: input.loai_id || null,
                ten_loai: input.ten_loai || null,
                danh_muc_id: input.danh_muc_id || null,
                ten_danh_muc: input.ten_danh_muc || null,
                danh_muc_cha_id: input.danh_muc_cha_id || null,
                ten_danh_muc_cha: input.ten_danh_muc_cha || null,
                ma_tai_lieu: input.ma_tai_lieu || null,
                ten_tai_lieu: input.ten_tai_lieu || null,
                mo_ta: input.mo_ta || null,
                link_du_thao: input.link_du_thao || null,
                link_ap_dung: input.link_ap_dung || null,
                ghi_chu: input.ghi_chu || null,
                trang_thai: input.trang_thai || null,
                phan_phoi_pb_id: input.phan_phoi_pb_id || null,
                tai_lieu_cha_id: input.tai_lieu_cha_id || null,
                trao_doi: input.trao_doi || null,
                nguoi_tao_id: input.nguoi_tao_id || null,
            }])
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo tài liệu & biểu mẫu:", error)
            throw new Error(error.message)
        }

        return data as TaiLieuBieuMau
    }

    /**
     * Update tài liệu & biểu mẫu
     */
    static async update(id: number, input: UpdateTaiLieuBieuMauInput): Promise<TaiLieuBieuMau> {
        const updateData: any = {}
        if (input.hang_muc !== undefined) updateData.hang_muc = input.hang_muc
        if (input.loai_id !== undefined) updateData.loai_id = input.loai_id
        if (input.ten_loai !== undefined) updateData.ten_loai = input.ten_loai
        if (input.danh_muc_id !== undefined) updateData.danh_muc_id = input.danh_muc_id
        if (input.ten_danh_muc !== undefined) updateData.ten_danh_muc = input.ten_danh_muc
        if (input.danh_muc_cha_id !== undefined) updateData.danh_muc_cha_id = input.danh_muc_cha_id
        if (input.ten_danh_muc_cha !== undefined) updateData.ten_danh_muc_cha = input.ten_danh_muc_cha
        if (input.ma_tai_lieu !== undefined) updateData.ma_tai_lieu = input.ma_tai_lieu
        if (input.ten_tai_lieu !== undefined) updateData.ten_tai_lieu = input.ten_tai_lieu
        if (input.mo_ta !== undefined) updateData.mo_ta = input.mo_ta
        if (input.link_du_thao !== undefined) updateData.link_du_thao = input.link_du_thao
        if (input.link_ap_dung !== undefined) updateData.link_ap_dung = input.link_ap_dung
        if (input.ghi_chu !== undefined) updateData.ghi_chu = input.ghi_chu
        if (input.trang_thai !== undefined) updateData.trang_thai = input.trang_thai
        if (input.phan_phoi_pb_id !== undefined) updateData.phan_phoi_pb_id = input.phan_phoi_pb_id
        if (input.tai_lieu_cha_id !== undefined) updateData.tai_lieu_cha_id = input.tai_lieu_cha_id
        if (input.trao_doi !== undefined) updateData.trao_doi = input.trao_doi

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(updateData)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật tài liệu & biểu mẫu:", error)
            throw new Error(error.message)
        }

        return data as TaiLieuBieuMau
    }

    /**
     * Delete tài liệu & biểu mẫu
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa tài liệu & biểu mẫu:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete tài liệu & biểu mẫu
     */
    static async batchDelete(ids: number[]): Promise<void> {
        if (ids.length === 0) return

        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt tài liệu & biểu mẫu:", error)
            throw new Error(error.message)
        }
    }
}

