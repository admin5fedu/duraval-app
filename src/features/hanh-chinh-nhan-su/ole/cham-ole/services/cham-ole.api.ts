import { supabase } from "@/lib/supabase"
import { ChamOle } from "../schema"
import type { CreateChamOleInput, UpdateChamOleInput } from "../types"

const TABLE_NAME = "ole_cham_diem"

/**
 * API service for Chấm OLE
 * Handles all Supabase operations
 */
export class ChamOleAPI {
    /**
     * Get all chấm OLE
     */
    static async getAll(): Promise<ChamOle[]> {
        const { data: chamOleData, error: chamOleError } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("nam", { ascending: false })
            .order("thang", { ascending: false })
            .order("id", { ascending: false })

        if (chamOleError) {
            console.error("Lỗi khi tải danh sách chấm OLE:", chamOleError)
            throw new Error(chamOleError.message)
        }

        if (!chamOleData || chamOleData.length === 0) {
            return []
        }

        // Get unique IDs for foreign keys
        const nhanVienIds = Array.from(
            new Set(
                chamOleData
                    .map((item: any) => item.nhan_vien_id)
                    .filter((id): id is number => id !== null && id !== undefined)
            )
        )

        const phongIds = Array.from(
            new Set(
                chamOleData
                    .map((item: any) => item.phong_id)
                    .filter((id): id is number => id !== null && id !== undefined)
            )
        )

        const chucVuIds = Array.from(
            new Set(
                chamOleData
                    .map((item: any) => item.chuc_vu_id)
                    .filter((id): id is number => id !== null && id !== undefined)
            )
        )

        const nguoiTaoIds = Array.from(
            new Set(
                chamOleData
                    .map((item: any) => item.nguoi_tao_id)
                    .filter((id): id is number => id !== null && id !== undefined)
            )
        )

        // Fetch related data
        let nhanVienMap = new Map<number, { ma_nhan_vien: number; ho_ten: string }>()
        if (nhanVienIds.length > 0) {
            const { data: nhanSuData } = await supabase
                .from("var_nhan_su")
                .select("ma_nhan_vien, ho_ten")
                .in("ma_nhan_vien", nhanVienIds)

            if (nhanSuData) {
                nhanVienMap = new Map(
                    nhanSuData.map((ns: any) => [ns.ma_nhan_vien, ns])
                )
            }
        }

        let phongBanMap = new Map<number, { id: number; ma_phong_ban: string; ten_phong_ban: string }>()
        if (phongIds.length > 0) {
            const { data: phongBanData, error: phongBanError } = await supabase
                .from("ole_phong_ban")
                .select("id, ma_phong_ban, ten_phong_ban")
                .in("id", phongIds)

            if (phongBanError) {
                console.warn("Lỗi khi tải thông tin phòng ban:", phongBanError)
            } else if (phongBanData) {
                phongBanMap = new Map(
                    phongBanData.map((pb: any) => [pb.id, pb])
                )
            }
        }

        let chucVuMap = new Map<number, { id: number; ten_chuc_vu: string }>()
        if (chucVuIds.length > 0) {
            const { data: chucVuData } = await supabase
                .from("var_chuc_vu")
                .select("id, ten_chuc_vu")
                .in("id", chucVuIds)

            if (chucVuData) {
                chucVuMap = new Map(
                    chucVuData.map((cv: any) => [cv.id, cv])
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
        return chamOleData.map((item: any) => {
            const nhanVien = nhanVienMap.get(item.nhan_vien_id)
            const phongBan = phongBanMap.get(item.phong_id)
            const chucVu = chucVuMap.get(item.chuc_vu_id)
            const nguoiTao = nguoiTaoMap.get(item.nguoi_tao_id)
            
            return {
                ...item,
                nhan_vien: nhanVien || null,
                phong_ban: phongBan || null,
                chuc_vu: chucVu || null,
                nguoi_tao: nguoiTao || null,
            }
        }) as ChamOle[]
    }

    /**
     * Get chấm OLE by ID
     */
    static async getById(id: number): Promise<ChamOle | null> {
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
            console.error("Lỗi khi tải chi tiết chấm OLE:", error)
            throw new Error(error.message)
        }

        if (!data) {
            return null
        }

        // Fetch related data
        let nhanVien = null
        if (data.nhan_vien_id) {
            const { data: nhanSuData } = await supabase
                .from("var_nhan_su")
                .select("ma_nhan_vien, ho_ten")
                .eq("ma_nhan_vien", data.nhan_vien_id)
                .single()

            if (nhanSuData) {
                nhanVien = nhanSuData
            }
        }

        let phongBan = null
        if (data.phong_id) {
            const { data: phongBanData, error: phongBanError } = await supabase
                .from("ole_phong_ban")
                .select("id, ma_phong_ban, ten_phong_ban")
                .eq("id", data.phong_id)
                .single()

            if (phongBanError) {
                if (phongBanError.code !== "PGRST116") {
                    console.warn("Lỗi khi tải thông tin phòng ban:", phongBanError)
                }
            } else if (phongBanData) {
                phongBan = phongBanData
            }
        }

        let chucVu = null
        if (data.chuc_vu_id) {
            const { data: chucVuData } = await supabase
                .from("var_chuc_vu")
                .select("id, ten_chuc_vu")
                .eq("id", data.chuc_vu_id)
                .single()

            if (chucVuData) {
                chucVu = chucVuData
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
            nhan_vien: nhanVien,
            phong_ban: phongBan,
            chuc_vu: chucVu,
            nguoi_tao: nguoiTao,
        } as ChamOle
    }

    /**
     * Create new chấm OLE
     */
    static async create(input: CreateChamOleInput): Promise<ChamOle> {
        // Remove fields that don't exist in the database table
        const { nhan_vien, phong_ban, chuc_vu, nguoi_tao, ...createInput } = input as any
        
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(createInput)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo chấm OLE:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không thể tạo chấm OLE")
        }

        // Fetch related data
        let nhanVien = null
        if (data.nhan_vien_id) {
            const { data: nhanSuData } = await supabase
                .from("var_nhan_su")
                .select("ma_nhan_vien, ho_ten")
                .eq("ma_nhan_vien", data.nhan_vien_id)
                .single()

            if (nhanSuData) {
                nhanVien = nhanSuData
            }
        }

        let phongBan = null
        if (data.phong_id) {
            const { data: phongBanData, error: phongBanError } = await supabase
                .from("ole_phong_ban")
                .select("id, ma_phong_ban, ten_phong_ban")
                .eq("id", data.phong_id)
                .single()

            if (phongBanError) {
                if (phongBanError.code !== "PGRST116") {
                    console.warn("Lỗi khi tải thông tin phòng ban:", phongBanError)
                }
            } else if (phongBanData) {
                phongBan = phongBanData
            }
        }

        let chucVu = null
        if (data.chuc_vu_id) {
            const { data: chucVuData } = await supabase
                .from("var_chuc_vu")
                .select("id, ten_chuc_vu")
                .eq("id", data.chuc_vu_id)
                .single()

            if (chucVuData) {
                chucVu = chucVuData
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
            nhan_vien: nhanVien,
            phong_ban: phongBan,
            chuc_vu: chucVu,
            nguoi_tao: nguoiTao,
        } as ChamOle
    }

    /**
     * Update chấm OLE
     */
    static async update(id: number, input: UpdateChamOleInput): Promise<ChamOle> {
        // Remove fields that don't exist in the database table
        const { nhan_vien, phong_ban, chuc_vu, nguoi_tao, ...updateInput } = input as any
        
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(updateInput)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật chấm OLE:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không thể cập nhật chấm OLE")
        }

        // Fetch related data
        let nhanVien = null
        if (data.nhan_vien_id) {
            const { data: nhanSuData } = await supabase
                .from("var_nhan_su")
                .select("ma_nhan_vien, ho_ten")
                .eq("ma_nhan_vien", data.nhan_vien_id)
                .single()

            if (nhanSuData) {
                nhanVien = nhanSuData
            }
        }

        let phongBan = null
        if (data.phong_id) {
            const { data: phongBanData, error: phongBanError } = await supabase
                .from("ole_phong_ban")
                .select("id, ma_phong_ban, ten_phong_ban")
                .eq("id", data.phong_id)
                .single()

            if (phongBanError) {
                if (phongBanError.code !== "PGRST116") {
                    console.warn("Lỗi khi tải thông tin phòng ban:", phongBanError)
                }
            } else if (phongBanData) {
                phongBan = phongBanData
            }
        }

        let chucVu = null
        if (data.chuc_vu_id) {
            const { data: chucVuData } = await supabase
                .from("var_chuc_vu")
                .select("id, ten_chuc_vu")
                .eq("id", data.chuc_vu_id)
                .single()

            if (chucVuData) {
                chucVu = chucVuData
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
            nhan_vien: nhanVien,
            phong_ban: phongBan,
            chuc_vu: chucVu,
            nguoi_tao: nguoiTao,
        } as ChamOle
    }

    /**
     * Delete chấm OLE
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa chấm OLE:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete chấm OLE
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt chấm OLE:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Get unique phong_id values with names (for filter)
     */
    static async getUniquePhongIds(): Promise<Array<{ id: number; ten: string; ma_phong_ban?: string }>> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("phong_id")
            .not("phong_id", "is", null)

        if (error) {
            console.error("Lỗi khi tải danh sách phòng:", error)
            throw new Error(error.message)
        }

        const uniqueIds = Array.from(new Set((data || []).map((item: any) => item.phong_id)))

        if (uniqueIds.length === 0) {
            return []
        }

        // Fetch phong ban data
        const { data: phongBanData, error: phongBanError } = await supabase
            .from("ole_phong_ban")
            .select("id, ma_phong_ban, ten_phong_ban")
            .in("id", uniqueIds)

        if (phongBanError) {
            console.error("Lỗi khi tải thông tin phòng ban:", phongBanError)
            return uniqueIds.map((id: number) => ({
                id,
                ma_phong_ban: "",
                ten: `ID: ${id}`,
            }))
        }

        const phongBanMap = new Map(
            (phongBanData || []).map((pb: any) => [pb.id, pb])
        )

        return uniqueIds.map((id: number) => {
            const phongBan = phongBanMap.get(id)
            return {
                id,
                ma_phong_ban: phongBan?.ma_phong_ban || "",
                ten: phongBan?.ten_phong_ban || `ID: ${id}`,
            }
        })
    }

    /**
     * Get unique nam values (for filter)
     */
    static async getUniqueNam(): Promise<number[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("nam")
            .not("nam", "is", null)

        if (error) {
            console.error("Lỗi khi tải danh sách năm:", error)
            throw new Error(error.message)
        }

        const uniqueValues = Array.from(
            new Set(
                (data || [])
                    .map((item: any) => item.nam)
                    .filter((value): value is number => value !== null && value !== undefined)
            )
        ).sort((a, b) => b - a) // Descending order

        return uniqueValues
    }

    /**
     * Get unique thang values (for filter)
     */
    static async getUniqueThang(): Promise<number[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("thang")
            .not("thang", "is", null)

        if (error) {
            console.error("Lỗi khi tải danh sách tháng:", error)
            throw new Error(error.message)
        }

        const uniqueValues = Array.from(
            new Set(
                (data || [])
                    .map((item: any) => item.thang)
                    .filter((value): value is number => value !== null && value !== undefined)
            )
        ).sort((a, b) => b - a) // Descending order

        return uniqueValues
    }

    /**
     * Get unique chuc_vu_id values with names (for filter)
     */
    static async getUniqueChucVuIds(): Promise<Array<{ id: number; ten: string; ten_chuc_vu?: string }>> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("chuc_vu_id")
            .not("chuc_vu_id", "is", null)

        if (error) {
            console.error("Lỗi khi tải danh sách chức vụ:", error)
            throw new Error(error.message)
        }

        const uniqueIds = Array.from(new Set((data || []).map((item: any) => item.chuc_vu_id)))

        if (uniqueIds.length === 0) {
            return []
        }

        // Fetch chuc vu data
        const { data: chucVuData } = await supabase
            .from("var_chuc_vu")
            .select("id, ten_chuc_vu")
            .in("id", uniqueIds)

        const chucVuMap = new Map(
            (chucVuData || []).map((cv: any) => [cv.id, cv])
        )

        return uniqueIds.map((id: number) => {
            const chucVu = chucVuMap.get(id)
            return {
                id,
                ten_chuc_vu: chucVu?.ten_chuc_vu || "",
                ten: chucVu?.ten_chuc_vu || `ID: ${id}`,
            }
        })
    }

    /**
     * Get unique danh_gia values (for filter)
     */
    static async getUniqueDanhGia(): Promise<string[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("danh_gia")
            .not("danh_gia", "is", null)

        if (error) {
            console.error("Lỗi khi tải danh sách đánh giá:", error)
            throw new Error(error.message)
        }

        // Extract unique values and filter out null/empty
        const uniqueValues = Array.from(
            new Set(
                (data || [])
                    .map((item: any) => item.danh_gia)
                    .filter((value): value is string => Boolean(value && value.trim()))
            )
        ).sort()

        return uniqueValues
    }

    /**
     * Get unique nhan_vien_id values with names (for filter)
     */
    static async getUniqueNhanVienIds(): Promise<Array<{ id: number; ten: string; ma_nhan_vien?: number }>> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("nhan_vien_id")
            .not("nhan_vien_id", "is", null)

        if (error) {
            console.error("Lỗi khi tải danh sách nhân viên:", error)
            throw new Error(error.message)
        }

        const uniqueIds = Array.from(new Set((data || []).map((item: any) => item.nhan_vien_id)))

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

