import { supabase } from "@/lib/supabase"
import { PhieuDeXuatBanHang, CreatePhieuDeXuatBanHangInput, UpdatePhieuDeXuatBanHangInput } from "../schema"

const TABLE_NAME = "htbh_de_xuat_chiet_khau"

/**
 * API service for Phiếu đề xuất bán hàng
 * Handles all Supabase operations
 */
export class PhieuDeXuatBanHangAPI {
  /**
   * Get all records
   */
  static async getAll(): Promise<PhieuDeXuatBanHang[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("tg_tao", { ascending: false })

    if (error) {
      console.error("Lỗi khi tải danh sách phiếu đề xuất bán hàng:", error)
      throw new Error(error.message)
    }

    return (data || []) as PhieuDeXuatBanHang[]
  }

  /**
   * Get record by ID
   */
  static async getById(id: number): Promise<PhieuDeXuatBanHang | null> {
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
      console.error("Lỗi khi tải chi tiết phiếu đề xuất bán hàng:", error)
      throw new Error(error.message)
    }

    return data as PhieuDeXuatBanHang
  }

  /**
   * Create new record
   */
  static async create(input: CreatePhieuDeXuatBanHangInput): Promise<PhieuDeXuatBanHang> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(input)
      .select()
      .single()

    if (error) {
      console.error("Lỗi khi tạo phiếu đề xuất bán hàng:", error)
      throw new Error(error.message)
    }

    return data as PhieuDeXuatBanHang
  }

  /**
   * Update record
   */
  static async update(id: number, input: UpdatePhieuDeXuatBanHangInput): Promise<PhieuDeXuatBanHang> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(input)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Lỗi khi cập nhật phiếu đề xuất bán hàng:", error)
      throw new Error(error.message)
    }

    return data as PhieuDeXuatBanHang
  }

  /**
   * Delete record
   */
  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Lỗi khi xóa phiếu đề xuất bán hàng:", error)
      throw new Error(error.message)
    }
  }

  /**
   * Batch delete records
   */
  static async batchDelete(ids: number[]): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .in("id", ids)

    if (error) {
      console.error("Lỗi khi xóa nhiều phiếu đề xuất bán hàng:", error)
      throw new Error(error.message)
    }
  }
}

