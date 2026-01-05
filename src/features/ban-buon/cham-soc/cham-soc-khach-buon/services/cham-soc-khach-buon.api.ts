import { supabase } from "@/lib/supabase"
import type { CreateChamSocKhachBuonInput, ChamSocKhachBuon, UpdateChamSocKhachBuonInput } from "../schema"

const TABLE_NAME = "bb_lich_su_cham_soc"

/**
 * API service for Chăm Sóc Khách Buôn
 * Handles all Supabase operations
 */
export class ChamSocKhachBuonAPI {
  /**
   * Get all chăm sóc khách buôn
   */
  static async getAll(): Promise<ChamSocKhachBuon[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("id", { ascending: true })

    if (error) {
      console.error("Lỗi khi tải danh sách chăm sóc khách buôn:", error)
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      return []
    }

    // Batch enrich foreign keys
    const nhanVienIds = [...new Set(data.map(item => item.nhan_vien_id).filter(Boolean) as number[])]
    const khachBuonIds = [...new Set(data.map(item => item.khach_buon_id).filter(Boolean) as number[])]
    const nguoiTaoIds = [...new Set(data.map(item => item.nguoi_tao_id).filter(Boolean) as number[])]

    // Enrich ten_nhan_vien and ten_nguoi_tao from var_nhan_su (format: "mã - tên")
    const allNhanSuIds = [...new Set([...nhanVienIds, ...nguoiTaoIds])]
    let nhanSuMap = new Map<number, { ma_nhan_vien: number; ho_ten: string }>()
    
    if (allNhanSuIds.length > 0) {
      const { data: nhanSuData } = await supabase
        .from("var_nhan_su")
        .select("ma_nhan_vien, ho_ten")
        .in("ma_nhan_vien", allNhanSuIds)
      
      if (nhanSuData) {
        nhanSuMap = new Map(
          nhanSuData.map(ns => [ns.ma_nhan_vien, { ma_nhan_vien: ns.ma_nhan_vien, ho_ten: ns.ho_ten || "" }])
        )
      }
    }

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

    return data.map(item => {
      const nhanSuInfo = item.nhan_vien_id ? nhanSuMap.get(item.nhan_vien_id) : null
      const nguoiTaoInfo = item.nguoi_tao_id ? nhanSuMap.get(item.nguoi_tao_id) : null
      
      return {
        ...item,
        ma_nhan_vien: nhanSuInfo?.ma_nhan_vien || null,
        ten_nhan_vien: nhanSuInfo ? (nhanSuInfo.ho_ten ? `${nhanSuInfo.ma_nhan_vien} - ${nhanSuInfo.ho_ten}` : String(nhanSuInfo.ma_nhan_vien)) : null,
        ten_khach_buon: item.khach_buon_id ? khachBuonMap.get(item.khach_buon_id) || null : null,
        ma_nguoi_tao: nguoiTaoInfo?.ma_nhan_vien || null,
        ten_nguoi_tao: nguoiTaoInfo ? (nguoiTaoInfo.ho_ten ? `${nguoiTaoInfo.ma_nhan_vien} - ${nguoiTaoInfo.ho_ten}` : String(nguoiTaoInfo.ma_nhan_vien)) : null,
      }
    }) as ChamSocKhachBuon[]
  }

