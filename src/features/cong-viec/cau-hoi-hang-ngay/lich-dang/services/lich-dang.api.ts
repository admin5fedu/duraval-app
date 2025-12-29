import { supabase } from "@/lib/supabase"
import { toPromise } from "@/lib/supabase-utils"
import { LichDang } from "../schema"
import type { CreateLichDangInput, UpdateLichDangInput } from "../types"

const TABLE_NAME = "chhn_lich_dang_bai"

/**
 * API service for Lịch Đăng
 * Handles all Supabase operations
 */
export class LichDangAPI {
    /**
     * Get all lịch đăng
     */
    static async getAll(): Promise<LichDang[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select(`
                id,
                ngay_dang,
                gio_dang,
                nhom_cau_hoi,
                cau_hoi,
                dap_an_1,
                dap_an_2,
                dap_an_3,
                dap_an_4,
                dap_an_dung,
                chuc_vu_ap_dung,
                nguoi_tao_id,
                tg_tao,
                tg_cap_nhat
            `)
            .order("ngay_dang", { ascending: false, nullsFirst: false })
            .order("tg_tao", { ascending: false })

        if (error) {
            console.error("Lỗi khi tải danh sách lịch đăng:", error)
            throw new Error(error.message)
        }

        if (!data || data.length === 0) {
            return []
        }

        // Enrich with nhom_cau_hoi_ten and nguoi_tao_ten
        const nhomCauHoiIds = [...new Set(data.map(item => item.nhom_cau_hoi).filter(Boolean))]
        const nguoiTaoIds = [...new Set(data.map(item => item.nguoi_tao_id).filter(Boolean))]

        const queries: Promise<any>[] = []

        // Fetch nhom cau hoi
        if (nhomCauHoiIds.length > 0) {
            queries.push(
                toPromise(
                    supabase
                        .from("chhn_nhom_cau_hoi")
                        .select("id, ten_nhom")
                        .in("id", nhomCauHoiIds)
                ).then(({ data }) => data || [])
            )
        } else {
            queries.push(Promise.resolve([]))
        }

        // Fetch nguoi tao
        if (nguoiTaoIds.length > 0) {
            queries.push(
                toPromise(
                    supabase
                        .from("var_nhan_su")
                        .select("ma_nhan_vien, ho_ten")
                        .in("ma_nhan_vien", nguoiTaoIds)
                ).then(({ data }) => data || [])
            )
        } else {
            queries.push(Promise.resolve([]))
        }

        const [nhomCauHoiData, nhanSuData] = await Promise.all(queries)

        const nhomCauHoiMap = new Map(
            (nhomCauHoiData || []).map((item: any) => [item.id, item.ten_nhom])
        )
        const nhanSuMap = new Map(
            (nhanSuData || []).map((item: any) => [item.ma_nhan_vien, item.ho_ten])
        )

        // Parse chuc_vu_ap_dung from JSONB
        return data.map((item: any) => {
            let chucVuApDung: number[] | null = null
            if (item.chuc_vu_ap_dung) {
                if (Array.isArray(item.chuc_vu_ap_dung)) {
                    chucVuApDung = item.chuc_vu_ap_dung
                } else if (typeof item.chuc_vu_ap_dung === 'string') {
                    try {
                        chucVuApDung = JSON.parse(item.chuc_vu_ap_dung)
                    } catch {
                        chucVuApDung = null
                    }
                }
            }

            return {
                ...item,
                nhom_cau_hoi_ten: nhomCauHoiMap.get(item.nhom_cau_hoi) || null,
                nguoi_tao_ten: nhanSuMap.get(item.nguoi_tao_id) || null,
                chuc_vu_ap_dung: chucVuApDung,
            } as LichDang
        })
    }

    /**
     * Get lịch đăng by ID
     */
    static async getById(id: number): Promise<LichDang | null> {
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
            console.error("Lỗi khi tải chi tiết lịch đăng:", error)
            throw new Error(error.message)
        }

