import { supabase } from "@/lib/supabase"
import { RawQuyData, RawDoanhSoData } from "../types"

/**
 * API service for Tổng quan quỹ HTBH
 * Join dữ liệu từ var_dk_doanh_so và htbh_quy_htbh
 */
export class TongQuanQuyHTBHAPI {
  /**
   * Get quỹ data từ htbh_quy_htbh
   */
  static async getQuyData(nam: number): Promise<RawQuyData[]> {
    const { data, error } = await supabase
      .from("htbh_quy_htbh")
      .select("nhan_vien_id, ten_nhan_vien, phong_id, ma_phong, nhom_id, ma_nhom, nam, thang, so_tien_quy, da_dung, con_du")
      .eq("nam", nam)
      .order("nhan_vien_id", { ascending: true })
      .order("thang", { ascending: true })

    if (error) {
      console.error("Lỗi khi tải dữ liệu quỹ HTBH:", error)
      throw new Error(error.message)
    }

    return (data || []) as RawQuyData[]
  }

  /**
   * Get doanh số data từ var_dk_doanh_so
   */
  static async getDoanhSoData(nam: number): Promise<RawDoanhSoData[]> {
    const { data, error } = await supabase
      .from("var_dk_doanh_so")
      .select("nhan_vien_id, ten_nhan_vien, nam, thang, doanh_thu")
      .eq("nam", nam)
      .order("nhan_vien_id", { ascending: true })
      .order("thang", { ascending: true })

    if (error) {
      console.error("Lỗi khi tải dữ liệu đăng ký doanh số:", error)
      throw new Error(error.message)
    }

    return (data || []) as RawDoanhSoData[]
  }

  /**
   * Get combined data từ cả 2 bảng
   */
  static async getCombinedData(nam: number): Promise<{
    quyData: RawQuyData[]
    doanhSoData: RawDoanhSoData[]
  }> {
    const [quyData, doanhSoData] = await Promise.all([
      this.getQuyData(nam),
      this.getDoanhSoData(nam),
    ])

    return { quyData, doanhSoData }
  }
}

