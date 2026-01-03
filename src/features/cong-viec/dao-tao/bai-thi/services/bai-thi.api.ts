import { supabase } from "@/lib/supabase"
import { BaiThi, CreateBaiThiInput, UpdateBaiThiInput } from "../schema"

const TABLE_NAME = "dao_tao_bai_thi"

/**
 * API service for Bài thi
 * Handles all Supabase operations
 */
export class BaiThiAPI {
    /**
     * Get all bài thi
     */
    static async getAll(): Promise<BaiThi[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("ngay_lam_bai", { ascending: false })
            .order("tg_tao", { ascending: false })

        if (error) {
            console.error("Lỗi khi tải danh sách bài thi:", error)
            throw new Error(error.message)
        }

        if (!data || data.length === 0) {
            return []
        }

        return data.map((item: any) => ({
            ...item,
            chi_tiet_bai_lam: item.chi_tiet_bai_lam || null,
            trao_doi: item.trao_doi || null,
        })) as BaiThi[]
    }

    /**
     * Get bài thi by ID
     */
    static async getById(id: number): Promise<BaiThi | null> {
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
            console.error("Lỗi khi tải chi tiết bài thi:", error)
            throw new Error(error.message)
        }

        if (!data) {
            return null
        }

        return {
            ...data,
            chi_tiet_bai_lam: data.chi_tiet_bai_lam || null,
            trao_doi: data.trao_doi || null,
        } as BaiThi
    }

    /**
     * Create new bài thi
     */
    static async create(input: CreateBaiThiInput): Promise<BaiThi> {
        // Validation
        if (!input.ky_thi_id || input.ky_thi_id <= 0) {
            throw new Error("Kỳ thi là bắt buộc")
        }

        if (!input.nhan_vien_id || input.nhan_vien_id <= 0) {
            throw new Error("Nhân viên là bắt buộc")
        }

        if (!input.ngay_lam_bai || !String(input.ngay_lam_bai).trim()) {
            throw new Error("Ngày làm bài là bắt buộc")
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert({
                ky_thi_id: input.ky_thi_id,
                nhan_vien_id: input.nhan_vien_id,
                ngay_lam_bai: input.ngay_lam_bai,
                thoi_gian_bat_dau: input.thoi_gian_bat_dau || null,
                thoi_gian_ket_thuc: input.thoi_gian_ket_thuc || null,
                diem_so: input.diem_so ?? 0,
                tong_so_cau: input.tong_so_cau ?? 0,
                trang_thai: input.trang_thai || "Chưa thi",
                chi_tiet_bai_lam: input.chi_tiet_bai_lam || null,
                trao_doi: input.trao_doi || null,
            })
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo bài thi:", error)
            throw new Error(error.message)
        }

        return {
            ...data,
            chi_tiet_bai_lam: data.chi_tiet_bai_lam || null,
            trao_doi: data.trao_doi || null,
        } as BaiThi
    }

    /**
     * Update bài thi
     */
    static async update(id: number, input: UpdateBaiThiInput): Promise<BaiThi> {
        const updateData: any = {}

        if (input.ky_thi_id !== undefined) {
            updateData.ky_thi_id = input.ky_thi_id
        }
        if (input.nhan_vien_id !== undefined) {
            updateData.nhan_vien_id = input.nhan_vien_id
        }
        if (input.ngay_lam_bai !== undefined) {
            updateData.ngay_lam_bai = input.ngay_lam_bai
        }
        if (input.thoi_gian_bat_dau !== undefined) {
            updateData.thoi_gian_bat_dau = input.thoi_gian_bat_dau
        }
        if (input.thoi_gian_ket_thuc !== undefined) {
            updateData.thoi_gian_ket_thuc = input.thoi_gian_ket_thuc
        }
        if (input.diem_so !== undefined) {
            updateData.diem_so = input.diem_so
        }
        if (input.tong_so_cau !== undefined) {
            updateData.tong_so_cau = input.tong_so_cau
        }
        if (input.trang_thai !== undefined) {
            updateData.trang_thai = input.trang_thai
        }
        if (input.chi_tiet_bai_lam !== undefined) {
            updateData.chi_tiet_bai_lam = input.chi_tiet_bai_lam
        }
        if (input.trao_doi !== undefined) {
            updateData.trao_doi = input.trao_doi
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(updateData)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật bài thi:", error)
            throw new Error(error.message)
        }

        return {
            ...data,
            chi_tiet_bai_lam: data.chi_tiet_bai_lam || null,
            trao_doi: data.trao_doi || null,
        } as BaiThi
    }

    /**
     * Delete bài thi
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa bài thi:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete bài thi
     */
    static async batchDelete(ids: number[]): Promise<void> {
        if (ids.length === 0) {
            return
        }

        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa nhiều bài thi:", error)
            throw new Error(error.message)
        }
    }
}

