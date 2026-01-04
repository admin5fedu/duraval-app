import { supabase } from "@/lib/supabase"
import type { CreateDanhSachKBInput, DanhSachKB, UpdateDanhSachKBInput } from "../schema"

const TABLE_NAME = "bb_khach_buon"

/**
 * API service for Danh Sách KB
 * Handles all Supabase operations with data enrichment
 */
export class DanhSachKBAPI {
  /**
   * Get all khách buôn
   */
  static async getAll(): Promise<DanhSachKB[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("id", { ascending: true })

    if (error) {
      console.error("Lỗi khi tải danh sách khách buôn:", error)
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      return []
    }

    // Batch enrich foreign keys
    const nguoiTaoIds = [...new Set(data.map(item => item.nguoi_tao_id).filter(Boolean) as number[])]
    const giaiDoanIds = [...new Set(data.map(item => item.giai_doan_id).filter(Boolean) as number[])]
    const trangThaiIds = [...new Set(data.map(item => item.trang_thai_id).filter(Boolean) as number[])]
    const teleSaleIds = [...new Set(data.map(item => item.tele_sale_id).filter(Boolean) as number[])]
    const tsnTinhThanhIds = [...new Set(data.map(item => item.tsn_tinh_thanh_id).filter(Boolean) as number[])]
    const tsnQuanHuyenIds = [...new Set(data.map(item => item.tsn_quan_huyen_id).filter(Boolean) as number[])]
    const tsnPhuongXaIds = [...new Set(data.map(item => item.tsn_phuong_xa_id).filter(Boolean) as number[])]
    const ssnTinhThanhIds = [...new Set(data.map(item => item.ssn_tinh_thanh_id).filter(Boolean) as number[])]
    const ssnPhuongXaIds = [...new Set(data.map(item => item.ssn_phuong_xa_id).filter(Boolean) as number[])]
    
    // Enrich nguoi_tao_ten and ten_tele_sale from var_nhan_su
    let nhanSuMap = new Map<number, string>()
    const allNhanSuIds = [...new Set([...nguoiTaoIds, ...teleSaleIds])]
    if (allNhanSuIds.length > 0) {
      const { data: nhanSuData } = await supabase
        .from("var_nhan_su")
        .select("ma_nhan_vien, ho_ten")
        .in("ma_nhan_vien", allNhanSuIds)
      
      if (nhanSuData) {
        nhanSuMap = new Map(
          nhanSuData.map(ns => [ns.ma_nhan_vien, ns.ho_ten])
        )
      }
    }
    
    // Enrich ten_giai_doan and ma_giai_doan from bb_giai_doan
    let giaiDoanMap = new Map<number, { ten_giai_doan: string; ma_giai_doan: string }>()
    if (giaiDoanIds.length > 0) {
      const { data: giaiDoanData } = await supabase
        .from("bb_giai_doan")
        .select("id, ten_giai_doan, ma_giai_doan")
        .in("id", giaiDoanIds)
      
      if (giaiDoanData) {
        giaiDoanMap = new Map(
          giaiDoanData.map(gd => [gd.id, { ten_giai_doan: gd.ten_giai_doan || "", ma_giai_doan: gd.ma_giai_doan || "" }])
        )
      }
    }
    
    // Enrich ten_trang_thai and ma_trang_thai from bb_trang_thai
    let trangThaiMap = new Map<number, { ten_trang_thai: string; ma_trang_thai: string }>()
    if (trangThaiIds.length > 0) {
      const { data: trangThaiData } = await supabase
        .from("bb_trang_thai")
        .select("id, ten_trang_thai, ma_trang_thai")
        .in("id", trangThaiIds)
      
      if (trangThaiData) {
        trangThaiMap = new Map(
          trangThaiData.map(tt => [tt.id, { ten_trang_thai: tt.ten_trang_thai || "", ma_trang_thai: tt.ma_trang_thai || "" }])
        )
      }
    }

    // Enrich tsn_ten_tinh_thanh from var_tsn_tinh_thanh
    let tsnTinhThanhMap = new Map<number, string>()
    if (tsnTinhThanhIds.length > 0) {
      const { data: tinhThanhData } = await supabase
        .from("var_tsn_tinh_thanh")
        .select("id, ten_tinh_thanh")
        .in("id", tsnTinhThanhIds)
      
      if (tinhThanhData) {
        tsnTinhThanhMap = new Map(
          tinhThanhData.map(tt => [tt.id, tt.ten_tinh_thanh || ""])
        )
      }
    }

    // Enrich tsn_ten_quan_huyen from var_tsn_quan_huyen
    let tsnQuanHuyenMap = new Map<number, string>()
    if (tsnQuanHuyenIds.length > 0) {
      const { data: quanHuyenData } = await supabase
        .from("var_tsn_quan_huyen")
        .select("id, ten_quan_huyen")
        .in("id", tsnQuanHuyenIds)
      
      if (quanHuyenData) {
        tsnQuanHuyenMap = new Map(
          quanHuyenData.map(qh => [qh.id, qh.ten_quan_huyen || ""])
        )
      }
    }

    // Enrich tsn_ten_phuong_xa from var_tsn_phuong_xa
    let tsnPhuongXaMap = new Map<number, string>()
    if (tsnPhuongXaIds.length > 0) {
      const { data: phuongXaData } = await supabase
        .from("var_tsn_phuong_xa")
        .select("id, ten_phuong_xa")
        .in("id", tsnPhuongXaIds)
      
      if (phuongXaData) {
        tsnPhuongXaMap = new Map(
          phuongXaData.map(px => [px.id, px.ten_phuong_xa || ""])
        )
      }
    }

    // Enrich ssn_ten_tinh_thanh from var_ssn_tinh_thanh
    let ssnTinhThanhMap = new Map<number, string>()
    if (ssnTinhThanhIds.length > 0) {
      const { data: tinhThanhData } = await supabase
        .from("var_ssn_tinh_thanh")
        .select("id, ten_tinh_thanh")
        .in("id", ssnTinhThanhIds)
      
      if (tinhThanhData) {
        ssnTinhThanhMap = new Map(
          tinhThanhData.map(tt => [tt.id, tt.ten_tinh_thanh || ""])
        )
      }
    }

    // Enrich ssn_ten_phuong_xa from var_ssn_phuong_xa
    let ssnPhuongXaMap = new Map<number, string>()
    if (ssnPhuongXaIds.length > 0) {
      const { data: phuongXaData } = await supabase
        .from("var_ssn_phuong_xa")
        .select("id, ten_phuong_xa")
        .in("id", ssnPhuongXaIds)
      
      if (phuongXaData) {
        ssnPhuongXaMap = new Map(
          phuongXaData.map(px => [px.id, px.ten_phuong_xa || ""])
        )
      }
    }

      return data.map(item => {
        const giaiDoanInfo = item.giai_doan_id ? giaiDoanMap.get(item.giai_doan_id) : null
        const trangThaiInfo = item.trang_thai_id ? trangThaiMap.get(item.trang_thai_id) : null
        return {
          ...item,
          nguoi_tao_ten: item.nguoi_tao_id ? nhanSuMap.get(item.nguoi_tao_id) || null : null,
          ten_giai_doan: giaiDoanInfo?.ten_giai_doan || null,
          ma_giai_doan: giaiDoanInfo?.ma_giai_doan || null,
          ten_trang_thai: trangThaiInfo?.ten_trang_thai || null,
          ma_trang_thai: trangThaiInfo?.ma_trang_thai || null,
          ten_tele_sale: item.tele_sale_id ? nhanSuMap.get(item.tele_sale_id) || null : null,
          ten_thi_truong: item.thi_truong_id ? nhanSuMap.get(item.thi_truong_id) || null : null,
          tsn_ten_tinh_thanh: item.tsn_tinh_thanh_id ? tsnTinhThanhMap.get(item.tsn_tinh_thanh_id) || null : null,
          tsn_ten_quan_huyen: item.tsn_quan_huyen_id ? tsnQuanHuyenMap.get(item.tsn_quan_huyen_id) || null : null,
          tsn_ten_phuong_xa: item.tsn_phuong_xa_id ? tsnPhuongXaMap.get(item.tsn_phuong_xa_id) || null : null,
          ssn_ten_tinh_thanh: item.ssn_tinh_thanh_id ? ssnTinhThanhMap.get(item.ssn_tinh_thanh_id) || null : null,
          ssn_ten_phuong_xa: item.ssn_phuong_xa_id ? ssnPhuongXaMap.get(item.ssn_phuong_xa_id) || null : null,
        }
      }) as DanhSachKB[]
  }

