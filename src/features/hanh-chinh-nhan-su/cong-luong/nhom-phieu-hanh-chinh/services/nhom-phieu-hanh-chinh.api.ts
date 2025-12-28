import { supabase } from "@/lib/supabase"
import { NhomPhieuHanhChinh, CreateNhomPhieuHanhChinhInput, UpdateNhomPhieuHanhChinhInput } from "../schema"

const TABLE_NAME = "hanh_chinh_nhom_phieu"

/**
 * API service for Nhóm Phiếu Hành Chính
 * Handles all Supabase operations
 */
export class NhomPhieuHanhChinhAPI {
    /**
     * Get all nhóm phiếu hành chính
     */
    static async getAll(): Promise<NhomPhieuHanhChinh[]> {
        // First get all nhom phieu data
        const { data: nhomPhieuData, error: nhomPhieuError } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("ma_nhom_phieu", { ascending: true })

        if (nhomPhieuError) {
            console.error("Lỗi khi tải danh sách nhóm phiếu hành chính:", nhomPhieuError)
            throw new Error(nhomPhieuError.message)
        }

        if (!nhomPhieuData || nhomPhieuData.length === 0) {
            return []
        }

        // Get unique nguoi_tao_id values
        const nguoiTaoIds = Array.from(
            new Set(
                nhomPhieuData
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
        return nhomPhieuData.map((item: any) => {
            const nguoiTao = nguoiTaoMap.get(item.nguoi_tao_id)
            return {
                ...item,
                nguoi_tao_ten: nguoiTao?.ho_ten || null,
                nguoi_tao: nguoiTao || null,
            }
        }) as NhomPhieuHanhChinh[]
    }

    /**
     * Get nhóm phiếu hành chính by ID
     */
    static async getById(id: number): Promise<NhomPhieuHanhChinh | null> {
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
            console.error("Lỗi khi tải chi tiết nhóm phiếu hành chính:", error)
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
        } as NhomPhieuHanhChinh
    }

    /**
     * Get nhóm phiếu hành chính by ma_nhom_phieu list (for Excel import optimization)
     */
    static async getByMaNhomPhieuList(maNhomPhieuList: string[]): Promise<NhomPhieuHanhChinh[]> {
        if (maNhomPhieuList.length === 0) {
            return []
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .in("ma_nhom_phieu", maNhomPhieuList)

        if (error) {
            console.error("Lỗi khi tải nhóm phiếu hành chính theo mã:", error)
            throw new Error(error.message)
        }

        if (!data || data.length === 0) {
            return []
        }

        // Get unique nguoi_tao_id values
        const nguoiTaoIds = Array.from(
            new Set(
                data
                    .map((item: any) => item.nguoi_tao_id)
                    .filter((id): id is number => id !== null && id !== undefined)
            )
        )

        // Fetch nhan su data for these IDs
        let nguoiTaoMap = new Map<number, { ma_nhan_vien: number; ho_ten: string }>()
        if (nguoiTaoIds.length > 0) {
            const { data: nhanSuData } = await supabase
                .from("var_nhan_su")
                .select("ma_nhan_vien, ho_ten")
                .in("ma_nhan_vien", nguoiTaoIds)

            if (nhanSuData) {
                nguoiTaoMap = new Map(
                    nhanSuData.map((ns: any) => [ns.ma_nhan_vien, ns])
                )
            }
        }

        // Map data to include nguoi_tao_ten
        return data.map((item: any) => {
            const nguoiTao = nguoiTaoMap.get(item.nguoi_tao_id)
            return {
                ...item,
                nguoi_tao_ten: nguoiTao?.ho_ten || null,
                nguoi_tao: nguoiTao || null,
            }
        }) as NhomPhieuHanhChinh[]
    }

    /**
     * Create new nhóm phiếu hành chính
     */
    static async create(input: CreateNhomPhieuHanhChinhInput): Promise<NhomPhieuHanhChinh> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(input)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo nhóm phiếu hành chính:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không thể tạo nhóm phiếu hành chính")
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
        } as NhomPhieuHanhChinh
    }

    /**
     * Update nhóm phiếu hành chính
     */
    static async update(id: number, input: UpdateNhomPhieuHanhChinhInput): Promise<NhomPhieuHanhChinh> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(input)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật nhóm phiếu hành chính:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không thể cập nhật nhóm phiếu hành chính")
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
        } as NhomPhieuHanhChinh
    }

    /**
     * Delete nhóm phiếu hành chính
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa nhóm phiếu hành chính:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete nhóm phiếu hành chính
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt nhóm phiếu hành chính:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Get unique loại phiếu values for autocomplete
     */
    static async getUniqueLoaiPhieu(): Promise<string[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("loai_phieu")
            .not("loai_phieu", "is", null)

        if (error) {
            console.error("Lỗi khi tải danh sách loại phiếu:", error)
            throw new Error(error.message)
        }

        // Extract unique values and filter out null/empty
        const uniqueValues = Array.from(
            new Set(
                (data || [])
                    .map((item) => item.loai_phieu)
                    .filter((value): value is string => Boolean(value && value.trim()))
            )
        ).sort()

        return uniqueValues
    }

    /**
     * Get unique người tạo IDs for filter
     */
    static async getUniqueNguoiTaoIds(): Promise<Array<{ id: number; ten: string }>> {
        // Get unique nguoi_tao_id from table
        const { data: nhomPhieuData, error: nhomPhieuError } = await supabase
            .from(TABLE_NAME)
            .select("nguoi_tao_id")
            .not("nguoi_tao_id", "is", null)

        if (nhomPhieuError) {
            console.error("Lỗi khi tải danh sách người tạo:", nhomPhieuError)
            throw new Error(nhomPhieuError.message)
        }

        // Extract unique IDs
        const uniqueIds = Array.from(
            new Set(
                (nhomPhieuData || [])
                    .map((item: any) => item.nguoi_tao_id)
                    .filter((id): id is number => id !== null && id !== undefined)
            )
        )

        if (uniqueIds.length === 0) {
            return []
        }

        // Fetch nhan su data for these IDs
        const { data: nhanSuData, error: nhanSuError } = await supabase
            .from("var_nhan_su")
            .select("ma_nhan_vien, ho_ten")
            .in("ma_nhan_vien", uniqueIds)

        if (nhanSuError) {
            console.error("Lỗi khi tải thông tin nhân sự:", nhanSuError)
            // Return IDs without names if fetch fails
            return uniqueIds.map((id) => ({
                id,
                ten: `ID: ${id}`,
            }))
        }

        // Create map for quick lookup
        const nhanSuMap = new Map<number, string>()
        ;(nhanSuData || []).forEach((ns: any) => {
            nhanSuMap.set(ns.ma_nhan_vien, ns.ho_ten)
        })

        // Build result array
        return uniqueIds
            .map((id) => ({
                id,
                ten: nhanSuMap.get(id) || `ID: ${id}`,
            }))
            .sort((a, b) => a.ten.localeCompare(b.ten))
    }
}

