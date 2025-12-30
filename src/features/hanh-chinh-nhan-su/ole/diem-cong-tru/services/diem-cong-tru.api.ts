import { supabase } from "@/lib/supabase"
import { DiemCongTru } from "../schema"
import type { CreateDiemCongTruInput, UpdateDiemCongTruInput } from "../types"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

const TABLE_NAME = "ole_diem_cong_tru"

/**
 * API service for Điểm Cộng Trừ
 * Handles all Supabase operations
 */
export class DiemCongTruAPI {
    /**
     * Get all điểm cộng trừ
     */
    static async getAll(): Promise<DiemCongTru[]> {
        const { data: diemCongTruData, error: diemCongTruError } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("ngay", { ascending: false })
            .order("id", { ascending: false })

        if (diemCongTruError) {
            console.error("Lỗi khi tải danh sách điểm cộng trừ:", diemCongTruError)
            throw new Error(diemCongTruError.message)
        }

        if (!diemCongTruData || diemCongTruData.length === 0) {
            return []
        }

        // Get unique IDs for foreign keys
        const nhanVienIds = Array.from(
            new Set(
                diemCongTruData
                    .map((item: any) => item.nhan_vien_id)
                    .filter((id): id is number => id !== null && id !== undefined)
            )
        )

        const phongBanIds = Array.from(
            new Set(
                diemCongTruData
                    .map((item: any) => item.phong_ban_id)
                    .filter((id): id is number => id !== null && id !== undefined)
            )
        )

        const nhomLuongIds = Array.from(
            new Set(
                diemCongTruData
                    .map((item: any) => item.nhom_luong_id)
                    .filter((id): id is number => id !== null && id !== undefined)
            )
        )

        const nguoiTaoIds = Array.from(
            new Set(
                diemCongTruData
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
        if (phongBanIds.length > 0) {
            const { data: phongBanData, error: phongBanError } = await supabase
                .from("ole_phong_ban")
                .select("id, ma_phong_ban, ten_phong_ban")
                .in("id", phongBanIds)

            if (phongBanError) {
                console.warn("Lỗi khi tải thông tin phòng ban:", phongBanError)
            } else if (phongBanData) {
                phongBanMap = new Map(
                    phongBanData.map((pb: any) => [pb.id, pb])
                )
            }
        }

        let nhomLuongMap = new Map<number, { id: number; ten_nhom: string }>()
        if (nhomLuongIds.length > 0) {
            const { data: nhomLuongData } = await supabase
                .from("ole_nhom_luong")
                .select("id, ten_nhom")
                .in("id", nhomLuongIds)

            if (nhomLuongData) {
                nhomLuongMap = new Map(
                    nhomLuongData.map((nl: any) => [nl.id, nl])
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
        return diemCongTruData.map((item: any) => {
            const nhanVien = nhanVienMap.get(item.nhan_vien_id)
            const phongBan = phongBanMap.get(item.phong_ban_id)
            const nhomLuong = nhomLuongMap.get(item.nhom_luong_id)
            const nguoiTao = nguoiTaoMap.get(item.nguoi_tao_id)
            
            return {
                ...item,
                nhan_vien: nhanVien || null,
                phong_ban: phongBan || null,
                nhom_luong: nhomLuong || null,
                nguoi_tao: nguoiTao || null,
            }
        }) as DiemCongTru[]
    }

    /**
     * Get điểm cộng trừ by ID
     */
    static async getById(id: number): Promise<DiemCongTru | null> {
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
            console.error("Lỗi khi tải chi tiết điểm cộng trừ:", error)
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
        if (data.phong_ban_id) {
            const { data: phongBanData, error: phongBanError } = await supabase
                .from("ole_phong_ban")
                .select("id, ma_phong_ban, ten_phong_ban")
                .eq("id", data.phong_ban_id)
                .single()

            if (phongBanError) {
                // Phòng ban không tồn tại hoặc có lỗi - chỉ log warning, không throw
                if (phongBanError.code !== "PGRST116") {
                    console.warn("Lỗi khi tải thông tin phòng ban:", phongBanError)
                }
            } else if (phongBanData) {
                phongBan = phongBanData
            }
        }

        let nhomLuong = null
        if (data.nhom_luong_id) {
            const { data: nhomLuongData } = await supabase
                .from("ole_nhom_luong")
                .select("id, ten_nhom")
                .eq("id", data.nhom_luong_id)
                .single()

            if (nhomLuongData) {
                nhomLuong = nhomLuongData
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
            nhom_luong: nhomLuong,
            nguoi_tao: nguoiTao,
        } as DiemCongTru
    }

    /**
     * Create new điểm cộng trừ
     */
    static async create(input: CreateDiemCongTruInput): Promise<DiemCongTru> {
        // Remove fields that don't exist in the database table
        const { nhan_vien, phong_ban, nhom_luong, nguoi_tao, ...createInput } = input as any
        
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(createInput)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo điểm cộng trừ:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không thể tạo điểm cộng trừ")
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
        if (data.phong_ban_id) {
            const { data: phongBanData, error: phongBanError } = await supabase
                .from("ole_phong_ban")
                .select("id, ma_phong_ban, ten_phong_ban")
                .eq("id", data.phong_ban_id)
                .single()

            if (phongBanError) {
                // Phòng ban không tồn tại hoặc có lỗi - chỉ log warning, không throw
                if (phongBanError.code !== "PGRST116") {
                    console.warn("Lỗi khi tải thông tin phòng ban:", phongBanError)
                }
            } else if (phongBanData) {
                phongBan = phongBanData
            }
        }

        let nhomLuong = null
        if (data.nhom_luong_id) {
            const { data: nhomLuongData } = await supabase
                .from("ole_nhom_luong")
                .select("id, ten_nhom")
                .eq("id", data.nhom_luong_id)
                .single()

            if (nhomLuongData) {
                nhomLuong = nhomLuongData
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
            nhom_luong: nhomLuong,
            nguoi_tao: nguoiTao,
        } as DiemCongTru
    }

    /**
     * Update điểm cộng trừ
     */
    static async update(id: number, input: UpdateDiemCongTruInput): Promise<DiemCongTru> {
        // Remove fields that don't exist in the database table
        const { nhan_vien, phong_ban, nhom_luong, nguoi_tao, ...updateInput } = input as any
        
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(updateInput)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật điểm cộng trừ:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không thể cập nhật điểm cộng trừ")
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
        if (data.phong_ban_id) {
            const { data: phongBanData, error: phongBanError } = await supabase
                .from("ole_phong_ban")
                .select("id, ma_phong_ban, ten_phong_ban")
                .eq("id", data.phong_ban_id)
                .single()

            if (phongBanError) {
                // Phòng ban không tồn tại hoặc có lỗi - chỉ log warning, không throw
                if (phongBanError.code !== "PGRST116") {
                    console.warn("Lỗi khi tải thông tin phòng ban:", phongBanError)
                }
            } else if (phongBanData) {
                phongBan = phongBanData
            }
        }

        let nhomLuong = null
        if (data.nhom_luong_id) {
            const { data: nhomLuongData } = await supabase
                .from("ole_nhom_luong")
                .select("id, ten_nhom")
                .eq("id", data.nhom_luong_id)
                .single()

            if (nhomLuongData) {
                nhomLuong = nhomLuongData
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
            nhom_luong: nhomLuong,
            nguoi_tao: nguoiTao,
        } as DiemCongTru
    }

    /**
     * Delete điểm cộng trừ
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa điểm cộng trừ:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete điểm cộng trừ
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt điểm cộng trừ:", error)
            throw new Error(error.message)
        }
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

    /**
     * Get unique phong_ban_id values with names (for filter)
     */
    static async getUniquePhongBanIds(): Promise<Array<{ id: number; ten: string; ma_phong_ban?: string }>> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("phong_ban_id")
            .not("phong_ban_id", "is", null)

        if (error) {
            console.error("Lỗi khi tải danh sách phòng ban:", error)
            throw new Error(error.message)
        }

        const uniqueIds = Array.from(new Set((data || []).map((item: any) => item.phong_ban_id)))

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
            // Return với dữ liệu mặc định nếu có lỗi
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
            if (phongBan && phongBan.ma_phong_ban && phongBan.ten_phong_ban) {
                return {
                    id,
                    ma_phong_ban: phongBan.ma_phong_ban,
                    ten: `${phongBan.ma_phong_ban} - ${phongBan.ten_phong_ban}`,
                }
            }
            return {
                id,
                ma_phong_ban: "",
                ten: `ID: ${id}`,
            }
        })
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

    /**
     * Get unique loai values (for filter)
     */
    static async getUniqueLoai(): Promise<string[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("loai")
            .not("loai", "is", null)

        if (error) {
            console.error("Lỗi khi tải danh sách loại:", error)
            throw new Error(error.message)
        }

        // Extract unique values and filter out null/empty
        const uniqueValues = Array.from(
            new Set(
                (data || [])
                    .map((item: any) => item.loai)
                    .filter((value): value is string => Boolean(value && value.trim()))
            )
        ).sort()

        return uniqueValues
    }

    /**
     * Get unique ngay values for filter
     */
    static async getUniqueNgay(): Promise<string[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("ngay")
            .not("ngay", "is", null)

        if (error) {
            console.error("Lỗi khi tải danh sách ngày:", error)
            throw new Error(error.message)
        }

        // Extract unique dates and format them
        const uniqueDates = Array.from(
            new Set(
                (data || [])
                    .map((item: any) => {
                        if (!item.ngay) return null
                        try {
                            const date = new Date(item.ngay)
                            return format(date, "dd/MM/yyyy", { locale: vi })
                        } catch {
                            return null
                        }
                    })
                    .filter((value): value is string => Boolean(value))
            )
        ).sort((a, b) => {
            // Sort dates in descending order (newest first)
            const dateA = new Date(a.split("/").reverse().join("-"))
            const dateB = new Date(b.split("/").reverse().join("-"))
            return dateB.getTime() - dateA.getTime()
        })

        return uniqueDates
    }
}