        if (!data) {
            return null
        }

        // Enrich with relations
        const queries: Promise<any>[] = []

        if (data.nhom_cau_hoi) {
            queries.push(
                toPromise(
                    supabase
                        .from("chhn_nhom_cau_hoi")
                        .select("ten_nhom")
                        .eq("id", data.nhom_cau_hoi)
                        .single()
                ).then((result: { data: { ten_nhom: string } | null }) => result.data?.ten_nhom || null).catch(() => null)
            )
        } else {
            queries.push(Promise.resolve(null))
        }

        if (data.nguoi_tao_id) {
            queries.push(
                toPromise(
                    supabase
                        .from("var_nhan_su")
                        .select("ho_ten")
                        .eq("ma_nhan_vien", data.nguoi_tao_id)
                        .single()
                ).then((result: { data: { ho_ten: string } | null }) => result.data?.ho_ten || null).catch(() => null)
            )
        } else {
            queries.push(Promise.resolve(null))
        }

        const [nhomCauHoiTen, nguoiTaoTen] = await Promise.all(queries)

        // Parse chuc_vu_ap_dung from JSONB
        let chucVuApDung: number[] | null = null
        if (data.chuc_vu_ap_dung) {
            try {
                chucVuApDung = Array.isArray(data.chuc_vu_ap_dung) 
                    ? data.chuc_vu_ap_dung 
                    : JSON.parse(data.chuc_vu_ap_dung as any)
            } catch {
                chucVuApDung = null
            }
        }

