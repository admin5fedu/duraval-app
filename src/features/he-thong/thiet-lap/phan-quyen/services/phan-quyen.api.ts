import { supabase } from "@/lib/supabase"
import { PhanQuyen, CreatePhanQuyenInput, UpdatePhanQuyenInput } from "../schema"

const TABLE_NAME = "var_chia_quyen"

/**
 * API service for Phân Quyền
 * Handles all Supabase operations
 */
export class PhanQuyenAPI {
  /**
   * Get all permissions
   */
  static async getAll(): Promise<PhanQuyen[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("id", { ascending: false })

    if (error) {
      console.error("Lỗi khi tải danh sách phân quyền:", error)
      throw new Error(error.message)
    }

    return (data || []) as PhanQuyen[]
  }

  /**
   * Get permissions by chuc_vu_id
   */
  static async getByChucVuId(chucVuId: number): Promise<PhanQuyen[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("chuc_vu_id", chucVuId)
      .order("module_id", { ascending: true })

    if (error) {
      console.error("Lỗi khi tải phân quyền theo chức vụ:", error)
      throw new Error(error.message)
    }

    return (data || []) as PhanQuyen[]
  }

  /**
   * Get permission by ID
   */
  static async getById(id: number): Promise<PhanQuyen | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      console.error("Lỗi khi tải phân quyền:", error)
      throw new Error(error.message)
    }

    return data as PhanQuyen
  }

  /**
   * Create new permission
   */
  static async create(input: CreatePhanQuyenInput): Promise<PhanQuyen> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([input])
      .select()
      .single()

    if (error) {
      console.error("Lỗi khi tạo phân quyền:", error)
      throw new Error(error.message)
    }

    return data as PhanQuyen
  }

  /**
   * Update permission
   */
  static async update(id: number, input: UpdatePhanQuyenInput): Promise<PhanQuyen> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({
        ...input,
        tg_cap_nhat: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Lỗi khi cập nhật phân quyền:", error)
      throw new Error(error.message)
    }

    return data as PhanQuyen
  }

  /**
   * Delete permission
   */
  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Lỗi khi xóa phân quyền:", error)
      throw new Error(error.message)
    }
  }

  /**
   * Batch upsert permissions (create or update)
   */
  static async batchUpsert(permissions: Array<{ chuc_vu_id: number; module_id: string; quyen: any }>): Promise<PhanQuyen[]> {
    // First, delete existing permissions for the same chuc_vu_id and module_id combinations
    const chucVuIds = [...new Set(permissions.map(p => p.chuc_vu_id))]
    const moduleIds = [...new Set(permissions.map(p => p.module_id))]

    // Delete existing
    const { error: deleteError } = await supabase
      .from(TABLE_NAME)
      .delete()
      .in("chuc_vu_id", chucVuIds)
      .in("module_id", moduleIds)

    if (deleteError) {
      console.error("Lỗi khi xóa phân quyền cũ:", deleteError)
      throw new Error(deleteError.message)
    }

    // Insert new
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(permissions)
      .select()

    if (error) {
      console.error("Lỗi khi tạo phân quyền mới:", error)
      throw new Error(error.message)
    }

    return (data || []) as PhanQuyen[]
  }
}

