import { supabase } from "@/lib/supabase"
import type { CreateDangKyDoanhSoInput, DangKyDoanhSo, UpdateDangKyDoanhSoInput } from "../schema"

const TABLE_NAME = "bb_dang_ky_doanh_so"

/**
 * API service for Đăng Ký Doanh Số
 * Handles all Supabase operations
 */
export class DangKyDoanhSoAPI {
  /**
   * Get all đăng ký doanh số
   */
  static async getAll(): Promise<DangKyDoanhSo[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("id", { ascending: true })

    if (error) {
      console.error("Lỗi khi tải danh sách đăng ký doanh số:", error)
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      return []
    }

    // Batch enrich foreign keys
    const khachBuonIds = [...new Set(data.map(item => item.khach_buon_id).filter(Boolean) as number[])]
    const mucDangKyIds = [...new Set(data.map(item => item.muc_dang_ky_id).filter(Boolean) as number[])]
    const nguoiTaoIds = [...new Set(data.map(item => item.nguoi_tao_id).filter(Boolean) as number[])]

    // Enrich ten_khach_buon from bb_khach_buon
    let khachBuonMap = new Map<number, string>()
    if (khachBuonIds.length > 0) {
      const { data: khachBuonData } = await supabase
        .from("bb_khach_buon")
        .select("id, ten_khach_buon")
        .in("id", khachBuonIds)
      
      if (khachBuonData) {
        khachBuonMap = new Map(
          khachBuonData.map(kb => [kb.id, kb.ten_khach_buon || ""])
        )
      }
    }

    // Enrich ten_muc_dang_ky from bb_muc_dang_ky (using ten_hang column)
    let mucDangKyMap = new Map<number, string>()
    if (mucDangKyIds.length > 0) {
      const { data: mucDangKyData } = await supabase
        .from("bb_muc_dang_ky")
        .select("id, ten_hang")
        .in("id", mucDangKyIds)
      
      if (mucDangKyData) {
        mucDangKyMap = new Map(
          mucDangKyData.map(md => [md.id, md.ten_hang || ""])
        )
      }
    }

    // Enrich ten_nguoi_tao from var_nhan_su (format: "mã - tên")
    let nhanSuMap = new Map<number, { ma_nhan_vien: number; ho_ten: string }>()
    if (nguoiTaoIds.length > 0) {
      const { data: nhanSuData } = await supabase
        .from("var_nhan_su")
        .select("ma_nhan_vien, ho_ten")
        .in("ma_nhan_vien", nguoiTaoIds)
      
      if (nhanSuData) {
        nhanSuMap = new Map(
          nhanSuData.map(ns => [ns.ma_nhan_vien, { ma_nhan_vien: ns.ma_nhan_vien, ho_ten: ns.ho_ten || "" }])
        )
      }
    }

    return data.map(item => {
      const nguoiTaoInfo = item.nguoi_tao_id ? nhanSuMap.get(item.nguoi_tao_id) : null
      
      return {
        ...item,
        ten_khach_buon: item.khach_buon_id ? khachBuonMap.get(item.khach_buon_id) || null : null,
        ten_muc_dang_ky: item.muc_dang_ky_id ? mucDangKyMap.get(item.muc_dang_ky_id) || null : null,
        ma_nguoi_tao: nguoiTaoInfo?.ma_nhan_vien || null,
        ten_nguoi_tao: nguoiTaoInfo ? (nguoiTaoInfo.ho_ten ? `${nguoiTaoInfo.ma_nhan_vien} - ${nguoiTaoInfo.ho_ten}` : String(nguoiTaoInfo.ma_nhan_vien)) : null,
      }
    }) as DangKyDoanhSo[]
  }

