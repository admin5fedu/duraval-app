import { supabase } from "@/lib/supabase"
import { DanhMucTaiLieu } from "../schema"
import type { CreateDanhMucTaiLieuInput, UpdateDanhMucTaiLieuInput } from "../types"

const TABLE_NAME = "tai_lieu_danh_muc_tai_lieu"

/**
 * API service for Danh Mục Tài Liệu
 * Handles all Supabase operations
 */
export class DanhMucTaiLieuAPI {
    /**
     * Get all danh mục tài liệu
     */
    static async getAll(): Promise<DanhMucTaiLieu[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select(`
                id,
                hang_muc,
                loai_id,
                loai_tai_lieu,
                cap,
                ten_danh_muc,
                danh_muc_cha_id,
                ten_danh_muc_cha,
                mo_ta,
                nguoi_tao_id,
                tg_tao,
                tg_cap_nhat
            `)
            .order("tg_tao", { ascending: false })
            .range(0, 99999) // Get up to 100k rows

        if (error) {
            console.error("Lỗi khi tải danh sách danh mục tài liệu:", error)
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

        // Enrich with loai_tai_lieu from tai_lieu_loai
        const loaiIds = [...new Set(data.map(item => item.loai_id).filter(Boolean))]
        const loaiTaiLieuMap = new Map<number, string>()
        
        if (loaiIds.length > 0) {
            const { data: loaiTaiLieuData } = await supabase
                .from("tai_lieu_loai")
                .select("id, loai")
                .in("id", loaiIds)

            if (loaiTaiLieuData) {
                loaiTaiLieuData.forEach(loai => {
                    loaiTaiLieuMap.set(loai.id, loai.loai)
                })
            }
        }

        return data.map(item => ({
            ...item,
            nguoi_tao_ten: nhanSuMap.get(item.nguoi_tao_id) || null,
            loai_tai_lieu: item.loai_id ? (loaiTaiLieuMap.get(item.loai_id) || null) : null,
        })) as DanhMucTaiLieu[]
    }

    /**
     * Get danh mục tài liệu by ID
     */
    static async getById(id: number): Promise<DanhMucTaiLieu | null> {
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
            console.error("Lỗi khi tải chi tiết danh mục tài liệu:", error)
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

        // Enrich with loai_tai_lieu from tai_lieu_loai
        let loaiTaiLieu: string | null = null
        if (data.loai_id) {
            const { data: loaiTaiLieuData } = await supabase
                .from("tai_lieu_loai")
                .select("loai")
                .eq("id", data.loai_id)
                .single()
            
            loaiTaiLieu = loaiTaiLieuData?.loai || null
        }

        return {
            ...data,
            nguoi_tao_ten: nguoiTaoTen,
            loai_tai_lieu: loaiTaiLieu,
        } as DanhMucTaiLieu
    }

    /**
     * Create new danh mục tài liệu
     */
    static async create(input: CreateDanhMucTaiLieuInput): Promise<DanhMucTaiLieu> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert([{
                hang_muc: input.hang_muc,
                loai_id: input.loai_id,
                loai_tai_lieu: input.loai_tai_lieu || null,
                cap: input.cap,
                ten_danh_muc: input.ten_danh_muc || null,
                danh_muc_cha_id: input.danh_muc_cha_id || null,
                ten_danh_muc_cha: input.ten_danh_muc_cha || null,
                mo_ta: input.mo_ta || null,
                nguoi_tao_id: input.nguoi_tao_id || null,
            }])
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo danh mục tài liệu:", error)
            throw new Error(error.message)
        }

        return data as DanhMucTaiLieu
    }

    /**
     * Update danh mục tài liệu
     */
    static async update(id: number, input: UpdateDanhMucTaiLieuInput): Promise<DanhMucTaiLieu> {
        const updateData: any = {}
        if (input.hang_muc !== undefined) updateData.hang_muc = input.hang_muc
        if (input.loai_id !== undefined) updateData.loai_id = input.loai_id
        if (input.loai_tai_lieu !== undefined) updateData.loai_tai_lieu = input.loai_tai_lieu
        if (input.cap !== undefined) updateData.cap = input.cap
        if (input.ten_danh_muc !== undefined) updateData.ten_danh_muc = input.ten_danh_muc
        if (input.danh_muc_cha_id !== undefined) updateData.danh_muc_cha_id = input.danh_muc_cha_id
        if (input.ten_danh_muc_cha !== undefined) updateData.ten_danh_muc_cha = input.ten_danh_muc_cha
        if (input.mo_ta !== undefined) updateData.mo_ta = input.mo_ta

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(updateData)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật danh mục tài liệu:", error)
            throw new Error(error.message)
        }

        return data as DanhMucTaiLieu
    }

    /**
     * Delete danh mục tài liệu (cascade: xóa cả danh mục con)
     */
    static async delete(id: number): Promise<void> {
        // First, find all children (cấp 2) that have this as parent
        const { data: children, error: childrenError } = await supabase
            .from(TABLE_NAME)
            .select("id")
            .eq("danh_muc_cha_id", id)

        if (childrenError) {
            console.error("Lỗi khi tìm danh mục con:", childrenError)
            throw new Error(childrenError.message)
        }

        // Collect all IDs to delete (parent + children)
        const idsToDelete = [id]
        if (children && children.length > 0) {
            idsToDelete.push(...children.map(child => child.id))
        }

        // Delete all (parent and children) in one operation
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", idsToDelete)

        if (error) {
            console.error("Lỗi khi xóa danh mục tài liệu:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete danh mục tài liệu (cascade: xóa cả danh mục con)
     */
    static async batchDelete(ids: number[]): Promise<void> {
        if (ids.length === 0) return

        // First, find all children (cấp 2) that have any of these as parent
        const { data: children, error: childrenError } = await supabase
            .from(TABLE_NAME)
            .select("id")
            .in("danh_muc_cha_id", ids)

        if (childrenError) {
            console.error("Lỗi khi tìm danh mục con:", childrenError)
            throw new Error(childrenError.message)
        }

        // Collect all IDs to delete (parents + children)
        const idsToDelete = [...ids]
        if (children && children.length > 0) {
            idsToDelete.push(...children.map(child => child.id))
        }

        // Remove duplicates
        const uniqueIdsToDelete = [...new Set(idsToDelete)]

        // Delete all (parents and children) in one operation
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", uniqueIdsToDelete)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt danh mục tài liệu:", error)
            throw new Error(error.message)
        }
    }
}

