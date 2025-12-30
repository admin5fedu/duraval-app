import { supabase } from "@/lib/supabase"
import { TrucHat } from "../schema"
import type { CreateTrucHatInput, UpdateTrucHatInput } from "../types"

const TABLE_NAME = "kt_truc_hat"

/**
 * API service for Trục Hạt
 * Handles all Supabase operations
 */
export class TrucHatAPI {
    /**
     * Get all trục hạt
     */
    static async getAll(): Promise<TrucHat[]> {
        const { data: trucHatData, error: trucHatError } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("tg_tao", { ascending: false })
            .order("id", { ascending: false })

        if (trucHatError) {
            console.error("Lỗi khi tải danh sách trục hạt:", trucHatError)
            throw new Error(trucHatError.message)
        }

        if (!trucHatData || trucHatData.length === 0) {
            return []
        }

        // Get unique IDs for foreign keys
        const nhanVienBhIds = Array.from(
            new Set(
                trucHatData
                    .map((item: any) => item.nhan_vien_bh_id)
                    .filter((id): id is number => id !== null && id !== undefined)
            )
        )

        const nguoiTaoIds = Array.from(
            new Set(
                trucHatData
                    .map((item: any) => item.nguoi_tao_id)
                    .filter((id): id is number => id !== null && id !== undefined)
            )
        )

        // Fetch related data
        let nhanVienBhMap = new Map<number, { ma_nhan_vien: number; ho_ten: string }>()
        if (nhanVienBhIds.length > 0) {
            const { data: nhanSuData } = await supabase
                .from("var_nhan_su")
                .select("ma_nhan_vien, ho_ten")
                .in("ma_nhan_vien", nhanVienBhIds)

            if (nhanSuData) {
                nhanVienBhMap = new Map(
                    nhanSuData.map((ns: any) => [ns.ma_nhan_vien, ns])
                )
            }
        }

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

        // Map data to include related objects
        return trucHatData.map((item: any) => {
            const nhanVienBh = nhanVienBhMap.get(item.nhan_vien_bh_id)
            const nguoiTao = nguoiTaoMap.get(item.nguoi_tao_id)
            
            return {
                ...item,
                nhan_vien_bh: nhanVienBh || null,
                nguoi_tao: nguoiTao || null,
            }
        }) as TrucHat[]
    }

    /**
     * Get trục hạt by ID
     */
    static async getById(id: number): Promise<TrucHat | null> {
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
            console.error("Lỗi khi tải chi tiết trục hạt:", error)
            throw new Error(error.message)
        }

        if (!data) {
            return null
        }

        // Fetch related data
        let nhanVienBh = null
        if (data.nhan_vien_bh_id) {
            const { data: nhanSuData } = await supabase
                .from("var_nhan_su")
                .select("ma_nhan_vien, ho_ten")
                .eq("ma_nhan_vien", data.nhan_vien_bh_id)
                .single()

            if (nhanSuData) {
                nhanVienBh = nhanSuData
            }
        }

        let nguoiTao = null
        if (data.nguoi_tao_id) {
            const { data: nhanSuData } = await supabase
                .from("var_nhan_su")
                .select("ma_nhan_vien, ho_ten")
                .eq("ma_nhan_vien", data.nguoi_tao_id)
                .single()

            if (nhanSuData) {
                nguoiTao = nhanSuData
            }
        }

