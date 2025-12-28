"use client"

import { supabase } from "@/lib/supabase"
import { CauTraLoi } from "../schema"
import type { CreateCauTraLoiInput, UpdateCauTraLoiInput } from "../types"

const TABLE_NAME = "chhn_cau_tra_loi"

/**
 * API service for Câu Trả Lời
 * Handles all Supabase operations
 */
export class CauTraLoiAPI {
    /**
     * Get all câu trả lời
     */
    static async getAll(): Promise<CauTraLoi[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select(`
                id,
                lich_dang_id,
                cau_tra_loi,
                ket_qua,
                nguoi_tao_id,
                tg_tao,
                tg_cap_nhat
            `)
            .order("tg_tao", { ascending: false })

        if (error) {
            console.error("Lỗi khi tải danh sách câu trả lời:", error)
            throw new Error(error.message)
        }

        if (!data || data.length === 0) {
            return []
        }

        // Enrich with lich_dang_cau_hoi and nguoi_tao_ten
        const lichDangIds = [...new Set(data.map(item => item.lich_dang_id).filter(Boolean))]
        const nguoiTaoIds = [...new Set(data.map(item => item.nguoi_tao_id).filter(Boolean))]

        const queries: Promise<any>[] = []

        // Fetch lich dang
        if (lichDangIds.length > 0) {
            queries.push(
                supabase
                    .from("chhn_lich_dang_bai")
                    .select("id, cau_hoi")
                    .in("id", lichDangIds)
                    .then(({ data }) => data || [])
            )
        } else {
            queries.push(Promise.resolve([]))
        }

        // Fetch nguoi tao
        if (nguoiTaoIds.length > 0) {
            queries.push(
                supabase
                    .from("var_nhan_su")
                    .select("ma_nhan_vien, ho_ten")
                    .in("ma_nhan_vien", nguoiTaoIds)
                    .then(({ data }) => data || [])
            )
        } else {
            queries.push(Promise.resolve([]))
        }

        const [lichDangData, nhanSuData] = await Promise.all(queries)

        const lichDangMap = new Map(
            (lichDangData || []).map((item: any) => [item.id, item.cau_hoi])
        )
        const nhanSuMap = new Map(
            (nhanSuData || []).map((item: any) => [item.ma_nhan_vien, item.ho_ten])
        )

        return data.map((item: any) => ({
            ...item,
            lich_dang_cau_hoi: lichDangMap.get(item.lich_dang_id) || null,
            nguoi_tao_ten: nhanSuMap.get(item.nguoi_tao_id) || null,
        })) as CauTraLoi[]
    }

    /**
     * Get single câu trả lời by ID
     */
    static async getById(id: number): Promise<CauTraLoi | null> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .eq("id", id)
            .single()

        if (error) {
            console.error("Lỗi khi tải chi tiết câu trả lời:", error)
            return null
        }

        if (!data) {
            return null
        }

        // Fetch related data
        const queries: Promise<string | null>[] = []
        
        if (data.lich_dang_id) {
            queries.push(
                supabase
                    .from("chhn_lich_dang_bai")
                    .select("cau_hoi")
                    .eq("id", data.lich_dang_id)
                    .single()
                    .then(({ data }) => data?.cau_hoi || null)
                    .catch(() => null)
            )
        } else {
            queries.push(Promise.resolve(null))
        }

        if (data.nguoi_tao_id) {
            queries.push(
                supabase
                    .from("var_nhan_su")
                    .select("ho_ten")
                    .eq("ma_nhan_vien", data.nguoi_tao_id)
                    .single()
                    .then(({ data }) => data?.ho_ten || null)
                    .catch(() => null)
            )
        } else {
            queries.push(Promise.resolve(null))
        }

        const [lichDangCauHoi, nguoiTaoTen] = await Promise.all(queries)

        return {
            ...data,
            lich_dang_cau_hoi: lichDangCauHoi,
            nguoi_tao_ten: nguoiTaoTen,
        } as CauTraLoi
    }

    /**
     * Create new câu trả lời
     */
    static async create(input: CreateCauTraLoiInput): Promise<CauTraLoi> {
        const insertData: any = {
            lich_dang_id: input.lich_dang_id,
            cau_tra_loi: input.cau_tra_loi,
            ket_qua: input.ket_qua,
            nguoi_tao_id: input.nguoi_tao_id,
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert([insertData])
            .select()
            .single()

        if (error) {
            throw new Error(error.message)
        }

        return data as CauTraLoi
    }

    /**
     * Update câu trả lời
     */
    static async update(id: number, input: UpdateCauTraLoiInput): Promise<CauTraLoi> {
        const updateData: any = {}
        if (input.lich_dang_id !== undefined) updateData.lich_dang_id = input.lich_dang_id
        if (input.cau_tra_loi !== undefined) updateData.cau_tra_loi = input.cau_tra_loi
        if (input.ket_qua !== undefined) updateData.ket_qua = input.ket_qua

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(updateData)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            throw new Error(error.message)
        }

        return data as CauTraLoi
    }

    /**
     * Delete câu trả lời
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete câu trả lời
     */
    static async batchDelete(ids: number[]): Promise<void> {
        if (ids.length === 0) return

        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            throw new Error(error.message)
        }
    }

    /**
     * Get list of lich_dang_bai for dropdown
     */
    static async getDanhSachLichDangBai() {
        const { data, error } = await supabase
            .from("chhn_lich_dang_bai")
            .select("id, cau_hoi, ngay_dang")
            .order("ngay_dang", { ascending: false })
            .order("tg_tao", { ascending: false })

        if (error) {
            console.error("Lỗi khi tải danh sách lịch đăng:", error)
            return []
        }

        return data || []
    }
}

