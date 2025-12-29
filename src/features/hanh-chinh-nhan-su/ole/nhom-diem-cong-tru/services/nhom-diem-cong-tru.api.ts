import { supabase } from "@/lib/supabase"
import { NhomDiemCongTru } from "../schema"
import type { CreateNhomDiemCongTruInput, UpdateNhomDiemCongTruInput } from "../types"

const TABLE_NAME = "ole_nhom_diem_cong_tru"

/**
 * API service for Nhóm Điểm Cộng Trừ
 * Handles all Supabase operations
 */
export class NhomDiemCongTruAPI {
    /**
     * Get all nhóm điểm cộng trừ
     */
    static async getAll(): Promise<NhomDiemCongTru[]> {
        // First get all nhom diem data
        const { data: nhomDiemData, error: nhomDiemError } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("id", { ascending: false })

        if (nhomDiemError) {
            console.error("Lỗi khi tải danh sách nhóm điểm cộng trừ:", nhomDiemError)
            throw new Error(nhomDiemError.message)
        }

        if (!nhomDiemData || nhomDiemData.length === 0) {
            return []
        }

        // Get unique nguoi_tao_id values
        const nguoiTaoIds = Array.from(
            new Set(
                nhomDiemData
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
        return nhomDiemData.map((item: any) => {
            const nguoiTao = nguoiTaoMap.get(item.nguoi_tao_id)
            // Handle pb_ap_dung_ib as JSONB array
            const pbApDungIb = Array.isArray(item.pb_ap_dung_ib) 
                ? item.pb_ap_dung_ib 
                : (item.pb_ap_dung_ib ? [item.pb_ap_dung_ib] : null)
            return {
                ...item,
                pb_ap_dung_ib: pbApDungIb,
                nguoi_tao_ten: nguoiTao?.ho_ten || null,
                nguoi_tao: nguoiTao || null,
            }
        }) as NhomDiemCongTru[]
    }

    /**
     * Get nhóm điểm cộng trừ by ID
     */
    static async getById(id: number): Promise<NhomDiemCongTru | null> {
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
            console.error("Lỗi khi tải chi tiết nhóm điểm cộng trừ:", error)
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

        // Handle pb_ap_dung_ib as JSONB array
        const pbApDungIb = Array.isArray(data.pb_ap_dung_ib) 
            ? data.pb_ap_dung_ib 
            : (data.pb_ap_dung_ib ? [data.pb_ap_dung_ib] : null)

        return {
            ...data,
            pb_ap_dung_ib: pbApDungIb,
            nguoi_tao_ten: nguoiTaoTen,
            nguoi_tao: data.nguoi_tao_id && nguoiTaoTen ? {
                ma_nhan_vien: data.nguoi_tao_id,
                ho_ten: nguoiTaoTen,
            } : null,
        } as NhomDiemCongTru
    }

    /**
     * Create new nhóm điểm cộng trừ
     */
    static async create(input: CreateNhomDiemCongTruInput): Promise<NhomDiemCongTru> {
        // Remove fields that don't exist in the database table
        const { nguoi_tao, nguoi_tao_ten, ...createInput } = input as any
        
        // Handle pb_ap_dung_ib - ensure it's stored as array or null
        if (createInput.pb_ap_dung_ib !== undefined) {
            createInput.pb_ap_dung_ib = Array.isArray(createInput.pb_ap_dung_ib) && createInput.pb_ap_dung_ib.length > 0
                ? createInput.pb_ap_dung_ib
                : null
        }
        
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(createInput)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo nhóm điểm cộng trừ:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không thể tạo nhóm điểm cộng trừ")
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

        // Handle pb_ap_dung_ib as JSONB array
        const pbApDungIb = Array.isArray(data.pb_ap_dung_ib) 
            ? data.pb_ap_dung_ib 
            : (data.pb_ap_dung_ib ? [data.pb_ap_dung_ib] : null)

        return {
            ...data,
            pb_ap_dung_ib: pbApDungIb,
            nguoi_tao_ten: nguoiTaoTen,
            nguoi_tao: data.nguoi_tao_id && nguoiTaoTen ? {
                ma_nhan_vien: data.nguoi_tao_id,
                ho_ten: nguoiTaoTen,
            } : null,
        } as NhomDiemCongTru
    }

    /**
     * Update nhóm điểm cộng trừ
     */
    static async update(id: number, input: UpdateNhomDiemCongTruInput): Promise<NhomDiemCongTru> {
        // Remove fields that don't exist in the database table
        const { nguoi_tao, nguoi_tao_ten, ...updateInput } = input as any
        
        // Handle pb_ap_dung_ib - ensure it's stored as array or null
        if (updateInput.pb_ap_dung_ib !== undefined) {
            updateInput.pb_ap_dung_ib = Array.isArray(updateInput.pb_ap_dung_ib) && updateInput.pb_ap_dung_ib.length > 0
                ? updateInput.pb_ap_dung_ib
                : null
        }
        
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(updateInput)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật nhóm điểm cộng trừ:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không thể cập nhật nhóm điểm cộng trừ")
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

        // Handle pb_ap_dung_ib as JSONB array
        const pbApDungIb = Array.isArray(data.pb_ap_dung_ib) 
            ? data.pb_ap_dung_ib 
            : (data.pb_ap_dung_ib ? [data.pb_ap_dung_ib] : null)

        return {
            ...data,
            pb_ap_dung_ib: pbApDungIb,
            nguoi_tao_ten: nguoiTaoTen,
            nguoi_tao: data.nguoi_tao_id && nguoiTaoTen ? {
                ma_nhan_vien: data.nguoi_tao_id,
                ho_ten: nguoiTaoTen,
            } : null,
        } as NhomDiemCongTru
    }

    /**
     * Delete nhóm điểm cộng trừ
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa nhóm điểm cộng trừ:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete nhóm điểm cộng trừ
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt nhóm điểm cộng trừ:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Get unique nguoi_tao_id values with names (for filter)
     */
    static async getUniqueNguoiTaoIds(): Promise<Array<{ id: number; ten: string }>> {
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
                ten: nhanSu?.ho_ten || `ID: ${id}`,
            }
        })
    }

    /**
     * Get unique hang_muc values (for filter)
     */
    static async getUniqueHangMuc(): Promise<string[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("hang_muc")
            .not("hang_muc", "is", null)

        if (error) {
            console.error("Lỗi khi tải danh sách hạng mục:", error)
            throw new Error(error.message)
        }

        return Array.from(new Set((data || []).map((item: any) => item.hang_muc).filter(Boolean)))
    }

    /**
     * Get unique nhom values (for filter)
     */
    static async getUniqueNhom(): Promise<string[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("nhom")
            .not("nhom", "is", null)

        if (error) {
            console.error("Lỗi khi tải danh sách nhóm:", error)
            throw new Error(error.message)
        }

        return Array.from(new Set((data || []).map((item: any) => item.nhom).filter(Boolean)))
    }
}