        return {
            ...data,
            nhan_vien_bh: nhanVienBh,
            nguoi_tao: nguoiTao,
        } as TrucHat
    }

    /**
     * Create new trục hạt
     */
    static async create(input: CreateTrucHatInput): Promise<TrucHat> {
        // Remove fields that don't exist in the database table
        const { nhan_vien_bh, nguoi_tao, ...createInput } = input as any
        
        // Auto-set ngay to current date if not provided
        if (!createInput.ngay) {
            const today = new Date()
            createInput.ngay = today.toISOString().split('T')[0] // Format: YYYY-MM-DD
        }
        
        // tg_tao and tg_cap_nhat are auto-set by database (default now())
        // nguoi_tao_id should be set from input (from form view)
        
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(createInput)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo trục hạt:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không thể tạo trục hạt")
        }

        // Fetch related data
        let nhanVienBh = null
        if (data.nhan_vien_bh_id) {
            const { data: nhanSuData } = await supabase
                .from("var_nhan_su")
                .select("ma_nhan_vien, ho_ten")
                .eq("ma_nhan_vien", data.nhan_vien_bh_id)
                .single()

            if (nhanSuData) {
                nhanVienBh = nhanSuData
            }
        }

        let nguoiTao = null
        if (data.nguoi_tao_id) {
            const { data: nhanSuData } = await supabase
                .from("var_nhan_su")
                .select("ma_nhan_vien, ho_ten")
                .eq("ma_nhan_vien", data.nguoi_tao_id)
                .single()

            if (nhanSuData) {
                nguoiTao = nhanSuData
            }
        }

        return {
            ...data,
            nhan_vien_bh: nhanVienBh,
            nguoi_tao: nguoiTao,
        } as TrucHat
    }

    /**
     * Update trục hạt
     */
    static async update(id: number, input: UpdateTrucHatInput): Promise<TrucHat> {
        // Remove fields that don't exist in the database table
        const { nhan_vien_bh, nguoi_tao, ...updateInput } = input as any
        
        // tg_cap_nhat is auto-updated by database (default now() with trigger or default)
        // Don't manually set it, let database handle it
        
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(updateInput)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật trục hạt:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không thể cập nhật trục hạt")
        }

        // Fetch related data
        let nhanVienBh = null
        if (data.nhan_vien_bh_id) {
            const { data: nhanSuData } = await supabase
                .from("var_nhan_su")
                .select("ma_nhan_vien, ho_ten")
                .eq("ma_nhan_vien", data.nhan_vien_bh_id)
                .single()

            if (nhanSuData) {
                nhanVienBh = nhanSuData
            }
        }

        let nguoiTao = null
        if (data.nguoi_tao_id) {
            const { data: nhanSuData } = await supabase
                .from("var_nhan_su")
                .select("ma_nhan_vien, ho_ten")
                .eq("ma_nhan_vien", data.nguoi_tao_id)
                .single()

            if (nhanSuData) {
                nguoiTao = nhanSuData
            }
        }

        return {
            ...data,
            nhan_vien_bh: nhanVienBh,
            nguoi_tao: nguoiTao,
        } as TrucHat
    }

    /**
     * Delete trục hạt
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa trục hạt:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete trục hạt
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt trục hạt:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Get unique nguoi_tao_id values with names (for filter)
     */
    /**
     * Get unique ngay values (for filter)
     */
    static async getUniqueNgay(): Promise<string[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("ngay")
            .not("ngay", "is", null)
            .order("ngay", { ascending: false })

        if (error) {
            console.error("Lỗi khi tải danh sách ngày:", error)
            throw new Error(error.message)
        }

        const uniqueNgay = Array.from(
            new Set(
                (data || [])
                    .map((item: any) => item.ngay)
                    .filter((ngay): ngay is string => ngay != null)
            )
        )

        return uniqueNgay.sort((a, b) => {
            // Sort descending (newest first)
            return new Date(b).getTime() - new Date(a).getTime()
        })
    }

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

    /**
     * Get max ma_truc value for auto-increment
     */
    static async getMaxMaTruc(): Promise<number> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("ma_truc")
            .not("ma_truc", "is", null)
            .order("ma_truc", { ascending: false })
            .limit(1)
            .single()

        if (error) {
            if (error.code === "PGRST116") {
                // No records found, return 0
                return 0
            }
            console.error("Lỗi khi lấy mã trục lớn nhất:", error)
            throw new Error(error.message)
        }

        return data?.ma_truc ? Number(data.ma_truc) : 0
    }

    /**
     * Get unique nhan_vien_bh_id values with names (for filter)
     */
    static async getUniqueNhanVienBhIds(): Promise<Array<{ id: number; ten: string; ma_nhan_vien?: number }>> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("nhan_vien_bh_id")
            .not("nhan_vien_bh_id", "is", null)

        if (error) {
            console.error("Lỗi khi tải danh sách nhân viên bán hàng:", error)
            throw new Error(error.message)
        }

        const uniqueIds = Array.from(new Set((data || []).map((item: any) => item.nhan_vien_bh_id)))

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

