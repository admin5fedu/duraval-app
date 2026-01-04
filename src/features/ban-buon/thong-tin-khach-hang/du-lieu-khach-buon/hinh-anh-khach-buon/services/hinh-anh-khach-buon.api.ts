import { supabase } from "@/lib/supabase"
import type { CreateHinhAnhKhachBuonInput, HinhAnhKhachBuon, UpdateHinhAnhKhachBuonInput } from "../schema"

const TABLE_NAME = "bb_hinh_anh"

/**
 * API service for Hình Ảnh Khách Buôn
 * Handles all Supabase operations with data enrichment
 */
export class HinhAnhKhachBuonAPI {
  /**
   * Get all hình ảnh khách buôn
   */
  static async getAll(): Promise<HinhAnhKhachBuon[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("id", { ascending: true })

    if (error) {
      console.error("Lỗi khi tải danh sách hình ảnh khách buôn:", error)
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
    })) as HinhAnhKhachBuon[]
  }

  /**
   * Get hình ảnh khách buôn by ID
   */
  static async getById(id: number): Promise<HinhAnhKhachBuon | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      console.error("Lỗi khi tải chi tiết hình ảnh khách buôn:", error)
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
    } as HinhAnhKhachBuon
  }

  /**
   * Get hình ảnh khách buôn by khach_buon_id
   */
  static async getByKhachBuonId(khachBuonId: number): Promise<HinhAnhKhachBuon[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("khach_buon_id", khachBuonId)
      .order("id", { ascending: true })

    if (error) {
      console.error("Lỗi khi tải hình ảnh theo khách buôn:", error)
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
    })) as HinhAnhKhachBuon[]
  }

  /**
   * Create new hình ảnh khách buôn
   */
  static async create(input: CreateHinhAnhKhachBuonInput): Promise<HinhAnhKhachBuon> {
    // Sanitize input: hang_muc and hinh_anh are required, others are optional
    const sanitizedInput: any = {
      khach_buon_id: input.khach_buon_id ?? null,
      hang_muc: input.hang_muc && input.hang_muc.trim() !== "" ? input.hang_muc.trim() : "Sản phẩm",
      hinh_anh: input.hinh_anh && input.hinh_anh.trim() !== "" ? input.hinh_anh.trim() : "",
      mo_ta: input.mo_ta && input.mo_ta.trim() !== "" ? input.mo_ta.trim() : null,
      ghi_chu: input.ghi_chu && input.ghi_chu.trim() !== "" ? input.ghi_chu.trim() : null,
      nguoi_tao_id: input.nguoi_tao_id || null,
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(sanitizedInput)
      .select()
      .single()

    if (error) {
      console.error("Lỗi khi tạo hình ảnh khách buôn:", error)
      throw new Error(error.message)
    }

    if (!data) {
      throw new Error("Không nhận được dữ liệu sau khi tạo hình ảnh khách buôn")
    }

    // Enrich response
    const result = await this.getById(data.id)
    if (!result) {
      throw new Error("Không tìm thấy hình ảnh khách buôn sau khi tạo")
    }
    return result
  }

  /**
   * Update hình ảnh khách buôn
   */
  static async update(id: number, input: UpdateHinhAnhKhachBuonInput): Promise<HinhAnhKhachBuon> {
    if (!input || typeof input !== 'object') {
      throw new Error("Input không hợp lệ")
    }
    
    // Sanitize input: convert empty strings to null for optional fields
    const sanitizedInput: any = {}
    
    if (input.khach_buon_id !== undefined) {
      sanitizedInput.khach_buon_id = input.khach_buon_id
    }
    if (input.hang_muc !== undefined) {
      sanitizedInput.hang_muc = input.hang_muc && input.hang_muc.trim() !== "" ? input.hang_muc.trim() : "Sản phẩm"
    }
    if (input.hinh_anh !== undefined) {
      sanitizedInput.hinh_anh = input.hinh_anh && input.hinh_anh.trim() !== "" ? input.hinh_anh.trim() : ""
    }
    if (input.mo_ta !== undefined) {
      sanitizedInput.mo_ta = input.mo_ta && input.mo_ta.trim() !== "" ? input.mo_ta.trim() : null
    }
    if (input.ghi_chu !== undefined) {
      sanitizedInput.ghi_chu = input.ghi_chu && input.ghi_chu.trim() !== "" ? input.ghi_chu.trim() : null
    }

    const { error } = await supabase
      .from(TABLE_NAME)
      .update(sanitizedInput)
      .eq("id", id)

    if (error) {
      console.error("Lỗi khi cập nhật hình ảnh khách buôn:", error)
      throw new Error(error.message)
    }

    // Enrich response
    const result = await this.getById(id)
    if (!result) {
      throw new Error("Không tìm thấy hình ảnh khách buôn sau khi cập nhật")
    }
    return result
  }

  /**
   * Delete hình ảnh khách buôn
   */
  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Lỗi khi xóa hình ảnh khách buôn:", error)
      throw new Error(error.message)
    }
  }

  /**
   * Batch delete hình ảnh khách buôn
   */
  static async batchDelete(ids: number[]): Promise<void> {
    if (ids.length === 0) {
      return
    }

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .in("id", ids)

    if (error) {
      console.error("Lỗi khi xóa hàng loạt hình ảnh khách buôn:", error)
      throw new Error(error.message)
    }
  }
}