  /**
   * Get chăm sóc khách buôn by ID
   */
  static async getById(id: number): Promise<ChamSocKhachBuon | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      console.error("Lỗi khi tải chi tiết chăm sóc khách buôn:", error)
      throw new Error(error.message)
    }

    if (!data) {
      return null
    }

    // Enrich ten_nhan_vien (format: "mã - tên")
    let maNhanVien: number | null = null
    let tenNhanVien: string | null = null
    if (data.nhan_vien_id) {
      const { data: nhanSuData } = await supabase
        .from("var_nhan_su")
        .select("ma_nhan_vien, ho_ten")
        .eq("ma_nhan_vien", data.nhan_vien_id)
        .single()
      
      if (nhanSuData) {
        maNhanVien = nhanSuData.ma_nhan_vien
        tenNhanVien = nhanSuData.ho_ten ? `${nhanSuData.ma_nhan_vien} - ${nhanSuData.ho_ten}` : String(nhanSuData.ma_nhan_vien)
      }
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
      ma_nhan_vien: maNhanVien,
      ten_nhan_vien: tenNhanVien,
      ten_khach_buon: tenKhachBuon,
      ma_nguoi_tao: maNguoiTao,
      ten_nguoi_tao: tenNguoiTao,
    } as ChamSocKhachBuon
  }

  /**
   * Create new chăm sóc khách buôn
   */
  static async create(input: CreateChamSocKhachBuonInput): Promise<ChamSocKhachBuon> {
    // Sanitize input: convert empty strings to null for optional fields
    const sanitizedInput: any = {
      ngay: input.ngay && input.ngay.trim() !== "" ? input.ngay.trim() : null,
      nhan_vien_id: input.nhan_vien_id ?? null,
      khach_buon_id: input.khach_buon_id ?? null,
      hinh_thuc: input.hinh_thuc && input.hinh_thuc.trim() !== "" ? input.hinh_thuc.trim() : null,
      muc_tieu: input.muc_tieu && input.muc_tieu.trim() !== "" ? input.muc_tieu.trim() : null,
      ket_qua: input.ket_qua && input.ket_qua.trim() !== "" ? input.ket_qua.trim() : null,
      hanh_dong_tiep_theo: input.hanh_dong_tiep_theo && input.hanh_dong_tiep_theo.trim() !== "" ? input.hanh_dong_tiep_theo.trim() : null,
      hen_cs_lai: input.hen_cs_lai && input.hen_cs_lai.trim() !== "" ? input.hen_cs_lai.trim() : null,
      gps: input.gps && input.gps.trim() !== "" ? input.gps.trim() : null,
      hinh_anh: input.hinh_anh && input.hinh_anh.trim() !== "" ? input.hinh_anh.trim() : null,
      nguoi_tao_id: input.nguoi_tao_id || null,
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(sanitizedInput)
      .select()
      .single()

    if (error) {
      console.error("Lỗi khi tạo chăm sóc khách buôn:", error)
      throw new Error(error.message)
    }

    if (!data) {
      throw new Error("Không nhận được dữ liệu sau khi tạo chăm sóc khách buôn")
    }

    return data as ChamSocKhachBuon
  }

  /**
   * Update chăm sóc khách buôn
   */
  static async update(id: number, input: UpdateChamSocKhachBuonInput): Promise<ChamSocKhachBuon> {
    if (!input || typeof input !== 'object') {
      throw new Error("Input không hợp lệ")
    }
    
    // Sanitize input
    const sanitizedInput: any = {}
    if (input.ngay !== undefined) sanitizedInput.ngay = input.ngay && input.ngay.trim() !== "" ? input.ngay.trim() : null
    if (input.nhan_vien_id !== undefined) sanitizedInput.nhan_vien_id = input.nhan_vien_id ?? null
    if (input.khach_buon_id !== undefined) sanitizedInput.khach_buon_id = input.khach_buon_id ?? null
    if (input.hinh_thuc !== undefined) sanitizedInput.hinh_thuc = input.hinh_thuc && input.hinh_thuc.trim() !== "" ? input.hinh_thuc.trim() : null
    if (input.muc_tieu !== undefined) sanitizedInput.muc_tieu = input.muc_tieu && input.muc_tieu.trim() !== "" ? input.muc_tieu.trim() : null
    if (input.ket_qua !== undefined) sanitizedInput.ket_qua = input.ket_qua && input.ket_qua.trim() !== "" ? input.ket_qua.trim() : null
    if (input.hanh_dong_tiep_theo !== undefined) sanitizedInput.hanh_dong_tiep_theo = input.hanh_dong_tiep_theo && input.hanh_dong_tiep_theo.trim() !== "" ? input.hanh_dong_tiep_theo.trim() : null
    if (input.hen_cs_lai !== undefined) sanitizedInput.hen_cs_lai = input.hen_cs_lai && input.hen_cs_lai.trim() !== "" ? input.hen_cs_lai.trim() : null
    if (input.gps !== undefined) sanitizedInput.gps = input.gps && input.gps.trim() !== "" ? input.gps.trim() : null
    if (input.hinh_anh !== undefined) sanitizedInput.hinh_anh = input.hinh_anh && input.hinh_anh.trim() !== "" ? input.hinh_anh.trim() : null

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(sanitizedInput)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Lỗi khi cập nhật chăm sóc khách buôn:", error)
      throw new Error(error.message)
    }

    if (!data) {
      throw new Error("Không nhận được dữ liệu sau khi cập nhật chăm sóc khách buôn")
    }

    return data as ChamSocKhachBuon
  }

  /**
   * Delete chăm sóc khách buôn
   */
  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Lỗi khi xóa chăm sóc khách buôn:", error)
      throw new Error(error.message)
    }
  }

  /**
   * Batch delete chăm sóc khách buôn
   */
  static async batchDelete(ids: number[]): Promise<void> {
    if (ids.length === 0) return

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .in("id", ids)

    if (error) {
      console.error("Lỗi khi xóa hàng loạt chăm sóc khách buôn:", error)
      throw new Error(error.message)
    }
  }
}