  /**
   * Get khách buôn by ID
   */
  static async getById(id: number): Promise<DanhSachKB | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      console.error("Lỗi khi tải chi tiết khách buôn:", error)
      throw new Error(error.message)
    }

    if (!data) {
      return null
    }

    // Enrich foreign keys
    let nguoiTaoTen: string | null = null
    if (data.nguoi_tao_id) {
      const { data: nhanSuData } = await supabase
        .from("var_nhan_su")
        .select("ho_ten")
        .eq("ma_nhan_vien", data.nguoi_tao_id)
        .single()
      
      nguoiTaoTen = nhanSuData?.ho_ten || null
    }
    
    let tenGiaiDoan: string | null = null
    let maGiaiDoan: string | null = null
    if (data.giai_doan_id) {
      const { data: giaiDoanData } = await supabase
        .from("bb_giai_doan")
        .select("ten_giai_doan, ma_giai_doan")
        .eq("id", data.giai_doan_id)
        .single()
      
      tenGiaiDoan = giaiDoanData?.ten_giai_doan || null
      maGiaiDoan = giaiDoanData?.ma_giai_doan || null
    }
    
    let tenTrangThai: string | null = null
    let maTrangThai: string | null = null
    if (data.trang_thai_id) {
      const { data: trangThaiData } = await supabase
        .from("bb_trang_thai")
        .select("ten_trang_thai, ma_trang_thai")
        .eq("id", data.trang_thai_id)
        .single()
      
      tenTrangThai = trangThaiData?.ten_trang_thai || null
      maTrangThai = trangThaiData?.ma_trang_thai || null
    }
    
    let tenTeleSale: string | null = null
    if (data.tele_sale_id) {
      const { data: nhanSuData } = await supabase
        .from("var_nhan_su")
        .select("ho_ten")
        .eq("ma_nhan_vien", data.tele_sale_id)
        .single()
      
      tenTeleSale = nhanSuData?.ho_ten || null
    }

    let tenThiTruong: string | null = null
    if (data.thi_truong_id) {
      const { data: nhanSuData } = await supabase
        .from("var_nhan_su")
        .select("ho_ten")
        .eq("ma_nhan_vien", data.thi_truong_id)
        .single()
      
      tenThiTruong = nhanSuData?.ho_ten || null
    }

    let tsnTenTinhThanh: string | null = null
    if (data.tsn_tinh_thanh_id) {
      const { data: tinhThanhData } = await supabase
        .from("var_tsn_tinh_thanh")
        .select("ten_tinh_thanh")
        .eq("id", data.tsn_tinh_thanh_id)
        .single()
      
      tsnTenTinhThanh = tinhThanhData?.ten_tinh_thanh || null
    }

    let tsnTenQuanHuyen: string | null = null
    if (data.tsn_quan_huyen_id) {
      const { data: quanHuyenData } = await supabase
        .from("var_tsn_quan_huyen")
        .select("ten_quan_huyen")
        .eq("id", data.tsn_quan_huyen_id)
        .single()
      
      tsnTenQuanHuyen = quanHuyenData?.ten_quan_huyen || null
    }

    let tsnTenPhuongXa: string | null = null
    if (data.tsn_phuong_xa_id) {
      const { data: phuongXaData } = await supabase
        .from("var_tsn_phuong_xa")
        .select("ten_phuong_xa")
        .eq("id", data.tsn_phuong_xa_id)
        .single()
      
      tsnTenPhuongXa = phuongXaData?.ten_phuong_xa || null
    }

    let ssnTenTinhThanh: string | null = null
    if (data.ssn_tinh_thanh_id) {
      const { data: tinhThanhData } = await supabase
        .from("var_ssn_tinh_thanh")
        .select("ten_tinh_thanh")
        .eq("id", data.ssn_tinh_thanh_id)
        .single()
      
      ssnTenTinhThanh = tinhThanhData?.ten_tinh_thanh || null
    }

    let ssnTenPhuongXa: string | null = null
    if (data.ssn_phuong_xa_id) {
      const { data: phuongXaData } = await supabase
        .from("var_ssn_phuong_xa")
        .select("ten_phuong_xa")
        .eq("id", data.ssn_phuong_xa_id)
        .single()
      
      ssnTenPhuongXa = phuongXaData?.ten_phuong_xa || null
    }

    return {
      ...data,
      nguoi_tao_ten: nguoiTaoTen,
      ten_giai_doan: tenGiaiDoan,
      ma_giai_doan: maGiaiDoan,
      ten_trang_thai: tenTrangThai,
      ma_trang_thai: maTrangThai,
      ten_tele_sale: tenTeleSale,
      ten_thi_truong: tenThiTruong,
      tsn_ten_tinh_thanh: tsnTenTinhThanh,
      tsn_ten_quan_huyen: tsnTenQuanHuyen,
      tsn_ten_phuong_xa: tsnTenPhuongXa,
      ssn_ten_tinh_thanh: ssnTenTinhThanh,
      ssn_ten_phuong_xa: ssnTenPhuongXa,
    } as DanhSachKB
  }

  /**
   * Create new khách buôn
   */
    static async create(input: CreateDanhSachKBInput): Promise<DanhSachKB> {
      // Check for duplicate so_dien_thoai_1
      if (input.so_dien_thoai_1) {
        const { data: existing } = await supabase
          .from(TABLE_NAME)
          .select("id, ten_khach_buon")
          .eq("so_dien_thoai_1", input.so_dien_thoai_1.trim())
          .maybeSingle()

        if (existing) {
          throw new Error(`Số điện thoại "${input.so_dien_thoai_1}" đã tồn tại (Khách buôn: ${existing.ten_khach_buon})`)
        }
      }

      // Sanitize input: convert empty strings to null for optional fields
      const sanitizedInput: any = {
      ma_so: input.ma_so && input.ma_so.trim() !== "" ? input.ma_so.trim() : null,
      ten_khach_buon: input.ten_khach_buon,
      loai_khach: input.loai_khach && input.loai_khach.trim() !== "" ? input.loai_khach.trim() : null,
      nguon: input.nguon && input.nguon.trim() !== "" ? input.nguon.trim() : null,
      nam_thanh_lap: input.nam_thanh_lap ?? null,
      hinh_anh: input.hinh_anh && input.hinh_anh.trim() !== "" ? input.hinh_anh.trim() : null,
      so_dien_thoai_1: input.so_dien_thoai_1,
      so_dien_thoai_2: input.so_dien_thoai_2 && input.so_dien_thoai_2.trim() !== "" ? input.so_dien_thoai_2.trim() : null,
      nhom_nganh: input.nhom_nganh && input.nhom_nganh.trim() !== "" ? input.nhom_nganh.trim() : null,
      link_group_zalo: input.link_group_zalo && input.link_group_zalo.trim() !== "" ? input.link_group_zalo.trim() : null,
      mien: input.mien && input.mien.trim() !== "" ? input.mien.trim() : null,
      tsn_tinh_thanh_id: input.tsn_tinh_thanh_id ?? null,
      tsn_quan_huyen_id: input.tsn_quan_huyen_id ?? null,
      tsn_phuong_xa_id: input.tsn_phuong_xa_id ?? null,
      tsn_so_nha: input.tsn_so_nha && input.tsn_so_nha.trim() !== "" ? input.tsn_so_nha.trim() : null,
      tsn_dia_chi_day_du: input.tsn_dia_chi_day_du && input.tsn_dia_chi_day_du.trim() !== "" ? input.tsn_dia_chi_day_du.trim() : null,
      ssn_tinh_thanh_id: input.ssn_tinh_thanh_id ?? null,
      ssn_phuong_xa_id: input.ssn_phuong_xa_id ?? null,
      ssn_so_nha: input.ssn_so_nha && input.ssn_so_nha.trim() !== "" ? input.ssn_so_nha.trim() : null,
      ssn_dia_chi_day_du: input.ssn_dia_chi_day_du && input.ssn_dia_chi_day_du.trim() !== "" ? input.ssn_dia_chi_day_du.trim() : null,
      dinh_vi_gps: input.dinh_vi_gps && input.dinh_vi_gps.trim() !== "" ? input.dinh_vi_gps.trim() : null,
      giai_doan_id: input.giai_doan_id ?? null,
      trang_thai_id: input.trang_thai_id ?? null,
      tele_sale_id: input.tele_sale_id ?? null,
      thi_truong_id: input.thi_truong_id ?? null,
      quy_mo: input.quy_mo && input.quy_mo.trim() !== "" ? input.quy_mo.trim() : null,
      ghi_chu: input.ghi_chu && input.ghi_chu.trim() !== "" ? input.ghi_chu.trim() : null,
      nguoi_tao_id: input.nguoi_tao_id || null,
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(sanitizedInput)
      .select()
      .single()

    if (error) {
      console.error("Lỗi khi tạo khách buôn:", error)
      throw new Error(error.message)
    }

    if (!data) {
      throw new Error("Không nhận được dữ liệu sau khi tạo khách buôn")
    }

    // Enrich response
    const result = await this.getById(data.id)
    if (!result) {
      throw new Error("Không tìm thấy khách buôn sau khi tạo")
    }
    return result
  }

  /**
   * Update khách buôn
   */
  static async update(id: number, input: UpdateDanhSachKBInput): Promise<DanhSachKB> {
    if (!input || typeof input !== 'object') {
      throw new Error("Input không hợp lệ")
    }
    
    // Sanitize input
    const sanitizedInput: any = {}
    if (input.ma_so !== undefined) sanitizedInput.ma_so = input.ma_so && input.ma_so.trim() !== "" ? input.ma_so.trim() : null
    if (input.ten_khach_buon !== undefined) sanitizedInput.ten_khach_buon = input.ten_khach_buon
    if (input.loai_khach !== undefined) sanitizedInput.loai_khach = input.loai_khach && input.loai_khach.trim() !== "" ? input.loai_khach.trim() : null
    if (input.nguon !== undefined) sanitizedInput.nguon = input.nguon && input.nguon.trim() !== "" ? input.nguon.trim() : null
    if (input.nam_thanh_lap !== undefined) sanitizedInput.nam_thanh_lap = input.nam_thanh_lap ?? null
    if (input.hinh_anh !== undefined) sanitizedInput.hinh_anh = input.hinh_anh && input.hinh_anh.trim() !== "" ? input.hinh_anh.trim() : null
    if (input.so_dien_thoai_1 !== undefined) sanitizedInput.so_dien_thoai_1 = input.so_dien_thoai_1
    if (input.so_dien_thoai_2 !== undefined) sanitizedInput.so_dien_thoai_2 = input.so_dien_thoai_2 && input.so_dien_thoai_2.trim() !== "" ? input.so_dien_thoai_2.trim() : null
    if (input.nhom_nganh !== undefined) sanitizedInput.nhom_nganh = input.nhom_nganh && input.nhom_nganh.trim() !== "" ? input.nhom_nganh.trim() : null
    if (input.link_group_zalo !== undefined) sanitizedInput.link_group_zalo = input.link_group_zalo && input.link_group_zalo.trim() !== "" ? input.link_group_zalo.trim() : null
    if (input.mien !== undefined) sanitizedInput.mien = input.mien && input.mien.trim() !== "" ? input.mien.trim() : null
    if (input.tsn_tinh_thanh_id !== undefined) sanitizedInput.tsn_tinh_thanh_id = input.tsn_tinh_thanh_id ?? null
    if (input.tsn_quan_huyen_id !== undefined) sanitizedInput.tsn_quan_huyen_id = input.tsn_quan_huyen_id ?? null
    if (input.tsn_phuong_xa_id !== undefined) sanitizedInput.tsn_phuong_xa_id = input.tsn_phuong_xa_id ?? null
    if (input.tsn_so_nha !== undefined) sanitizedInput.tsn_so_nha = input.tsn_so_nha && input.tsn_so_nha.trim() !== "" ? input.tsn_so_nha.trim() : null
    if (input.tsn_dia_chi_day_du !== undefined) sanitizedInput.tsn_dia_chi_day_du = input.tsn_dia_chi_day_du && input.tsn_dia_chi_day_du.trim() !== "" ? input.tsn_dia_chi_day_du.trim() : null
    if (input.ssn_tinh_thanh_id !== undefined) sanitizedInput.ssn_tinh_thanh_id = input.ssn_tinh_thanh_id ?? null
    if (input.ssn_phuong_xa_id !== undefined) sanitizedInput.ssn_phuong_xa_id = input.ssn_phuong_xa_id ?? null
    if (input.ssn_so_nha !== undefined) sanitizedInput.ssn_so_nha = input.ssn_so_nha && input.ssn_so_nha.trim() !== "" ? input.ssn_so_nha.trim() : null
    if (input.ssn_dia_chi_day_du !== undefined) sanitizedInput.ssn_dia_chi_day_du = input.ssn_dia_chi_day_du && input.ssn_dia_chi_day_du.trim() !== "" ? input.ssn_dia_chi_day_du.trim() : null
    if (input.dinh_vi_gps !== undefined) sanitizedInput.dinh_vi_gps = input.dinh_vi_gps && input.dinh_vi_gps.trim() !== "" ? input.dinh_vi_gps.trim() : null
    if (input.giai_doan_id !== undefined) sanitizedInput.giai_doan_id = input.giai_doan_id ?? null
    if (input.trang_thai_id !== undefined) sanitizedInput.trang_thai_id = input.trang_thai_id ?? null
    if (input.tele_sale_id !== undefined) sanitizedInput.tele_sale_id = input.tele_sale_id ?? null
    if (input.thi_truong_id !== undefined) sanitizedInput.thi_truong_id = input.thi_truong_id ?? null
    if (input.quy_mo !== undefined) sanitizedInput.quy_mo = input.quy_mo && input.quy_mo.trim() !== "" ? input.quy_mo.trim() : null
    if (input.ghi_chu !== undefined) sanitizedInput.ghi_chu = input.ghi_chu && input.ghi_chu.trim() !== "" ? input.ghi_chu.trim() : null

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(sanitizedInput)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Lỗi khi cập nhật khách buôn:", error)
      throw new Error(error.message)
    }

    if (!data) {
      throw new Error("Không nhận được dữ liệu sau khi cập nhật khách buôn")
    }

    // Enrich response
    const result = await this.getById(id)
    if (!result) {
      throw new Error("Không tìm thấy khách buôn sau khi cập nhật")
    }
    return result
  }

  /**
   * Delete khách buôn
   */
  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Lỗi khi xóa khách buôn:", error)
      throw new Error(error.message)
    }
  }

  /**
   * Batch delete khách buôn
   */
  static async batchDelete(ids: number[]): Promise<void> {
    if (ids.length === 0) return

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .in("id", ids)

    if (error) {
      console.error("Lỗi khi xóa hàng loạt khách buôn:", error)
      throw new Error(error.message)
    }
  }
}

