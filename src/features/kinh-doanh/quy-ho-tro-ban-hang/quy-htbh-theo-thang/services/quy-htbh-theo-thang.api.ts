import { supabase } from "@/lib/supabase"
import { QuyHTBHTheoThang, CreateQuyHTBHTheoThangInput, UpdateQuyHTBHTheoThangInput } from "../schema"

const TABLE_NAME = "htbh_quy_htbh"

/**
 * API service for Quỹ HTBH theo tháng
 * Handles all Supabase operations
 */
export class QuyHTBHTheoThangAPI {
  /**
   * Get all records
   */
  static async getAll(): Promise<QuyHTBHTheoThang[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("tg_tao", { ascending: false })

    if (error) {
      console.error("Lỗi khi tải danh sách quỹ HTBH theo tháng:", error)
      throw new Error(error.message)
    }

    return (data || []) as QuyHTBHTheoThang[]
  }

  /**
   * Get record by ID
   */
  static async getById(id: number): Promise<QuyHTBHTheoThang | null> {
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
      console.error("Lỗi khi tải chi tiết quỹ HTBH theo tháng:", error)
      throw new Error(error.message)
    }

    return data as QuyHTBHTheoThang
  }

  /**
   * Create new record
   */
  static async create(input: CreateQuyHTBHTheoThangInput): Promise<QuyHTBHTheoThang> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(input)
      .select()
      .single()

    if (error) {
      console.error("Lỗi khi tạo quỹ HTBH theo tháng:", error)
      throw new Error(error.message)
    }

    return data as QuyHTBHTheoThang
  }

  /**
   * Update record
   */
  static async update(id: number, input: UpdateQuyHTBHTheoThangInput): Promise<QuyHTBHTheoThang> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(input)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Lỗi khi cập nhật quỹ HTBH theo tháng:", error)
      throw new Error(error.message)
    }

    return data as QuyHTBHTheoThang
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
      console.error("Lỗi khi xóa quỹ HTBH theo tháng:", error)
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
      console.error("Lỗi khi xóa nhiều quỹ HTBH theo tháng:", error)
      throw new Error(error.message)
    }
  }
}

