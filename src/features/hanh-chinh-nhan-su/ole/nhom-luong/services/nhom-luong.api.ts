import { supabase } from "@/lib/supabase"
import { NhomLuong } from "../schema"
import type { CreateNhomLuongInput, UpdateNhomLuongInput } from "../types"

const TABLE_NAME = "ole_nhom_luong"

/**
 * API service for Nhóm Lương
 * Handles all Supabase operations
 */
export class NhomLuongAPI {
    /**
     * Get all nhóm lương
     */
    static async getAll(): Promise<NhomLuong[]> {
        const { data: nhomLuongData, error: nhomLuongError } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("id", { ascending: false })

        if (nhomLuongError) {
            console.error("Lỗi khi tải danh sách nhóm lương:", nhomLuongError)
            throw new Error(nhomLuongError.message)
        }

        if (!nhomLuongData || nhomLuongData.length === 0) {
            return []
        }

        // Get unique nguoi_tao_id values
        const nguoiTaoIds = Array.from(
            new Set(
                nhomLuongData
                    .map((item: any) => item.nguoi_tao_id)
                    .filter((id): id is number => id !== null && id !== undefined)
            )
        )

        // Fetch nhan su data for these IDs (nguoi_tao_id = ma_nhan_vien)
        let nguoiTaoMap = new Map<number, { ma_nhan_vien: number; ho_ten: string }>()
        if (nguoiTaoIds.length > 0) {
            const { data: nhanSuData, error: nhanSuError } = await supabase
                .from("var_nhan_su")
                .select("ma_nhan_vien, ho_ten")
                .in("ma_nhan_vien", nguoiTaoIds)

            if (nhanSuError) {
                console.warn("Lỗi khi tải thông tin nhân sự:", nhanSuError)
            } else {
                nguoiTaoMap = new Map(
                    (nhanSuData || []).map((ns: any) => [ns.ma_nhan_vien, ns])
                )
            }
        }

        // Map data to include nguoi_tao_ten and nguoi_tao object
        return nhomLuongData.map((item: any) => {
            const nguoiTao = nguoiTaoMap.get(item.nguoi_tao_id)
            return {
                ...item,
                nguoi_tao_ten: nguoiTao?.ho_ten || null,
                nguoi_tao: nguoiTao || null,
            }
        }) as NhomLuong[]
    }

    /**
     * Get nhóm lương by ID
     */
    static async getById(id: number): Promise<NhomLuong | null> {
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
            console.error("Lỗi khi tải chi tiết nhóm lương:", error)
            throw new Error(error.message)
        }

        if (!data) {
            return null
        }

        // Fetch nguoi_tao info if exists
        let nguoiTaoTen = null
        if (data.nguoi_tao_id) {
            const { data: nhanSuData } = await supabase
                .from("var_nhan_su")
                .select("ma_nhan_vien, ho_ten")
                .eq("ma_nhan_vien", data.nguoi_tao_id)
                .single()

            if (nhanSuData) {
                nguoiTaoTen = nhanSuData.ho_ten
            }
        }

        return {
            ...data,
            nguoi_tao_ten: nguoiTaoTen,
            nguoi_tao: data.nguoi_tao_id && nguoiTaoTen ? {
                ma_nhan_vien: data.nguoi_tao_id,
                ho_ten: nguoiTaoTen,
            } : null,
        } as NhomLuong
    }

    /**
     * Create new nhóm lương
     */
    static async create(input: CreateNhomLuongInput): Promise<NhomLuong> {
        // Remove fields that don't exist in the database table
        const { nguoi_tao, nguoi_tao_ten, ...createInput } = input as any
        
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(createInput)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo nhóm lương:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không thể tạo nhóm lương")
        }

        // Fetch nguoi_tao info if exists
        let nguoiTaoTen = null
        if (data.nguoi_tao_id) {
            const { data: nhanSuData } = await supabase
                .from("var_nhan_su")
                .select("ma_nhan_vien, ho_ten")
                .eq("ma_nhan_vien", data.nguoi_tao_id)
                .single()

            if (nhanSuData) {
                nguoiTaoTen = nhanSuData.ho_ten
            }
        }

        return {
            ...data,
            nguoi_tao_ten: nguoiTaoTen,
            nguoi_tao: data.nguoi_tao_id && nguoiTaoTen ? {
                ma_nhan_vien: data.nguoi_tao_id,
                ho_ten: nguoiTaoTen,
            } : null,
        } as NhomLuong
    }

    /**
     * Update nhóm lương
     */
    static async update(id: number, input: UpdateNhomLuongInput): Promise<NhomLuong> {
        // Remove fields that don't exist in the database table
        const { nguoi_tao, nguoi_tao_ten, ...updateInput } = input as any
        
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(updateInput)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật nhóm lương:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không thể cập nhật nhóm lương")
        }

        // Fetch nguoi_tao info if exists
        let nguoiTaoTen = null
        if (data.nguoi_tao_id) {
            const { data: nhanSuData } = await supabase
                .from("var_nhan_su")
                .select("ma_nhan_vien, ho_ten")
                .eq("ma_nhan_vien", data.nguoi_tao_id)
                .single()

            if (nhanSuData) {
                nguoiTaoTen = nhanSuData.ho_ten
            }
        }

        return {
            ...data,
            nguoi_tao_ten: nguoiTaoTen,
            nguoi_tao: data.nguoi_tao_id && nguoiTaoTen ? {
                ma_nhan_vien: data.nguoi_tao_id,
                ho_ten: nguoiTaoTen,
            } : null,
        } as NhomLuong
    }

    /**
     * Delete nhóm lương
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa nhóm lương:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete nhóm lương
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt nhóm lương:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Get unique nguoi_tao_id values with names (for filter)
     */
    static async getUniqueNguoiTaoIds(): Promise<Array<{ id: number; ten: string; ma_nhan_vien?: number }>> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("nguoi_tao_id")
            .not("nguoi_tao_id", "is", null)

        if (error) {
            console.error("Lỗi khi tải danh sách người tạo:", error)
            throw new Error(error.message)
        }

        const uniqueIds = Array.from(new Set((data || []).map((item: any) => item.nguoi_tao_id)))

        if (uniqueIds.length === 0) {
            return []
        }

        // Fetch nhan su data
        const { data: nhanSuData } = await supabase
            .from("var_nhan_su")
            .select("ma_nhan_vien, ho_ten")
            .in("ma_nhan_vien", uniqueIds)

        const nhanSuMap = new Map(
            (nhanSuData || []).map((ns: any) => [ns.ma_nhan_vien, ns])
        )

        return uniqueIds.map((id: number) => {
            const nhanSu = nhanSuMap.get(id)
            return {
                id,
                ma_nhan_vien: nhanSu?.ma_nhan_vien || id,
                ten: nhanSu?.ho_ten || `ID: ${id}`,
            }
        })
    }
}

