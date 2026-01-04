import { supabase } from "@/lib/supabase"
import { fetchAllRecursive, fetchPaginated, searchRecords, type PaginationResult } from "@/lib/supabase-utils"
import type { ColumnFiltersState } from "@tanstack/react-table"
import { TinhThanhTSN, CreateTinhThanhTSNInput, UpdateTinhThanhTSNInput } from "../schema"

const TABLE_NAME = "var_tsn_tinh_thanh"

/**
 * API service for Tỉnh thành TSN
 * Handles all Supabase operations
 */
export class TinhThanhTSNAPI {
    /**
     * Get all tỉnh thành TSN (recursive fetch - bypasses 1000 row limit)
     * Use this for reference data (dropdowns, selects) when you need all records
     */
    static async getAll(): Promise<TinhThanhTSN[]> {
        try {
            const query = supabase
                .from(TABLE_NAME)
                .select("*")
                .order("tg_tao", { ascending: false })
            
            return await fetchAllRecursive<TinhThanhTSN>(query as any)
        } catch (error) {
            console.error("Lỗi khi tải danh sách tỉnh thành TSN:", error)
            throw error instanceof Error ? error : new Error("Failed to fetch tỉnh thành TSN")
        }
    }

    /**
     * Get paginated tỉnh thành TSN (for server-side pagination in list views)
     * @param page - Page number (1-indexed)
     * @param pageSize - Number of records per page
     * @param filters - Optional column filters to apply (server-side filtering)
     * @returns Pagination result with data and metadata
     */
    static async getPaginated(
        page: number = 1, 
        pageSize: number = 50,
        filters?: ColumnFiltersState
    ): Promise<PaginationResult<TinhThanhTSN>> {
        try {
            const query = supabase
                .from(TABLE_NAME)
                .select("*", { count: "exact" })
                .order("tg_tao", { ascending: false })
            
            // Filters are applied inside fetchPaginated
            return await fetchPaginated<TinhThanhTSN>(query as any, page, pageSize, filters)
        } catch (error) {
            console.error("Lỗi khi tải danh sách phân trang tỉnh thành TSN:", error)
            throw error instanceof Error ? error : new Error("Failed to fetch paginated tỉnh thành TSN")
        }
    }

    /**
     * Search tỉnh thành TSN (for async select/dropdown and server-side search)
     * @param searchTerm - Search term
     * @param page - Page number (1-indexed)
     * @param pageSize - Number of records per page
     * @param filters - Optional: Additional column filters (server-side filtering)
     * @returns Pagination result with filtered data
     */
    static async search(
        searchTerm: string,
        page: number = 1,
        pageSize: number = 20,
        filters?: ColumnFiltersState
    ): Promise<PaginationResult<TinhThanhTSN>> {
        try {
            const query = supabase
                .from(TABLE_NAME)
                .select("*", { count: "exact" })
                .order("ten_tinh_thanh", { ascending: true })
            
            // Search across multiple fields: ten_tinh_thanh, ma_tinh_thanh
            // Filters are applied inside searchRecords
            return await searchRecords<TinhThanhTSN>(
                query as any, 
                searchTerm, 
                ["ten_tinh_thanh", "ma_tinh_thanh"], 
                page, 
                pageSize,
                filters
            )
        } catch (error) {
            console.error("Lỗi khi tìm kiếm tỉnh thành TSN:", error)
            throw error instanceof Error ? error : new Error("Failed to search tỉnh thành TSN")
        }
    }

    /**
     * Get tỉnh thành TSN by ID
     */
    static async getById(id: number): Promise<TinhThanhTSN | null> {
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
            console.error("Lỗi khi tải chi tiết tỉnh thành TSN:", error)
            throw new Error(error.message)
        }

        if (!data) {
            return null
        }

        return data as TinhThanhTSN
    }

    /**
     * Create new tỉnh thành TSN
     */
    static async create(input: CreateTinhThanhTSNInput): Promise<TinhThanhTSN> {
        // Sanitize input: convert empty strings to null for optional fields
        const sanitizedInput = {
            ...input,
            mien: input.mien && input.mien.trim() !== "" ? input.mien : null,
            vung: input.vung && input.vung.trim() !== "" ? input.vung : null,
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(sanitizedInput)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo tỉnh thành TSN:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi tạo tỉnh thành TSN")
        }

        return data as TinhThanhTSN
    }

    /**
     * Update tỉnh thành TSN
     */
    static async update(id: number, input: UpdateTinhThanhTSNInput): Promise<TinhThanhTSN> {
        // Validate input
        if (!input || typeof input !== 'object') {
            throw new Error("Input không hợp lệ")
        }
        
        // Sanitize input: convert empty strings to null for optional fields
        const sanitizedInput: UpdateTinhThanhTSNInput = {}
        if (input.ma_tinh_thanh !== undefined) sanitizedInput.ma_tinh_thanh = input.ma_tinh_thanh
        if (input.ten_tinh_thanh !== undefined) sanitizedInput.ten_tinh_thanh = input.ten_tinh_thanh
        if (input.mien !== undefined) {
            sanitizedInput.mien = input.mien && input.mien.trim() !== "" ? input.mien : undefined
        }
        if (input.vung !== undefined) {
            sanitizedInput.vung = input.vung && input.vung.trim() !== "" ? input.vung : undefined
        }
        if (input.tg_cap_nhat !== undefined) sanitizedInput.tg_cap_nhat = input.tg_cap_nhat

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(sanitizedInput)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật tỉnh thành TSN:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi cập nhật tỉnh thành TSN")
        }

        return data as TinhThanhTSN
    }

    /**
     * Delete tỉnh thành TSN
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa tỉnh thành TSN:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete tỉnh thành TSN
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt tỉnh thành TSN:", error)
            throw new Error(error.message)
        }
    }
}

