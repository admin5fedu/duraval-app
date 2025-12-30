import { supabase } from "@/lib/supabase"
import { PhanHoiKhachHang } from "../schema"
import type { CreatePhanHoiKhachHangInput, UpdatePhanHoiKhachHangInput } from "../types"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

const TABLE_NAME = "cskh_phan_hoi_kh"

/**
 * API service for Phản Hồi Khách Hàng
 * Handles all Supabase operations
 */
export class PhanHoiKhachHangAPI {
    /**
     * Get all phản hồi khách hàng
     */
    static async getAll(): Promise<PhanHoiKhachHang[]> {
        const { data: phanHoiData, error: phanHoiError } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("tg_tao", { ascending: false })
            .order("id", { ascending: false })

        if (phanHoiError) {
            console.error("Lỗi khi tải danh sách phản hồi khách hàng:", phanHoiError)
            throw new Error(phanHoiError.message)
        }

        if (!phanHoiData || phanHoiData.length === 0) {
            return []
        }

        // Get unique IDs for foreign keys
        const nhanVienIds = Array.from(
            new Set(
                phanHoiData
                    .map((item: any) => item.nhan_vien_id)
                    .filter((id): id is number => id !== null && id !== undefined)
            )
        )

        const nguoiTaoIds = Array.from(
            new Set(
                phanHoiData
                    .map((item: any) => item.nguoi_tao_id)
                    .filter((id): id is number => id !== null && id !== undefined)
            )
        )

        const phongIds = Array.from(
            new Set(
                phanHoiData
                    .map((item: any) => item.phong_id)
                    .filter((id): id is number => id !== null && id !== undefined)
            )
        )

        const nhomIds = Array.from(
            new Set(
                phanHoiData
                    .map((item: any) => item.nhom_id)
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

        let phongBanMap = new Map<number, { id: number; ma_phong_ban: string; ten_phong_ban: string }>()
        if (phongIds.length > 0) {
            const { data: phongBanData } = await supabase
                .from("var_phong_ban")
                .select("id, ma_phong_ban, ten_phong_ban")
                .in("id", phongIds)

            if (phongBanData) {
                phongBanMap = new Map(
                    phongBanData.map((pb: any) => [pb.id, pb])
                )
            }
        }

        let nhomDataMap = new Map<number, { id: number; ten_nhom: string }>()
        if (nhomIds.length > 0) {
            const { data: nhomData } = await supabase
                .from("ole_nhom_luong")
                .select("id, ten_nhom")
                .in("id", nhomIds)

            if (nhomData) {
                nhomDataMap = new Map(
                    nhomData.map((nhomItem: any) => [nhomItem.id, nhomItem])
                )
            }
        }

        // Map data to include related objects
        return phanHoiData.map((item: any) => {
            const nhanVien = nhanVienMap.get(item.nhan_vien_id)
            const nguoiTao = nguoiTaoMap.get(item.nguoi_tao_id)
            const phongBan = phongBanMap.get(item.phong_id)
            const nhomItem = nhomDataMap.get(item.nhom_id)
            
            return {
                ...item,
                nhan_vien: nhanVien || null,
                nguoi_tao: nguoiTao || null,
                phong_ban: phongBan || null,
                nhom: nhomItem || null,
            }
        }) as PhanHoiKhachHang[]
    }

    /**
     * Get phản hồi khách hàng by ID
     */
    static async getById(id: number): Promise<PhanHoiKhachHang | null> {
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
            console.error("Lỗi khi tải chi tiết phản hồi khách hàng:", error)
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
            nguoi_tao: nguoiTao,
        } as PhanHoiKhachHang
    }

    /**
     * Create new phản hồi khách hàng
     */
    static async create(input: CreatePhanHoiKhachHangInput): Promise<PhanHoiKhachHang> {
        // Remove fields that don't exist in the database table
        const { nhan_vien, nguoi_tao, phong_ban, nhom, ...createInput } = input as any
        
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(createInput)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo phản hồi khách hàng:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không thể tạo phản hồi khách hàng")
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

        let phongBan = null
        if (data.phong_id) {
            const { data: phongBanData } = await supabase
                .from("var_phong_ban")
                .select("id, ma_phong_ban, ten_phong_ban")
                .eq("id", data.phong_id)
                .single()

            if (phongBanData) {
                phongBan = phongBanData
            }
        }

        let nhomItem = null
        if (data.nhom_id) {
            const { data: nhomData } = await supabase
                .from("ole_nhom_luong")
                .select("id, ten_nhom")
                .eq("id", data.nhom_id)
                .single()

            if (nhomData) {
                nhomItem = nhomData
            }
        }

        return {
            ...data,
            nhan_vien: nhanVien,
            nguoi_tao: nguoiTao,
            phong_ban: phongBan,
            nhom: nhomItem,
        } as PhanHoiKhachHang
    }

    /**
     * Update phản hồi khách hàng
     */
    static async update(id: number, input: UpdatePhanHoiKhachHangInput): Promise<PhanHoiKhachHang> {
        // Remove fields that don't exist in the database table
        const { nhan_vien, nguoi_tao, phong_ban, nhom, ...updateInput } = input as any
        
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(updateInput)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật phản hồi khách hàng:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không thể cập nhật phản hồi khách hàng")
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

        let phongBan = null
        if (data.phong_id) {
            const { data: phongBanData } = await supabase
                .from("var_phong_ban")
                .select("id, ma_phong_ban, ten_phong_ban")
                .eq("id", data.phong_id)
                .single()

            if (phongBanData) {
                phongBan = phongBanData
            }
        }

        let nhomItem = null
        if (data.nhom_id) {
            const { data: nhomData } = await supabase
                .from("ole_nhom_luong")
                .select("id, ten_nhom")
                .eq("id", data.nhom_id)
                .single()

            if (nhomData) {
                nhomItem = nhomData
            }
        }

        return {
            ...data,
            nhan_vien: nhanVien,
            nguoi_tao: nguoiTao,
            phong_ban: phongBan,
            nhom: nhomItem,
        } as PhanHoiKhachHang
    }

    /**
     * Delete phản hồi khách hàng
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa phản hồi khách hàng:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete phản hồi khách hàng
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt phản hồi khách hàng:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Get unique loai_loi values (for filter)
     */
    static async getUniqueLoaiLoi(): Promise<string[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("loai_loi")
            .not("loai_loi", "is", null)

        if (error) {
            console.error("Lỗi khi tải danh sách loại lỗi:", error)
            throw new Error(error.message)
        }

        // Extract unique values and filter out null/empty
        const uniqueValues = Array.from(
            new Set(
                (data || [])
                    .map((item: any) => item.loai_loi)
                    .filter((value): value is string => Boolean(value && value.trim()))
            )
        ).sort()

        return uniqueValues
    }

    /**
     * Get unique muc_do values (for filter)
     */
    static async getUniqueMucDo(): Promise<string[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("muc_do")
            .not("muc_do", "is", null)

        if (error) {
            console.error("Lỗi khi tải danh sách mức độ:", error)
            throw new Error(error.message)
        }

        // Extract unique values and filter out null/empty
        const uniqueValues = Array.from(
            new Set(
                (data || [])
                    .map((item: any) => item.muc_do)
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
     * Get unique ngay values (for filter)
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

        // Extract unique values and format as DD/MM/YYYY
        const uniqueDates = Array.from(
            new Set(
                (data || [])
                    .map((item: any) => item.ngay)
                    .filter((value): value is string => Boolean(value))
                    .map((dateStr: string) => {
                        try {
                            const date = new Date(dateStr)
                            return format(date, "dd/MM/yyyy", { locale: vi })
                        } catch {
                            return dateStr
                        }
                    })
            )
        ).sort().reverse() // Sort descending (newest first)

        return uniqueDates
    }

    /**
     * Get unique kt_phu_trach values (for filter)
     */
    static async getUniqueKtPhuTrach(): Promise<string[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("kt_phu_trach")
            .not("kt_phu_trach", "is", null)

        if (error) {
            console.error("Lỗi khi tải danh sách KT phụ trách:", error)
            throw new Error(error.message)
        }

        // Extract unique values and filter out null/empty
        const uniqueValues = Array.from(
            new Set(
                (data || [])
                    .map((item: any) => item.kt_phu_trach)
                    .filter((value): value is string => Boolean(value && value.trim()))
            )
        ).sort()

        return uniqueValues
    }

    /**
     * Get unique trang_thai_don_hoan values (for filter)
     */
    static async getUniqueTrangThaiDonHoan(): Promise<string[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("trang_thai_don_hoan")
            .not("trang_thai_don_hoan", "is", null)

        if (error) {
            console.error("Lỗi khi tải danh sách trạng thái đơn hoàn:", error)
            throw new Error(error.message)
        }

        // Extract unique values and filter out null/empty
        const uniqueValues = Array.from(
            new Set(
                (data || [])
                    .map((item: any) => item.trang_thai_don_hoan)
                    .filter((value): value is string => Boolean(value && value.trim()))
            )
        ).sort()

        return uniqueValues
    }
}

