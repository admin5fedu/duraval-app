import { supabase } from "@/lib/supabase"
import type { CreateNguoiLienHeInput, NguoiLienHe, UpdateNguoiLienHeInput } from "../schema"

const TABLE_NAME = "bb_lien_he"

/**
 * API service for Người Liên Hệ
 * Handles all Supabase operations with data enrichment
 */
export class NguoiLienHeAPI {
  /**
   * Get all người liên hệ
   */
  static async getAll(): Promise<NguoiLienHe[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("id", { ascending: true })

    if (error) {
      console.error("Lỗi khi tải danh sách người liên hệ:", error)
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      return []
    }

    // Batch enrich ten_khach_buon from bb_khach_buon
    const khachBuonIds = [...new Set(data.map(item => item.khach_buon_id).filter(Boolean) as number[])]
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

    return data.map(item => ({
      ...item,
      ten_khach_buon: item.khach_buon_id ? khachBuonMap.get(item.khach_buon_id) || null : null,
    })) as NguoiLienHe[]
  }

  /**
   * Get người liên hệ by ID
   */
  static async getById(id: number): Promise<NguoiLienHe | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      console.error("Lỗi khi tải chi tiết người liên hệ:", error)
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

    return {
      ...data,
      ten_khach_buon: tenKhachBuon,
    } as NguoiLienHe
  }

  /**
   * Get người liên hệ by khach_buon_id
   */
  static async getByKhachBuonId(khachBuonId: number): Promise<NguoiLienHe[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("khach_buon_id", khachBuonId)
      .order("id", { ascending: true })

    if (error) {
      console.error("Lỗi khi tải người liên hệ theo khách buôn:", error)
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      return []
    }

    // Enrich ten_khach_buon
    const { data: khachBuonData } = await supabase
      .from("bb_khach_buon")
      .select("ten_khach_buon")
      .eq("id", khachBuonId)
      .single()
    
    const tenKhachBuon = khachBuonData?.ten_khach_buon || null

    return data.map(item => ({
      ...item,
      ten_khach_buon: tenKhachBuon,
    })) as NguoiLienHe[]
  }

  /**
   * Create new người liên hệ
   */
  static async create(input: CreateNguoiLienHeInput): Promise<NguoiLienHe> {
    // Check for duplicate so_dien_thoai_1 if provided
    if (input.so_dien_thoai_1 && input.so_dien_thoai_1.trim()) {
      const { data: existing } = await supabase
        .from(TABLE_NAME)
        .select("id, ten_lien_he")
        .eq("so_dien_thoai_1", input.so_dien_thoai_1.trim())
        .maybeSingle()

      if (existing) {
        throw new Error(`Số điện thoại "${input.so_dien_thoai_1}" đã tồn tại (Người liên hệ: ${existing.ten_lien_he || `ID ${existing.id}`})`)
      }
    }

    // Sanitize input: convert empty strings to null for optional fields
    const sanitizedInput: any = {
      khach_buon_id: input.khach_buon_id ?? null,
      vai_tro: input.vai_tro && input.vai_tro.trim() !== "" ? input.vai_tro.trim() : null,
      ten_lien_he: input.ten_lien_he && input.ten_lien_he.trim() !== "" ? input.ten_lien_he.trim() : null,
      hinh_anh: input.hinh_anh && input.hinh_anh.trim() !== "" ? input.hinh_anh.trim() : null,
      gioi_tinh: input.gioi_tinh && input.gioi_tinh.trim() !== "" ? input.gioi_tinh.trim() : null,
      ngay_sinh: input.ngay_sinh && input.ngay_sinh.trim() !== "" ? input.ngay_sinh.trim() : null,
      so_dien_thoai_1: input.so_dien_thoai_1 && input.so_dien_thoai_1.trim() !== "" ? input.so_dien_thoai_1.trim() : null,
      so_dien_thoai_2: input.so_dien_thoai_2 && input.so_dien_thoai_2.trim() !== "" ? input.so_dien_thoai_2.trim() : null,
      email: input.email && input.email.trim() !== "" ? input.email.trim() : null,
      tinh_cach: input.tinh_cach && input.tinh_cach.trim() !== "" ? input.tinh_cach.trim() : null,
      so_thich: input.so_thich && input.so_thich.trim() !== "" ? input.so_thich.trim() : null,
      luu_y_khi_lam_viec: input.luu_y_khi_lam_viec && input.luu_y_khi_lam_viec.trim() !== "" ? input.luu_y_khi_lam_viec.trim() : null,
      ghi_chu_khac: input.ghi_chu_khac && input.ghi_chu_khac.trim() !== "" ? input.ghi_chu_khac.trim() : null,
      nguoi_tao_id: input.nguoi_tao_id || null,
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(sanitizedInput)
      .select()
      .single()

    if (error) {
      console.error("Lỗi khi tạo người liên hệ:", error)
      throw new Error(error.message)
    }

    if (!data) {
      throw new Error("Không nhận được dữ liệu sau khi tạo người liên hệ")
    }

    // Enrich response
    const result = await this.getById(data.id)
    if (!result) {
      throw new Error("Không tìm thấy người liên hệ sau khi tạo")
    }
    return result
  }

  /**
   * Update người liên hệ
   */
  static async update(id: number, input: UpdateNguoiLienHeInput): Promise<NguoiLienHe> {
    if (!input || typeof input !== 'object') {
      throw new Error("Input không hợp lệ")
    }
    
    // Check for duplicate so_dien_thoai_1 if provided
    if (input.so_dien_thoai_1 !== undefined && input.so_dien_thoai_1 && input.so_dien_thoai_1.trim()) {
      const { data: existing } = await supabase
        .from(TABLE_NAME)
        .select("id, ten_lien_he")
        .eq("so_dien_thoai_1", input.so_dien_thoai_1.trim())
        .neq("id", id)
        .maybeSingle()

      if (existing) {
        throw new Error(`Số điện thoại "${input.so_dien_thoai_1}" đã tồn tại (Người liên hệ: ${existing.ten_lien_he || `ID ${existing.id}`})`)
      }
    }
    
    // Sanitize input
    const sanitizedInput: any = {}
    if (input.khach_buon_id !== undefined) sanitizedInput.khach_buon_id = input.khach_buon_id ?? null
    if (input.vai_tro !== undefined) sanitizedInput.vai_tro = input.vai_tro && input.vai_tro.trim() !== "" ? input.vai_tro.trim() : null
    if (input.ten_lien_he !== undefined) sanitizedInput.ten_lien_he = input.ten_lien_he && input.ten_lien_he.trim() !== "" ? input.ten_lien_he.trim() : null
    if (input.hinh_anh !== undefined) sanitizedInput.hinh_anh = input.hinh_anh && input.hinh_anh.trim() !== "" ? input.hinh_anh.trim() : null
    if (input.gioi_tinh !== undefined) sanitizedInput.gioi_tinh = input.gioi_tinh && input.gioi_tinh.trim() !== "" ? input.gioi_tinh.trim() : null
    if (input.ngay_sinh !== undefined) sanitizedInput.ngay_sinh = input.ngay_sinh && input.ngay_sinh.trim() !== "" ? input.ngay_sinh.trim() : null
    if (input.so_dien_thoai_1 !== undefined) sanitizedInput.so_dien_thoai_1 = input.so_dien_thoai_1 && input.so_dien_thoai_1.trim() !== "" ? input.so_dien_thoai_1.trim() : null
    if (input.so_dien_thoai_2 !== undefined) sanitizedInput.so_dien_thoai_2 = input.so_dien_thoai_2 && input.so_dien_thoai_2.trim() !== "" ? input.so_dien_thoai_2.trim() : null
    if (input.email !== undefined) sanitizedInput.email = input.email && input.email.trim() !== "" ? input.email.trim() : null
    if (input.tinh_cach !== undefined) sanitizedInput.tinh_cach = input.tinh_cach && input.tinh_cach.trim() !== "" ? input.tinh_cach.trim() : null
    if (input.so_thich !== undefined) sanitizedInput.so_thich = input.so_thich && input.so_thich.trim() !== "" ? input.so_thich.trim() : null
    if (input.luu_y_khi_lam_viec !== undefined) sanitizedInput.luu_y_khi_lam_viec = input.luu_y_khi_lam_viec && input.luu_y_khi_lam_viec.trim() !== "" ? input.luu_y_khi_lam_viec.trim() : null
    if (input.ghi_chu_khac !== undefined) sanitizedInput.ghi_chu_khac = input.ghi_chu_khac && input.ghi_chu_khac.trim() !== "" ? input.ghi_chu_khac.trim() : null

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(sanitizedInput)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Lỗi khi cập nhật người liên hệ:", error)
      throw new Error(error.message)
    }

    if (!data) {
      throw new Error("Không nhận được dữ liệu sau khi cập nhật người liên hệ")
    }

    // Enrich response
    const result = await this.getById(id)
    if (!result) {
      throw new Error("Không tìm thấy người liên hệ sau khi cập nhật")
    }
    return result
  }

  /**
   * Delete người liên hệ
   */
  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Lỗi khi xóa người liên hệ:", error)
      throw new Error(error.message)
    }
  }

  /**
   * Batch delete người liên hệ
   */
  static async batchDelete(ids: number[]): Promise<void> {
    if (ids.length === 0) return

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .in("id", ids)

    if (error) {
      console.error("Lỗi khi xóa hàng loạt người liên hệ:", error)
      throw new Error(error.message)
    }
  }
}

