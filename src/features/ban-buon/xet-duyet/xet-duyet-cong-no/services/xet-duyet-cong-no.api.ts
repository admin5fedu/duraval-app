import { supabase } from "@/lib/supabase"
import type { CreateXetDuyetCongNoInput, XetDuyetCongNo, UpdateXetDuyetCongNoInput } from "../schema"

const TABLE_NAME = "bb_xet_duyet_cong_no"

/**
 * API service for Xét Duyệt Công Nợ
 * Handles all Supabase operations
 */
export class XetDuyetCongNoAPI {
  /**
   * Get all xét duyệt công nợ
   */
  static async getAll(): Promise<XetDuyetCongNo[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("id", { ascending: true })

    if (error) {
      console.error("Lỗi khi tải danh sách xét duyệt công nợ:", error)
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      return []
    }

    // Batch enrich foreign keys
    const khachBuonIds = [...new Set(data.map(item => item.khach_buon_id).filter(Boolean) as number[])]
    const quanLyIds = [...new Set(data.map(item => item.quan_ly_id).filter(Boolean) as number[])]
    const bgdIds = [...new Set(data.map(item => item.bgd_id).filter(Boolean) as number[])]
    const nguoiTaoIds = [...new Set(data.map(item => item.nguoi_tao_id).filter(Boolean) as number[])]
    const nguoiHuyIds = [...new Set(data.map(item => (item as any).nguoi_huy_id).filter(Boolean) as number[])]

    // Enrich ten_khach_buon from bb_khach_buon
    let khachBuonMap = new Map<number, string>()
    if (khachBuonIds.length > 0) {
      const { data: khachBuonData, error: khachBuonError } = await supabase
        .from("bb_khach_buon")
        .select("id, ten_khach_buon")
        .in("id", khachBuonIds)
      
      if (khachBuonError) {
        console.error("Lỗi khi lấy thông tin khách buôn:", khachBuonError)
      }
      
      if (khachBuonData) {
        khachBuonMap = new Map(
          khachBuonData.map(kb => [kb.id, kb.ten_khach_buon || ""])
        )
      }
    }

    // Enrich ten_quan_ly from var_nhan_su
    let quanLyMap = new Map<number, string>()
    if (quanLyIds.length > 0) {
      const { data: quanLyData } = await supabase
        .from("var_nhan_su")
        .select("ma_nhan_vien, ho_ten")
        .in("ma_nhan_vien", quanLyIds)
      
      if (quanLyData) {
        quanLyMap = new Map(
          quanLyData.map(ql => [ql.ma_nhan_vien, ql.ho_ten || ""])
        )
      }
    }

    // Enrich ten_bgd from var_nhan_su
    let bgdMap = new Map<number, string>()
    if (bgdIds.length > 0) {
      const { data: bgdData } = await supabase
        .from("var_nhan_su")
        .select("ma_nhan_vien, ho_ten")
        .in("ma_nhan_vien", bgdIds)
      
      if (bgdData) {
        bgdMap = new Map(
          bgdData.map(bgd => [bgd.ma_nhan_vien, bgd.ho_ten || ""])
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

    // Enrich ten_nguoi_huy from var_nhan_su
    let nguoiHuyMap = new Map<number, string>()
    if (nguoiHuyIds.length > 0) {
      const { data: nguoiHuyData } = await supabase
        .from("var_nhan_su")
        .select("ma_nhan_vien, ho_ten")
        .in("ma_nhan_vien", nguoiHuyIds)
      
      if (nguoiHuyData) {
        nguoiHuyMap = new Map(
          nguoiHuyData.map(nh => [nh.ma_nhan_vien, nh.ho_ten || ""])
        )
      }
    }

    return data.map(item => {
      const nguoiTaoInfo = item.nguoi_tao_id ? nhanSuMap.get(item.nguoi_tao_id) : null
      const quanLyInfo = item.quan_ly_id ? quanLyMap.get(item.quan_ly_id) : null
      const bgdInfo = item.bgd_id ? bgdMap.get(item.bgd_id) : null
      
      return {
        ...item,
        ten_khach_buon: item.khach_buon_id ? khachBuonMap.get(item.khach_buon_id) || null : null,
        ten_quan_ly: quanLyInfo || null,
        ten_bgd: bgdInfo || null,
        ma_nguoi_tao: nguoiTaoInfo?.ma_nhan_vien || null,
        ten_nguoi_tao: nguoiTaoInfo ? (nguoiTaoInfo.ho_ten ? `${nguoiTaoInfo.ma_nhan_vien} - ${nguoiTaoInfo.ho_ten}` : String(nguoiTaoInfo.ma_nhan_vien)) : null,
        ten_nguoi_huy: (item as any).nguoi_huy_id ? nguoiHuyMap.get((item as any).nguoi_huy_id) || null : null,
      }
    }) as XetDuyetCongNo[]
  }

  /**
   * Get xét duyệt công nợ by khach_buon_id
   */
  static async getByKhachBuonId(khachBuonId: number): Promise<XetDuyetCongNo[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("khach_buon_id", khachBuonId)
      .order("id", { ascending: false })

    if (error) {
      console.error("Lỗi khi tải danh sách xét duyệt công nợ theo khách buôn:", error)
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      return []
    }

    // Enrich data similar to getAll
    const khachBuonIds = [...new Set(data.map(item => item.khach_buon_id).filter(Boolean) as number[])]
    const quanLyIds = [...new Set(data.map(item => item.quan_ly_id).filter(Boolean) as number[])]
    const bgdIds = [...new Set(data.map(item => item.bgd_id).filter(Boolean) as number[])]
    const nguoiTaoIds = [...new Set(data.map(item => item.nguoi_tao_id).filter(Boolean) as number[])]
    const nguoiHuyIds = [...new Set(data.map(item => (item as any).nguoi_huy_id).filter(Boolean) as number[])]

    let khachBuonMap = new Map<number, string>()
    if (khachBuonIds.length > 0) {
      const { data: khachBuonData, error: khachBuonError } = await supabase
        .from("bb_khach_buon")
        .select("id, ten_khach_buon")
        .in("id", khachBuonIds)
      
      if (khachBuonError) {
        console.error("Lỗi khi lấy thông tin khách buôn:", khachBuonError)
      }
      
      if (khachBuonData) {
        khachBuonMap = new Map(
          khachBuonData.map(kb => [kb.id, kb.ten_khach_buon || ""])
        )
      }
    }

    let quanLyMap = new Map<number, string>()
    if (quanLyIds.length > 0) {
      const { data: quanLyData, error: quanLyError } = await supabase
        .from("var_nhan_su")
        .select("ma_nhan_vien, ho_ten")
        .in("ma_nhan_vien", quanLyIds)
      
      if (quanLyError) {
        console.error("Lỗi khi lấy thông tin quản lý:", quanLyError)
      }
      
      if (quanLyData) {
        quanLyMap = new Map(
          quanLyData.map(ns => [ns.ma_nhan_vien, ns.ho_ten || ""])
        )
      }
    }

    let bgdMap = new Map<number, string>()
    if (bgdIds.length > 0) {
      const { data: bgdData, error: bgdError } = await supabase
        .from("var_nhan_su")
        .select("ma_nhan_vien, ho_ten")
        .in("ma_nhan_vien", bgdIds)
      
      if (bgdError) {
        console.error("Lỗi khi lấy thông tin BGD:", bgdError)
      }
      
      if (bgdData) {
        bgdMap = new Map(
          bgdData.map(ns => [ns.ma_nhan_vien, ns.ho_ten || ""])
        )
      }
    }

    let nguoiTaoMap = new Map<number, string>()
    if (nguoiTaoIds.length > 0) {
      const { data: nguoiTaoData, error: nguoiTaoError } = await supabase
        .from("var_nhan_su")
        .select("ma_nhan_vien, ho_ten")
        .in("ma_nhan_vien", nguoiTaoIds)
      
      if (nguoiTaoError) {
        console.error("Lỗi khi lấy thông tin người tạo:", nguoiTaoError)
      }
      
      if (nguoiTaoData) {
        nguoiTaoMap = new Map(
          nguoiTaoData.map(ns => [ns.ma_nhan_vien, ns.ho_ten || ""])
        )
      }
    }

    let nguoiHuyMap = new Map<number, string>()
    if (nguoiHuyIds.length > 0) {
      const { data: nguoiHuyData, error: nguoiHuyError } = await supabase
        .from("var_nhan_su")
        .select("ma_nhan_vien, ho_ten")
        .in("ma_nhan_vien", nguoiHuyIds)
      
      if (nguoiHuyError) {
        console.error("Lỗi khi lấy thông tin người hủy:", nguoiHuyError)
      }
      
      if (nguoiHuyData) {
        nguoiHuyMap = new Map(
          nguoiHuyData.map(ns => [ns.ma_nhan_vien, ns.ho_ten || ""])
        )
      }
    }

    return data.map(item => {
      return {
        ...item,
        ten_khach_buon: item.khach_buon_id ? khachBuonMap.get(item.khach_buon_id) || null : null,
        ten_quan_ly: item.quan_ly_id ? quanLyMap.get(item.quan_ly_id) || null : null,
        ten_bgd: item.bgd_id ? bgdMap.get(item.bgd_id) || null : null,
        ten_nguoi_tao: item.nguoi_tao_id ? nguoiTaoMap.get(item.nguoi_tao_id) || null : null,
        ten_nguoi_huy: (item as any).nguoi_huy_id ? nguoiHuyMap.get((item as any).nguoi_huy_id) || null : null,
      }
    }) as XetDuyetCongNo[]
  }

  /**
   * Get xét duyệt công nợ by ID
   */
  static async getById(id: number): Promise<XetDuyetCongNo | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      console.error("Lỗi khi tải chi tiết xét duyệt công nợ:", error)
      throw new Error(error.message)
    }

    if (!data) {
      return null
    }

    // Enrich ten_khach_buon
    let tenKhachBuon: string | null = null
    if (data.khach_buon_id) {
      const { data: khachBuonData, error: khachBuonError } = await supabase
        .from("bb_khach_buon")
        .select("ten_khach_buon")
        .eq("id", data.khach_buon_id)
        .single()
      
      if (khachBuonError) {
        console.error("Lỗi khi lấy thông tin khách buôn:", khachBuonError)
      }
      
      tenKhachBuon = khachBuonData?.ten_khach_buon || null
    }

    // Enrich ten_quan_ly
    let tenQuanLy: string | null = null
    if (data.quan_ly_id) {
      const { data: quanLyData } = await supabase
        .from("var_nhan_su")
        .select("ho_ten")
        .eq("ma_nhan_vien", data.quan_ly_id)
        .single()
      
      tenQuanLy = quanLyData?.ho_ten || null
    }

    // Enrich ten_bgd
    let tenBgd: string | null = null
    if (data.bgd_id) {
      const { data: bgdData } = await supabase
        .from("var_nhan_su")
        .select("ho_ten")
        .eq("ma_nhan_vien", data.bgd_id)
        .single()
      
      tenBgd = bgdData?.ho_ten || null
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

    // Enrich ten_nguoi_huy
    let tenNguoiHuy: string | null = null
    if ((data as any).nguoi_huy_id) {
      const { data: nguoiHuyData } = await supabase
        .from("var_nhan_su")
        .select("ho_ten")
        .eq("ma_nhan_vien", (data as any).nguoi_huy_id)
        .single()
      
      tenNguoiHuy = nguoiHuyData?.ho_ten || null
    }

    return {
      ...data,
      ten_khach_buon: tenKhachBuon,
      ten_quan_ly: tenQuanLy,
      ten_bgd: tenBgd,
      ma_nguoi_tao: maNguoiTao,
      ten_nguoi_tao: tenNguoiTao,
      ten_nguoi_huy: tenNguoiHuy,
    } as XetDuyetCongNo
  }

  /**
   * Create new xét duyệt công nợ
   */
  static async create(input: CreateXetDuyetCongNoInput): Promise<XetDuyetCongNo> {
    // Sanitize input: convert empty strings to null for optional fields
    const sanitizedInput: any = {
      khach_buon_id: input.khach_buon_id ?? null,
      ten_khach_buon: input.ten_khach_buon && input.ten_khach_buon.trim() !== "" ? input.ten_khach_buon.trim() : null,
      loai_hinh: input.loai_hinh && input.loai_hinh.trim() !== "" ? input.loai_hinh.trim() : null,
      muc_cong_no: input.muc_cong_no ?? null,
      de_xuat_ngay_ap_dung: input.de_xuat_ngay_ap_dung && input.de_xuat_ngay_ap_dung.trim() !== "" ? input.de_xuat_ngay_ap_dung.trim() : null,
      ghi_chu: input.ghi_chu && input.ghi_chu.trim() !== "" ? input.ghi_chu.trim() : null,
      ngay_ap_dung: input.ngay_ap_dung && input.ngay_ap_dung.trim() !== "" ? input.ngay_ap_dung.trim() : null,
      trang_thai: input.trang_thai && input.trang_thai.trim() !== "" ? input.trang_thai.trim() : null,
      quan_ly_duyet: input.quan_ly_duyet && input.quan_ly_duyet.trim() !== "" ? input.quan_ly_duyet.trim() : null,
      quan_ly_id: input.quan_ly_id ?? null,
      bgd_duyet: input.bgd_duyet && input.bgd_duyet.trim() !== "" ? input.bgd_duyet.trim() : null,
      bgd_id: input.bgd_id ?? null,
      trao_doi: input.trao_doi ?? null,
      audit_log: (input as any).audit_log ?? null,
      nguoi_tao_id: input.nguoi_tao_id || null,
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(sanitizedInput)
      .select()
      .single()

    if (error) {
      console.error("Lỗi khi tạo xét duyệt công nợ:", error)
      throw new Error(error.message)
    }

    if (!data) {
      throw new Error("Không nhận được dữ liệu sau khi tạo xét duyệt công nợ")
    }

    // Enrich ten_khach_buon sau khi tạo
    let tenKhachBuon: string | null = null
    if (data.khach_buon_id) {
      const { data: khachBuonData, error: khachBuonError } = await supabase
        .from("bb_khach_buon")
        .select("ten_khach_buon")
        .eq("id", data.khach_buon_id)
        .single()
      
      if (khachBuonError) {
        console.error("Lỗi khi lấy thông tin khách buôn sau khi tạo:", khachBuonError)
      }
      
      tenKhachBuon = khachBuonData?.ten_khach_buon || null
    }

    return {
      ...data,
      ten_khach_buon: tenKhachBuon,
    } as XetDuyetCongNo
  }

  /**
   * Update xét duyệt công nợ
   */
  static async update(id: number, input: UpdateXetDuyetCongNoInput): Promise<XetDuyetCongNo> {
    if (!input || typeof input !== 'object') {
      throw new Error("Input không hợp lệ")
    }
    
    // Sanitize input
    const sanitizedInput: any = {}
    if (input.khach_buon_id !== undefined) sanitizedInput.khach_buon_id = input.khach_buon_id ?? null
    if (input.ten_khach_buon !== undefined) sanitizedInput.ten_khach_buon = input.ten_khach_buon && input.ten_khach_buon.trim() !== "" ? input.ten_khach_buon.trim() : null
    if (input.loai_hinh !== undefined) sanitizedInput.loai_hinh = input.loai_hinh && input.loai_hinh.trim() !== "" ? input.loai_hinh.trim() : null
    if (input.muc_cong_no !== undefined) sanitizedInput.muc_cong_no = input.muc_cong_no ?? null
    if (input.de_xuat_ngay_ap_dung !== undefined) sanitizedInput.de_xuat_ngay_ap_dung = input.de_xuat_ngay_ap_dung && input.de_xuat_ngay_ap_dung.trim() !== "" ? input.de_xuat_ngay_ap_dung.trim() : null
    if (input.ghi_chu !== undefined) sanitizedInput.ghi_chu = input.ghi_chu && input.ghi_chu.trim() !== "" ? input.ghi_chu.trim() : null
    if (input.ngay_ap_dung !== undefined) sanitizedInput.ngay_ap_dung = input.ngay_ap_dung && input.ngay_ap_dung.trim() !== "" ? input.ngay_ap_dung.trim() : null
    if (input.trang_thai !== undefined) sanitizedInput.trang_thai = input.trang_thai && input.trang_thai.trim() !== "" ? input.trang_thai.trim() : null
    if (input.quan_ly_duyet !== undefined) sanitizedInput.quan_ly_duyet = input.quan_ly_duyet && input.quan_ly_duyet.trim() !== "" ? input.quan_ly_duyet.trim() : null
    if (input.quan_ly_id !== undefined) sanitizedInput.quan_ly_id = input.quan_ly_id ?? null
    if (input.bgd_duyet !== undefined) sanitizedInput.bgd_duyet = input.bgd_duyet && input.bgd_duyet.trim() !== "" ? input.bgd_duyet.trim() : null
    if (input.bgd_id !== undefined) sanitizedInput.bgd_id = input.bgd_id ?? null
    if (input.trao_doi !== undefined) sanitizedInput.trao_doi = input.trao_doi ?? null
    if ((input as any).audit_log !== undefined) sanitizedInput.audit_log = (input as any).audit_log ?? null
    if ((input as any).nguoi_huy_id !== undefined) sanitizedInput.nguoi_huy_id = (input as any).nguoi_huy_id ?? null

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(sanitizedInput)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Lỗi khi cập nhật xét duyệt công nợ:", error)
      throw new Error(error.message)
    }

    if (!data) {
      throw new Error("Không nhận được dữ liệu sau khi cập nhật xét duyệt công nợ")
    }

    // Enrich ten_khach_buon sau khi cập nhật
    let tenKhachBuon: string | null = null
    if (data.khach_buon_id) {
      const { data: khachBuonData, error: khachBuonError } = await supabase
        .from("bb_khach_buon")
        .select("ten_khach_buon")
        .eq("id", data.khach_buon_id)
        .single()
      
      if (khachBuonError) {
        console.error("Lỗi khi lấy thông tin khách buôn sau khi cập nhật:", khachBuonError)
      }
      
      tenKhachBuon = khachBuonData?.ten_khach_buon || null
    }

    return {
      ...data,
      ten_khach_buon: tenKhachBuon,
    } as XetDuyetCongNo
  }

  /**
   * Delete xét duyệt công nợ
   */
  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Lỗi khi xóa xét duyệt công nợ:", error)
      throw new Error(error.message)
    }
  }

  /**
   * Batch delete xét duyệt công nợ
   */
  static async batchDelete(ids: number[]): Promise<void> {
    if (ids.length === 0) return

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .in("id", ids)

    if (error) {
      console.error("Lỗi khi xóa hàng loạt xét duyệt công nợ:", error)
      throw new Error(error.message)
    }
  }
}

