import { supabase } from "@/lib/supabase"
import { ViecHangNgay, CreateViecHangNgayInput, UpdateViecHangNgayInput } from "../schema"

const TABLE_NAME = "cong_viec_viec_hang_ngay"

/**
 * API service for Việc Hàng Ngày
 * Handles all Supabase operations
 */
export class ViecHangNgayAPI {
    /**
     * Get all việc hàng ngày
     */
    static async getAll(): Promise<ViecHangNgay[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("ngay_bao_cao", { ascending: false })
            .order("tg_tao", { ascending: false })
            .range(0, 99999) // Get up to 100k rows

        if (error) {
            console.error("Lỗi khi tải danh sách việc hàng ngày:", error)
            throw new Error(error.message)
        }

        // Ensure IDs are numbers
        const normalizedData = (data || []).map(item => ({
            ...item,
            id: typeof item.id === 'string' ? parseInt(item.id, 10) : item.id,
            ma_nhan_vien: typeof item.ma_nhan_vien === 'string' ? parseInt(item.ma_nhan_vien, 10) : item.ma_nhan_vien,
            phong_ban_id: item.phong_ban_id && typeof item.phong_ban_id === 'string' 
                ? parseInt(item.phong_ban_id, 10) 
                : item.phong_ban_id,
        })) as ViecHangNgay[]

        return normalizedData
    }

    /**
     * Get việc hàng ngày by ID
     */
    static async getById(id: number): Promise<ViecHangNgay | null> {
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
            console.error("Lỗi khi tải chi tiết việc hàng ngày:", error)
            throw new Error(error.message)
        }

        // Normalize IDs
        if (data) {
            return {
                ...data,
                id: typeof data.id === 'string' ? parseInt(data.id, 10) : data.id,
                ma_nhan_vien: typeof data.ma_nhan_vien === 'string' ? parseInt(data.ma_nhan_vien, 10) : data.ma_nhan_vien,
                phong_ban_id: data.phong_ban_id && typeof data.phong_ban_id === 'string'
                    ? parseInt(data.phong_ban_id, 10)
                    : data.phong_ban_id,
            } as ViecHangNgay
        }

        return null
    }

    /**
     * Check if a report already exists for the given employee and date
     */
    static async checkDuplicateReport(ma_nhan_vien: number, ngay_bao_cao: string, excludeId?: number): Promise<{ exists: boolean; data: ViecHangNgay | null }> {
        let query = supabase
            .from(TABLE_NAME)
            .select("id, ma_nhan_vien, ngay_bao_cao")
            .eq("ma_nhan_vien", ma_nhan_vien)
            .eq("ngay_bao_cao", ngay_bao_cao)

        // Exclude current record when editing
        if (excludeId) {
            query = query.neq("id", excludeId)
        }

        const { data, error } = await query

        if (error) {
            console.error("Lỗi khi kiểm tra báo cáo trùng:", error)
            return { exists: false, data: null }
        }

        return { exists: (data && data.length > 0) || false, data: data?.[0] || null }
    }

    /**
     * Create new việc hàng ngày
     */
    static async create(input: CreateViecHangNgayInput): Promise<ViecHangNgay> {
        // Check for duplicate before inserting
        const duplicateCheck = await this.checkDuplicateReport(
            input.ma_nhan_vien,
            input.ngay_bao_cao as string
        )
        if (duplicateCheck.exists) {
            throw new Error(
                `Nhân viên ${input.ma_nhan_vien} đã có báo cáo cho ngày ${input.ngay_bao_cao}. Mỗi nhân viên chỉ được tạo 1 báo cáo cho 1 ngày.`
            )
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert([input])
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo việc hàng ngày:", error)
            throw new Error(error.message)
        }

        // Normalize IDs
        return {
            ...data,
            id: typeof data.id === 'string' ? parseInt(data.id, 10) : data.id,
            ma_nhan_vien: typeof data.ma_nhan_vien === 'string' ? parseInt(data.ma_nhan_vien, 10) : data.ma_nhan_vien,
            phong_ban_id: data.phong_ban_id && typeof data.phong_ban_id === 'string'
                ? parseInt(data.phong_ban_id, 10)
                : data.phong_ban_id,
        } as ViecHangNgay
    }

    /**
     * Update việc hàng ngày
     */
    static async update(id: number, input: UpdateViecHangNgayInput): Promise<ViecHangNgay> {
        // Check for duplicate if ma_nhan_vien or ngay_bao_cao is being updated
        if (input.ma_nhan_vien && input.ngay_bao_cao) {
            const duplicateCheck = await this.checkDuplicateReport(
                input.ma_nhan_vien,
                input.ngay_bao_cao as string,
                id
            )
            if (duplicateCheck.exists) {
                throw new Error(
                    `Nhân viên ${input.ma_nhan_vien} đã có báo cáo cho ngày ${input.ngay_bao_cao}. Mỗi nhân viên chỉ được tạo 1 báo cáo cho 1 ngày.`
                )
            }
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(input)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật việc hàng ngày:", error)
            throw new Error(error.message)
        }

        // Normalize IDs
        return {
            ...data,
            id: typeof data.id === 'string' ? parseInt(data.id, 10) : data.id,
            ma_nhan_vien: typeof data.ma_nhan_vien === 'string' ? parseInt(data.ma_nhan_vien, 10) : data.ma_nhan_vien,
            phong_ban_id: data.phong_ban_id && typeof data.phong_ban_id === 'string'
                ? parseInt(data.phong_ban_id, 10)
                : data.phong_ban_id,
        } as ViecHangNgay
    }

    /**
     * Delete việc hàng ngày
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa việc hàng ngày:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete việc hàng ngày
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt việc hàng ngày:", error)
            throw new Error(error.message)
        }
    }
}

