import { supabase } from "@/lib/supabase"
import type { CreateXetDuyetKhachBuonInput, XetDuyetKhachBuon, UpdateXetDuyetKhachBuonInput } from "../schema"

const TABLE_NAME = "bb_xet_duyet_khach_buon"

/**
 * API service for Xét Duyệt Khách Buôn
 * Handles all Supabase operations
 */
export class XetDuyetKhachBuonAPI {
  /**
   * Get all xét duyệt khách buôn
   */
  static async getAll(): Promise<XetDuyetKhachBuon[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("id", { ascending: true })

    if (error) {
      console.error("Lỗi khi tải danh sách xét duyệt khách buôn:", error)
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
    const giaiDoanIds = [...new Set(data.map(item => item.giai_doan_id).filter(Boolean) as number[])]
    const trangThaiIds = [...new Set(data.map(item => item.trang_thai_id).filter(Boolean) as number[])]

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

    // Enrich ten_giai_doan from bb_giai_doan
    let giaiDoanMap = new Map<number, string>()
    if (giaiDoanIds.length > 0) {
      const { data: giaiDoanData } = await supabase
        .from("bb_giai_doan")
        .select("id, ten_giai_doan")
        .in("id", giaiDoanIds)
      
      if (giaiDoanData) {
        giaiDoanMap = new Map(
          giaiDoanData.map(gd => [gd.id, gd.ten_giai_doan || ""])
        )
      }
    }

    // Enrich ten_trang_thai from bb_trang_thai
    let trangThaiMap = new Map<number, string>()
    if (trangThaiIds.length > 0) {
      const { data: trangThaiData } = await supabase
        .from("bb_trang_thai")
        .select("id, ten_trang_thai")
        .in("id", trangThaiIds)
      
      if (trangThaiData) {
        trangThaiMap = new Map(
          trangThaiData.map(tt => [tt.id, tt.ten_trang_thai || ""])
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
        ten_giai_doan: item.giai_doan_id ? giaiDoanMap.get(item.giai_doan_id) || null : null,
        ten_trang_thai: item.trang_thai_id ? trangThaiMap.get(item.trang_thai_id) || null : null,
      }
    }) as XetDuyetKhachBuon[]
  }

  /**
   * Get xét duyệt khách buôn by khach_buon_id
   */
  static async getByKhachBuonId(khachBuonId: number): Promise<XetDuyetKhachBuon[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("khach_buon_id", khachBuonId)
      .order("id", { ascending: false })

    if (error) {
      console.error("Lỗi khi tải danh sách xét duyệt khách buôn theo khách buôn:", error)
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
    const giaiDoanIds = [...new Set(data.map(item => item.giai_doan_id).filter(Boolean) as number[])]
    const trangThaiIds = [...new Set(data.map(item => item.trang_thai_id).filter(Boolean) as number[])]

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
          nguoiHuyData.map(nh => [nh.ma_nhan_vien, nh.ho_ten || ""])
        )
      }
    }

    // Enrich ten_giai_doan from bb_giai_doan
    let giaiDoanMap = new Map<number, string>()
    if (giaiDoanIds.length > 0) {
      const { data: giaiDoanData, error: giaiDoanError } = await supabase
        .from("bb_giai_doan")
        .select("id, ten_giai_doan")
        .in("id", giaiDoanIds)
      
      if (giaiDoanError) {
        console.error("Lỗi khi lấy thông tin giai đoạn:", giaiDoanError)
      }
      
      if (giaiDoanData) {
        giaiDoanMap = new Map(
          giaiDoanData.map(gd => [gd.id, gd.ten_giai_doan || ""])
        )
      }
    }