  /**
   * Get đăng ký doanh số by ID
   */
  static async getById(id: number): Promise<DangKyDoanhSo | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      console.error("Lỗi khi tải chi tiết đăng ký doanh số:", error)
      throw new Error(error.message)
    }

    if (!data) {
      return null
    }

    // Enrich ten_khach_buon
    let tenKhachBuon: string | null = null
    if (data.khach_buon_id) {
      const { data: khachBuonData } = await supabase
        .from("bb_khach_buon")
        .select("ten_khach_buon")
        .eq("id", data.khach_buon_id)
        .single()
      
      tenKhachBuon = khachBuonData?.ten_khach_buon || null
    }

    // Enrich ten_muc_dang_ky (using ten_hang column from bb_muc_dang_ky)
    let tenMucDangKy: string | null = null
    if (data.muc_dang_ky_id) {
      const { data: mucDangKyData } = await supabase
        .from("bb_muc_dang_ky")
        .select("ten_hang")
        .eq("id", data.muc_dang_ky_id)
        .single()
      
      tenMucDangKy = mucDangKyData?.ten_hang || null
    }

    // Enrich ten_nguoi_tao (format: "mã - tên")
    let maNguoiTao: number | null = null
    let tenNguoiTao: string | null = null
    if (data.nguoi_tao_id) {
      const { data: nguoiTaoData } = await supabase
        .from("var_nhan_su")
        .select("ma_nhan_vien, ho_ten")
        .eq("ma_nhan_vien", data.nguoi_tao_id)
        .single()
      
      if (nguoiTaoData) {
        maNguoiTao = nguoiTaoData.ma_nhan_vien
        tenNguoiTao = nguoiTaoData.ho_ten ? `${nguoiTaoData.ma_nhan_vien} - ${nguoiTaoData.ho_ten}` : String(nguoiTaoData.ma_nhan_vien)
      }
    }

    return {
      ...data,
      ten_khach_buon: tenKhachBuon,
      ten_muc_dang_ky: tenMucDangKy,
      ma_nguoi_tao: maNguoiTao,
      ten_nguoi_tao: tenNguoiTao,
    } as DangKyDoanhSo
  }

  /**
   * Create new đăng ký doanh số
   */
  static async create(input: CreateDangKyDoanhSoInput): Promise<DangKyDoanhSo> {
    // Sanitize input: convert empty strings to null for optional fields
    const sanitizedInput: any = {
      nam: input.nam ?? null,
      khach_buon_id: input.khach_buon_id ?? null,
      ten_khach_buon: input.ten_khach_buon && input.ten_khach_buon.trim() !== "" ? input.ten_khach_buon.trim() : null,
      muc_dang_ky_id: input.muc_dang_ky_id ?? null,
      ten_muc_dang_ky: input.ten_muc_dang_ky && input.ten_muc_dang_ky.trim() !== "" ? input.ten_muc_dang_ky.trim() : null,
      ghi_chu: input.ghi_chu && input.ghi_chu.trim() !== "" ? input.ghi_chu.trim() : null,
      doanh_so_min_quy: input.doanh_so_min_quy ?? null,
      doanh_so_max_quy: input.doanh_so_max_quy ?? null,
      doanh_so_min_nam: input.doanh_so_min_nam ?? null,
      doanh_so_max_nam: input.doanh_so_max_nam ?? null,
      nguoi_tao_id: input.nguoi_tao_id || null,
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(sanitizedInput)
      .select()
      .single()

    if (error) {
      console.error("Lỗi khi tạo đăng ký doanh số:", error)
      throw new Error(error.message)
    }

    if (!data) {
      throw new Error("Không nhận được dữ liệu sau khi tạo đăng ký doanh số")
    }

    return data as DangKyDoanhSo
  }

  /**
   * Update đăng ký doanh số
   */
  static async update(id: number, input: UpdateDangKyDoanhSoInput): Promise<DangKyDoanhSo> {
    if (!input || typeof input !== 'object') {
      throw new Error("Input không hợp lệ")
    }
    
    // Sanitize input
    const sanitizedInput: any = {}
    if (input.nam !== undefined) sanitizedInput.nam = input.nam ?? null
    if (input.khach_buon_id !== undefined) sanitizedInput.khach_buon_id = input.khach_buon_id ?? null
    if (input.ten_khach_buon !== undefined) sanitizedInput.ten_khach_buon = input.ten_khach_buon && input.ten_khach_buon.trim() !== "" ? input.ten_khach_buon.trim() : null
    if (input.muc_dang_ky_id !== undefined) sanitizedInput.muc_dang_ky_id = input.muc_dang_ky_id ?? null
    if (input.ten_muc_dang_ky !== undefined) sanitizedInput.ten_muc_dang_ky = input.ten_muc_dang_ky && input.ten_muc_dang_ky.trim() !== "" ? input.ten_muc_dang_ky.trim() : null
    if (input.ghi_chu !== undefined) sanitizedInput.ghi_chu = input.ghi_chu && input.ghi_chu.trim() !== "" ? input.ghi_chu.trim() : null
    if (input.doanh_so_min_quy !== undefined) sanitizedInput.doanh_so_min_quy = input.doanh_so_min_quy ?? null
    if (input.doanh_so_max_quy !== undefined) sanitizedInput.doanh_so_max_quy = input.doanh_so_max_quy ?? null
    if (input.doanh_so_min_nam !== undefined) sanitizedInput.doanh_so_min_nam = input.doanh_so_min_nam ?? null
    if (input.doanh_so_max_nam !== undefined) sanitizedInput.doanh_so_max_nam = input.doanh_so_max_nam ?? null

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(sanitizedInput)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Lỗi khi cập nhật đăng ký doanh số:", error)
      throw new Error(error.message)
    }

    if (!data) {
      throw new Error("Không nhận được dữ liệu sau khi cập nhật đăng ký doanh số")
    }

    return data as DangKyDoanhSo
  }

  /**
   * Delete đăng ký doanh số
   */
  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Lỗi khi xóa đăng ký doanh số:", error)
      throw new Error(error.message)
    }
  }

  /**
   * Batch delete đăng ký doanh số
   */
  static async batchDelete(ids: number[]): Promise<void> {
    if (ids.length === 0) return

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .in("id", ids)

    if (error) {
      console.error("Lỗi khi xóa hàng loạt đăng ký doanh số:", error)
      throw new Error(error.message)
    }
  }
}