        return {
            ...data,
            nhom_cau_hoi_ten: nhomCauHoiTen,
            nguoi_tao_ten: nguoiTaoTen,
            chuc_vu_ap_dung: chucVuApDung,
        } as LichDang
    }

    /**
     * Create new lịch đăng
     */
    static async create(input: CreateLichDangInput): Promise<LichDang> {
        const insertData: any = {
            ngay_dang: input.ngay_dang,
            gio_dang: input.gio_dang,
            nhom_cau_hoi: input.nhom_cau_hoi,
            cau_hoi: input.cau_hoi,
            hinh_anh: input.hinh_anh || null,
            dap_an_1: input.dap_an_1,
            dap_an_2: input.dap_an_2,
            dap_an_3: input.dap_an_3,
            dap_an_4: input.dap_an_4,
            dap_an_dung: input.dap_an_dung,
            chuc_vu_ap_dung: input.chuc_vu_ap_dung ? JSON.stringify(input.chuc_vu_ap_dung) : null,
            nguoi_tao_id: input.nguoi_tao_id || null,
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert([insertData])
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo lịch đăng:", error)
            throw new Error(error.message)
        }

        return data as LichDang
    }

    /**
     * Update lịch đăng
     */
    static async update(id: number, input: UpdateLichDangInput): Promise<LichDang> {
        const updateData: any = {}
        if (input.ngay_dang !== undefined) updateData.ngay_dang = input.ngay_dang
        if (input.gio_dang !== undefined) updateData.gio_dang = input.gio_dang
        if (input.nhom_cau_hoi !== undefined) updateData.nhom_cau_hoi = input.nhom_cau_hoi
        if (input.cau_hoi !== undefined) updateData.cau_hoi = input.cau_hoi
        if (input.hinh_anh !== undefined) updateData.hinh_anh = input.hinh_anh
        if (input.dap_an_1 !== undefined) updateData.dap_an_1 = input.dap_an_1
        if (input.dap_an_2 !== undefined) updateData.dap_an_2 = input.dap_an_2
        if (input.dap_an_3 !== undefined) updateData.dap_an_3 = input.dap_an_3
        if (input.dap_an_4 !== undefined) updateData.dap_an_4 = input.dap_an_4
        if (input.dap_an_dung !== undefined) updateData.dap_an_dung = input.dap_an_dung
        if (input.chuc_vu_ap_dung !== undefined) {
            updateData.chuc_vu_ap_dung = input.chuc_vu_ap_dung 
                ? JSON.stringify(input.chuc_vu_ap_dung) 
                : null
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(updateData)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật lịch đăng:", error)
            throw new Error(error.message)
        }

        return data as LichDang
    }

    /**
     * Delete lịch đăng
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa lịch đăng:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete lịch đăng
     */
    static async batchDelete(ids: number[]): Promise<void> {
        if (ids.length === 0) return

        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt lịch đăng:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Get list of nhom cau hoi for dropdown
     */
    static async getDanhSachNhomCauHoi() {
        const { data, error } = await supabase
            .from("chhn_nhom_cau_hoi")
            .select("id, ten_nhom")
            .order("ten_nhom", { ascending: true })

        if (error) {
            console.error("Lỗi khi tải danh sách nhóm câu hỏi:", error)
            return []
        }

        return data || []
    }

    /**
     * Get list of chuc vu for dropdown with phong ban info
     */
    static async getDanhSachChucVu() {
        const { data, error } = await supabase
            .from("var_chuc_vu")
            .select("id, ma_chuc_vu, ten_chuc_vu, ma_phong_ban, ma_phong, phong_ban_id")
            .order("ma_phong", { ascending: true, nullsFirst: false })
            .order("ten_chuc_vu", { ascending: true })

        if (error) {
            console.error("Lỗi khi tải danh sách chức vụ:", error)
            return []
        }

        if (!data || data.length === 0) {
            return []
        }

        // Fetch phong ban info
        const phongBanIds = [...new Set(data.map((cv: any) => cv.phong_ban_id).filter((id): id is number => Boolean(id)))]
        const phongBanMas = [...new Set(data.map((cv: any) => cv.ma_phong).filter((ma): ma is string => Boolean(ma)))]
        
        const phongBanQueries: Promise<any>[] = []
        
        if (phongBanIds.length > 0) {
            phongBanQueries.push(
                toPromise(
                    supabase
                        .from("var_phong_ban")
                        .select("id, ma_phong_ban, ten_phong_ban")
                        .in("id", phongBanIds)
                ).then(({ data }) => data || []).catch(() => [])
            )
        }
        
        if (phongBanMas.length > 0) {
            phongBanQueries.push(
                toPromise(
                    supabase
                        .from("var_phong_ban")
                        .select("id, ma_phong_ban, ten_phong_ban")
                        .in("ma_phong_ban", phongBanMas)
                ).then(({ data }) => data || []).catch(() => [])
            )
        }

        const phongBanResults = await Promise.all(phongBanQueries)
        
        const phongBanMapById = new Map<number, { ma_phong_ban: string, ten_phong_ban: string }>()
        const phongBanMapByMa = new Map<string, string>()
        
        phongBanResults.forEach((result: any[]) => {
            if (result) {
                result.forEach((pb: any) => {
                    if (pb.id) {
                        phongBanMapById.set(pb.id, {
                            ma_phong_ban: pb.ma_phong_ban || '',
                            ten_phong_ban: pb.ten_phong_ban || ''
                        })
                    }
                    if (pb.ma_phong_ban) {
                        phongBanMapByMa.set(pb.ma_phong_ban, pb.ten_phong_ban || '')
                    }
                })
            }
        })

        return (data || []).map((item: any) => {
            let tenPhongBanCap1: string | null = null
            if (item.phong_ban_id) {
                const pbInfo = phongBanMapById.get(item.phong_ban_id)
                tenPhongBanCap1 = pbInfo?.ten_phong_ban || null
            }
            
            const tenPhongBanCap2 = item.ma_phong ? phongBanMapByMa.get(item.ma_phong) || null : null

            return {
                ...item,
                ten_phong_ban: tenPhongBanCap1,
                ten_phong: tenPhongBanCap2
            }
        })
    }
}