    // Enrich ten_trang_thai from bb_trang_thai
    let trangThaiMap = new Map<number, string>()
    if (trangThaiIds.length > 0) {
      const { data: trangThaiData, error: trangThaiError } = await supabase
        .from("bb_trang_thai")
        .select("id, ten_trang_thai")
        .in("id", trangThaiIds)
      
      if (trangThaiError) {
        console.error("Lỗi khi lấy thông tin trạng thái:", trangThaiError)
      }
      
      if (trangThaiData) {
        trangThaiMap = new Map(
          trangThaiData.map(tt => [tt.id, tt.ten_trang_thai || ""])
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
        ten_giai_doan: item.giai_doan_id ? giaiDoanMap.get(item.giai_doan_id) || null : null,
        ten_trang_thai: item.trang_thai_id ? trangThaiMap.get(item.trang_thai_id) || null : null,
      }
    }) as XetDuyetKhachBuon[]
  }

  /**
   * Get xét duyệt khách buôn by ID
   */
  static async getById(id: number): Promise<XetDuyetKhachBuon | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      console.error("Lỗi khi tải chi tiết xét duyệt khách buôn:", error)
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

    // Enrich ten_giai_doan
    let tenGiaiDoan: string | null = null
    if (data.giai_doan_id) {
      const { data: giaiDoanData, error: giaiDoanError } = await supabase
        .from("bb_giai_doan")
        .select("ten_giai_doan")
        .eq("id", data.giai_doan_id)
        .single()
      
      if (giaiDoanError) {
        console.error("Lỗi khi lấy thông tin giai đoạn:", giaiDoanError)
      }
      
      tenGiaiDoan = giaiDoanData?.ten_giai_doan || null
    }

    // Enrich ten_trang_thai
    let tenTrangThai: string | null = null
    if (data.trang_thai_id) {
      const { data: trangThaiData, error: trangThaiError } = await supabase
        .from("bb_trang_thai")
        .select("ten_trang_thai")
        .eq("id", data.trang_thai_id)
        .single()
      
      if (trangThaiError) {
        console.error("Lỗi khi lấy thông tin trạng thái:", trangThaiError)
      }
      
      tenTrangThai = trangThaiData?.ten_trang_thai || null
    }

    return {
      ...data,
      ten_khach_buon: tenKhachBuon,
      ten_quan_ly: tenQuanLy,
      ten_bgd: tenBgd,
      ma_nguoi_tao: maNguoiTao,
      ten_nguoi_tao: tenNguoiTao,
      ten_nguoi_huy: tenNguoiHuy,
      ten_giai_doan: tenGiaiDoan,
      ten_trang_thai: tenTrangThai,
    } as XetDuyetKhachBuon
  }

  /**
   * Create new xét duyệt khách buôn
   */
  static async create(input: CreateXetDuyetKhachBuonInput): Promise<XetDuyetKhachBuon> {
    // Sanitize input: convert empty strings to null for optional fields
    const sanitizedInput: any = {
      ngay: input.ngay && input.ngay.trim() !== "" ? input.ngay.trim() : null,
      khach_buon_id: input.khach_buon_id ?? null,
      ten_khach_buon: input.ten_khach_buon && input.ten_khach_buon.trim() !== "" ? input.ten_khach_buon.trim() : null,
      tsn_tinh_thanh_id: input.tsn_tinh_thanh_id ?? null,
      tsn_ten_tinh_thanh: input.tsn_ten_tinh_thanh && input.tsn_ten_tinh_thanh.trim() !== "" ? input.tsn_ten_tinh_thanh.trim() : null,
      ssn_tinh_thanh_id: input.ssn_tinh_thanh_id ?? null,
      ssn_ten_tinh_thanh: input.ssn_ten_tinh_thanh && input.ssn_ten_tinh_thanh.trim() !== "" ? input.ssn_ten_tinh_thanh.trim() : null,
      muc_dang_ky_id: input.muc_dang_ky_id ?? null,
      ten_muc_dang_ky: input.ten_muc_dang_ky && input.ten_muc_dang_ky.trim() !== "" ? input.ten_muc_dang_ky.trim() : null,
      doanh_so_min_quy: input.doanh_so_min_quy ?? null,
      doanh_so_max_quy: input.doanh_so_max_quy ?? null,
      doanh_so_min_nam: input.doanh_so_min_nam ?? null,
      doanh_so_max_nam: input.doanh_so_max_nam ?? null,
      ngay_ap_dung: input.ngay_ap_dung && input.ngay_ap_dung.trim() !== "" ? input.ngay_ap_dung.trim() : null,
      ghi_chu: input.ghi_chu && input.ghi_chu.trim() !== "" ? input.ghi_chu.trim() : null,
      trang_thai: input.trang_thai && input.trang_thai.trim() !== "" ? input.trang_thai.trim() : null,
      quan_ly_duyet: input.quan_ly_duyet && input.quan_ly_duyet.trim() !== "" ? input.quan_ly_duyet.trim() : null,
      quan_ly_id: input.quan_ly_id ?? null,
      bgd_duyet: input.bgd_duyet && input.bgd_duyet.trim() !== "" ? input.bgd_duyet.trim() : null,
      bgd_id: input.bgd_id ?? null,
      trao_doi: input.trao_doi ?? null,
      link_hop_dong: input.link_hop_dong && input.link_hop_dong.trim() !== "" ? input.link_hop_dong.trim() : null,
      file_hop_dong: input.file_hop_dong && input.file_hop_dong.trim() !== "" ? input.file_hop_dong.trim() : null,
      giai_doan_id: input.giai_doan_id ?? null,
      trang_thai_id: input.trang_thai_id ?? null,
      nguoi_tao_id: input.nguoi_tao_id || null,
    }

    // Enrich ten_giai_doan from bb_giai_doan
    if (sanitizedInput.giai_doan_id) {
      const { data: giaiDoanData, error: giaiDoanError } = await supabase
        .from("bb_giai_doan")
        .select("ten_giai_doan")
        .eq("id", sanitizedInput.giai_doan_id)
        .single()
      
      if (giaiDoanError) {
        console.error("Lỗi khi lấy thông tin giai đoạn:", giaiDoanError)
      } else if (giaiDoanData) {
        sanitizedInput.ten_giai_doan = giaiDoanData.ten_giai_doan || null
      }
    }

    // Enrich ten_trang_thai from bb_trang_thai
    if (sanitizedInput.trang_thai_id) {
      const { data: trangThaiData, error: trangThaiError } = await supabase
        .from("bb_trang_thai")
        .select("ten_trang_thai")
        .eq("id", sanitizedInput.trang_thai_id)
        .single()
      
      if (trangThaiError) {
        console.error("Lỗi khi lấy thông tin trạng thái:", trangThaiError)
      } else if (trangThaiData) {
        sanitizedInput.ten_trang_thai = trangThaiData.ten_trang_thai || null
      }
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(sanitizedInput)
      .select()
      .single()

    if (error) {
      console.error("Lỗi khi tạo xét duyệt khách buôn:", error)
      throw new Error(error.message)
    }

    if (!data) {
      throw new Error("Không nhận được dữ liệu sau khi tạo xét duyệt khách buôn")
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
    } as XetDuyetKhachBuon
  }

  /**
   * Update xét duyệt khách buôn
   */
  static async update(id: number, input: UpdateXetDuyetKhachBuonInput): Promise<XetDuyetKhachBuon> {
    if (!input || typeof input !== 'object') {
      throw new Error("Input không hợp lệ")
    }
    
    // Sanitize input
    const sanitizedInput: any = {}
    if (input.ngay !== undefined) sanitizedInput.ngay = input.ngay && input.ngay.trim() !== "" ? input.ngay.trim() : null
    if (input.khach_buon_id !== undefined) sanitizedInput.khach_buon_id = input.khach_buon_id ?? null
    if (input.ten_khach_buon !== undefined) sanitizedInput.ten_khach_buon = input.ten_khach_buon && input.ten_khach_buon.trim() !== "" ? input.ten_khach_buon.trim() : null
    if (input.tsn_tinh_thanh_id !== undefined) sanitizedInput.tsn_tinh_thanh_id = input.tsn_tinh_thanh_id ?? null
    if (input.tsn_ten_tinh_thanh !== undefined) sanitizedInput.tsn_ten_tinh_thanh = input.tsn_ten_tinh_thanh && input.tsn_ten_tinh_thanh.trim() !== "" ? input.tsn_ten_tinh_thanh.trim() : null
    if (input.ssn_tinh_thanh_id !== undefined) sanitizedInput.ssn_tinh_thanh_id = input.ssn_tinh_thanh_id ?? null
    if (input.ssn_ten_tinh_thanh !== undefined) sanitizedInput.ssn_ten_tinh_thanh = input.ssn_ten_tinh_thanh && input.ssn_ten_tinh_thanh.trim() !== "" ? input.ssn_ten_tinh_thanh.trim() : null
    if (input.muc_dang_ky_id !== undefined) sanitizedInput.muc_dang_ky_id = input.muc_dang_ky_id ?? null
    if (input.ten_muc_dang_ky !== undefined) sanitizedInput.ten_muc_dang_ky = input.ten_muc_dang_ky && input.ten_muc_dang_ky.trim() !== "" ? input.ten_muc_dang_ky.trim() : null
    if (input.doanh_so_min_quy !== undefined) sanitizedInput.doanh_so_min_quy = input.doanh_so_min_quy ?? null
    if (input.doanh_so_max_quy !== undefined) sanitizedInput.doanh_so_max_quy = input.doanh_so_max_quy ?? null
    if (input.doanh_so_min_nam !== undefined) sanitizedInput.doanh_so_min_nam = input.doanh_so_min_nam ?? null
    if (input.doanh_so_max_nam !== undefined) sanitizedInput.doanh_so_max_nam = input.doanh_so_max_nam ?? null
    if (input.ngay_ap_dung !== undefined) sanitizedInput.ngay_ap_dung = input.ngay_ap_dung && input.ngay_ap_dung.trim() !== "" ? input.ngay_ap_dung.trim() : null
    if (input.ghi_chu !== undefined) sanitizedInput.ghi_chu = input.ghi_chu && input.ghi_chu.trim() !== "" ? input.ghi_chu.trim() : null
    if (input.trang_thai !== undefined) sanitizedInput.trang_thai = input.trang_thai && input.trang_thai.trim() !== "" ? input.trang_thai.trim() : null
    if (input.quan_ly_duyet !== undefined) sanitizedInput.quan_ly_duyet = input.quan_ly_duyet && input.quan_ly_duyet.trim() !== "" ? input.quan_ly_duyet.trim() : null
    if (input.quan_ly_id !== undefined) sanitizedInput.quan_ly_id = input.quan_ly_id ?? null
    if (input.bgd_duyet !== undefined) sanitizedInput.bgd_duyet = input.bgd_duyet && input.bgd_duyet.trim() !== "" ? input.bgd_duyet.trim() : null
    if (input.bgd_id !== undefined) sanitizedInput.bgd_id = input.bgd_id ?? null
    if (input.trao_doi !== undefined) sanitizedInput.trao_doi = input.trao_doi ?? null
    if (input.link_hop_dong !== undefined) sanitizedInput.link_hop_dong = input.link_hop_dong && input.link_hop_dong.trim() !== "" ? input.link_hop_dong.trim() : null
    if (input.file_hop_dong !== undefined) sanitizedInput.file_hop_dong = input.file_hop_dong && input.file_hop_dong.trim() !== "" ? input.file_hop_dong.trim() : null
    if (input.giai_doan_id !== undefined) sanitizedInput.giai_doan_id = input.giai_doan_id ?? null
    if (input.ten_giai_doan !== undefined) sanitizedInput.ten_giai_doan = input.ten_giai_doan && input.ten_giai_doan.trim() !== "" ? input.ten_giai_doan.trim() : null
    if (input.trang_thai_id !== undefined) sanitizedInput.trang_thai_id = input.trang_thai_id ?? null
    if ((input as any).nguoi_huy_id !== undefined) sanitizedInput.nguoi_huy_id = (input as any).nguoi_huy_id ?? null

    // Enrich ten_giai_doan from bb_giai_doan if giai_doan_id is being updated
    if (sanitizedInput.giai_doan_id !== undefined && sanitizedInput.giai_doan_id !== null) {
      const { data: giaiDoanData, error: giaiDoanError } = await supabase
        .from("bb_giai_doan")
        .select("ten_giai_doan")
        .eq("id", sanitizedInput.giai_doan_id)
        .single()
      
      if (giaiDoanError) {
        console.error("Lỗi khi lấy thông tin giai đoạn:", giaiDoanError)
      } else if (giaiDoanData) {
        sanitizedInput.ten_giai_doan = giaiDoanData.ten_giai_doan || null
      }
    }

    // Enrich ten_trang_thai from bb_trang_thai if trang_thai_id is being updated
    if (sanitizedInput.trang_thai_id !== undefined && sanitizedInput.trang_thai_id !== null) {
      const { data: trangThaiData, error: trangThaiError } = await supabase
        .from("bb_trang_thai")
        .select("ten_trang_thai")
        .eq("id", sanitizedInput.trang_thai_id)
        .single()
      
      if (trangThaiError) {
        console.error("Lỗi khi lấy thông tin trạng thái:", trangThaiError)
      } else if (trangThaiData) {
        sanitizedInput.ten_trang_thai = trangThaiData.ten_trang_thai || null
      }
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(sanitizedInput)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Lỗi khi cập nhật xét duyệt khách buôn:", error)
      throw new Error(error.message)
    }

    if (!data) {
      throw new Error("Không nhận được dữ liệu sau khi cập nhật xét duyệt khách buôn")
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
    } as XetDuyetKhachBuon
  }

  /**
   * Delete xét duyệt khách buôn
   */
  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Lỗi khi xóa xét duyệt khách buôn:", error)
      throw new Error(error.message)
    }
  }

  /**
   * Batch delete xét duyệt khách buôn
   */
  static async batchDelete(ids: number[]): Promise<void> {
    if (ids.length === 0) return

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .in("id", ids)

    if (error) {
      console.error("Lỗi khi xóa hàng loạt xét duyệt khách buôn:", error)
      throw new Error(error.message)
    }
  }

  /**
   * Thực thi xét duyệt khách buôn - cập nhật trạng thái khách buôn theo ngay_ap_dung
   * Gọi SQL function fn_thuc_thi_xet_duyet_khach_buon
   */
  static async thucThiXetDuyet(): Promise<{ updated_count: number; updated_ids: number[] }> {
    const { data, error } = await supabase.rpc('fn_thuc_thi_xet_duyet_khach_buon')

    if (error) {
      console.error("Lỗi khi thực thi xét duyệt khách buôn:", error)
      throw new Error(error.message || "Không thể thực thi xét duyệt khách buôn")
    }

    if (!data || data.length === 0) {
      return { updated_count: 0, updated_ids: [] }
    }

    // RPC trả về array với 1 record chứa updated_count và updated_ids
    const result = Array.isArray(data) ? data[0] : data
    return {
      updated_count: result?.updated_count || 0,
      updated_ids: result?.updated_ids || []
    }
  }
}

