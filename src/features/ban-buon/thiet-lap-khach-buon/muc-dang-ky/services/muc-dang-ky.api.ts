import { supabase } from "@/lib/supabase"
import type { CreateMucDangKyInput, MucDangKy, UpdateMucDangKyInput } from "../schema"

const TABLE_NAME = "bb_muc_dang_ky"

/**
 * API service for Mức Đăng Ký
 * Handles all Supabase operations
 */
export class MucDangKyAPI {
  /**
   * Get all mức đăng ký
   */
  static async getAll(): Promise<MucDangKy[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("id", { ascending: true })

    if (error) {
      console.error("Lỗi khi tải danh sách mức đăng ký:", error)
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      return []
    }

    // Enrich with nguoi_tao_ten from var_nhan_su
    const nguoiTaoIds = [...new Set(data.map(item => item.nguoi_tao_id).filter(Boolean) as number[])]
    
    let nhanSuMap = new Map<number, string>()
    if (nguoiTaoIds.length > 0) {
      const { data: nhanSuData } = await supabase
        .from("var_nhan_su")
        .select("ma_nhan_vien, ho_ten")
        .in("ma_nhan_vien", nguoiTaoIds)
      
      if (nhanSuData) {
        nhanSuMap = new Map(
          nhanSuData.map(ns => [ns.ma_nhan_vien, ns.ho_ten])
        )
      }
    }

    return data.map(item => ({
      ...item,
      nguoi_tao_ten: item.nguoi_tao_id ? nhanSuMap.get(item.nguoi_tao_id) || null : null,
    })) as MucDangKy[]
  }

  /**
   * Get mức đăng ký by ID
   */
  static async getById(id: number): Promise<MucDangKy | null> {
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
      console.error("Lỗi khi tải chi tiết mức đăng ký:", error)
      throw new Error(error.message)
    }

    if (!data) {
      return null
    }

    // Enrich with nguoi_tao_ten
    let nguoiTaoTen: string | null = null
    if (data.nguoi_tao_id) {
      const { data: nhanSuData } = await supabase
        .from("var_nhan_su")
        .select("ho_ten")
        .eq("ma_nhan_vien", data.nguoi_tao_id)
        .single()
      
      nguoiTaoTen = nhanSuData?.ho_ten || null
    }

    return {
      ...data,
      nguoi_tao_ten: nguoiTaoTen,
    } as MucDangKy
  }

  /**
   * Create new mức đăng ký
   */
  static async create(input: CreateMucDangKyInput): Promise<MucDangKy> {
    // Sanitize input: convert empty strings to null for optional fields
    const sanitizedInput = {
      ma_hang: input.ma_hang && input.ma_hang.trim() !== "" ? input.ma_hang.trim() : null,
      ten_hang: input.ten_hang,
      doanh_so_min_quy: input.doanh_so_min_quy || null,
      doanh_so_max_quy: input.doanh_so_max_quy || null,
      doanh_so_min_nam: input.doanh_so_min_nam || null,
      doanh_so_max_nam: input.doanh_so_max_nam || null,
      ghi_chu: input.ghi_chu && input.ghi_chu.trim() !== "" ? input.ghi_chu.trim() : null,
      nguoi_tao_id: input.nguoi_tao_id || null,
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(sanitizedInput)
      .select()
      .single()

    if (error) {
      console.error("Lỗi khi tạo mức đăng ký:", error)
      throw new Error(error.message)
    }

    if (!data) {
      throw new Error("Không nhận được dữ liệu sau khi tạo mức đăng ký")
    }

    // Enrich with nguoi_tao_ten
    let nguoiTaoTen: string | null = null
    if (data.nguoi_tao_id) {
      const { data: nhanSuData } = await supabase
        .from("var_nhan_su")
        .select("ho_ten")
        .eq("ma_nhan_vien", data.nguoi_tao_id)
        .single()
      
      nguoiTaoTen = nhanSuData?.ho_ten || null
    }

    return {
      ...data,
      nguoi_tao_ten: nguoiTaoTen,
    } as MucDangKy
  }

  /**
   * Update mức đăng ký
   */
  static async update(id: number, input: UpdateMucDangKyInput): Promise<MucDangKy> {
    // Validate input
    if (!input || typeof input !== 'object') {
      throw new Error("Input không hợp lệ")
    }
    
    // Sanitize input: convert empty strings to null for optional fields
    const sanitizedInput: any = {}
    if (input.ten_hang !== undefined) sanitizedInput.ten_hang = input.ten_hang
    if (input.ma_hang !== undefined) {
      sanitizedInput.ma_hang = input.ma_hang && input.ma_hang.trim() !== "" ? input.ma_hang.trim() : null
    }
    if (input.doanh_so_min_quy !== undefined) sanitizedInput.doanh_so_min_quy = input.doanh_so_min_quy ?? null
    if (input.doanh_so_max_quy !== undefined) sanitizedInput.doanh_so_max_quy = input.doanh_so_max_quy ?? null
    if (input.doanh_so_min_nam !== undefined) sanitizedInput.doanh_so_min_nam = input.doanh_so_min_nam ?? null
    if (input.doanh_so_max_nam !== undefined) sanitizedInput.doanh_so_max_nam = input.doanh_so_max_nam ?? null
    if (input.ghi_chu !== undefined) {
      sanitizedInput.ghi_chu = input.ghi_chu && input.ghi_chu.trim() !== "" ? input.ghi_chu.trim() : null
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(sanitizedInput)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Lỗi khi cập nhật mức đăng ký:", error)
      throw new Error(error.message)
    }

    if (!data) {
      throw new Error("Không nhận được dữ liệu sau khi cập nhật mức đăng ký")
    }

    // Enrich with nguoi_tao_ten
    let nguoiTaoTen: string | null = null
    if (data.nguoi_tao_id) {
      const { data: nhanSuData } = await supabase
        .from("var_nhan_su")
        .select("ho_ten")
        .eq("ma_nhan_vien", data.nguoi_tao_id)
        .single()
      
      nguoiTaoTen = nhanSuData?.ho_ten || null
    }

    return {
      ...data,
      nguoi_tao_ten: nguoiTaoTen,
    } as MucDangKy
  }

  /**
   * Delete mức đăng ký
   */
  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Lỗi khi xóa mức đăng ký:", error)
      throw new Error(error.message)
    }
  }

  /**
   * Batch delete mức đăng ký
   */
  static async batchDelete(ids: number[]): Promise<void> {
    if (ids.length === 0) return

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .in("id", ids)

    if (error) {
      console.error("Lỗi khi xóa hàng loạt mức đăng ký:", error)
      throw new Error(error.message)
    }
  }
}

