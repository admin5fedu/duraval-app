import { supabase } from "@/lib/supabase"
import { fetchAllRecursive, fetchPaginated, searchRecords, type PaginationResult } from "@/lib/supabase-utils"
import type { ColumnFiltersState } from "@tanstack/react-table"
import { PhuongXaSNN, CreatePhuongXaSNNInput, UpdatePhuongXaSNNInput } from "../schema"

const TABLE_NAME = "var_ssn_phuong_xa"

/**
 * API service for Phường Xã SNN
 * Handles all Supabase operations
 */
export class PhuongXaSNNAPI {
    /**
     * Get all phường xã SNN (recursive fetch - bypasses 1000 row limit)
     * Use this for reference data (dropdowns, selects) when you need all records
     */
    static async getAll(): Promise<PhuongXaSNN[]> {
        try {
            const query = supabase
                .from(TABLE_NAME)
                .select("*")
                .order("tg_tao", { ascending: false })
            
            return await fetchAllRecursive<PhuongXaSNN>(query as any)
        } catch (error) {
            console.error("Lỗi khi tải danh sách phường xã SNN:", error)
            throw error instanceof Error ? error : new Error("Failed to fetch phường xã SNN")
        }
    }

    /**
     * Get paginated phường xã SNN (for server-side pagination in list views)
     * @param page - Page number (1-indexed)
     * @param pageSize - Number of records per page
     * @param filters - Optional column filters to apply (server-side filtering)
     * @returns Pagination result with data and metadata
     */
    static async getPaginated(
        page: number = 1, 
        pageSize: number = 50,
        filters?: ColumnFiltersState
    ): Promise<PaginationResult<PhuongXaSNN>> {
        try {
            const query = supabase
                .from(TABLE_NAME)
                .select("*", { count: "exact" })
                .order("tg_tao", { ascending: false })
            
            // Filters are applied inside fetchPaginated
            return await fetchPaginated<PhuongXaSNN>(query as any, page, pageSize, filters)
        } catch (error) {
            console.error("Lỗi khi tải danh sách phân trang phường xã SNN:", error)
            throw error instanceof Error ? error : new Error("Failed to fetch paginated phường xã SNN")
        }
    }

    /**
     * Search phường xã SNN (for async select/dropdown and server-side search)
     * @param searchTerm - Search term
     * @param page - Page number (1-indexed)
     * @param pageSize - Number of records per page
     * @param tinhThanhId - Optional: Filter by tỉnh thành ID (for cascade selects)
     * @param filters - Optional: Additional column filters (server-side filtering)
     * @returns Pagination result with filtered data
     */
    static async search(
        searchTerm: string,
        page: number = 1,
        pageSize: number = 20,
        tinhThanhId?: number | null,
        filters?: ColumnFiltersState
    ): Promise<PaginationResult<PhuongXaSNN>> {
        try {
            const query = supabase
                .from(TABLE_NAME)
                .select("*", { count: "exact" })
                .order("ten_phuong_xa", { ascending: true })
            
            // Combine tinhThanhId filter with other filters
            const combinedFilters: ColumnFiltersState = [...(filters || [])]
            if (tinhThanhId) {
                // Add tinhThanhId to filters if not already present
                const hasTinhThanhFilter = combinedFilters.some(f => f.id === 'tinh_thanh_id')
                if (!hasTinhThanhFilter) {
                    combinedFilters.push({ id: 'tinh_thanh_id', value: tinhThanhId })
                }
            }
            
            // Search across multiple fields: ten_phuong_xa, ma_phuong_xa
            // Filters are applied inside searchRecords
            return await searchRecords<PhuongXaSNN>(
                query as any, 
                searchTerm, 
                ["ten_phuong_xa", "ma_phuong_xa"], 
                page, 
                pageSize,
                combinedFilters.length > 0 ? combinedFilters : undefined
            )
        } catch (error) {
            console.error("Lỗi khi tìm kiếm phường xã SNN:", error)
            throw error instanceof Error ? error : new Error("Failed to search phường xã SNN")
        }
    }

    /**
     * Get phường xã SNN by ID
     */
    static async getById(id: number): Promise<PhuongXaSNN | null> {
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
            console.error("Lỗi khi tải chi tiết phường xã SNN:", error)
            throw new Error(error.message)
        }

        if (!data) {
            return null
        }

        return data as PhuongXaSNN
    }

    /**
     * Create new phường xã SNN
     */
    static async create(input: CreatePhuongXaSNNInput): Promise<PhuongXaSNN> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(input)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo phường xã SNN:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi tạo phường xã SNN")
        }

        return data as PhuongXaSNN
    }

    /**
     * Update phường xã SNN
     */
    static async update(id: number, input: UpdatePhuongXaSNNInput): Promise<PhuongXaSNN> {
        // Validate input
        if (!input || typeof input !== 'object') {
            throw new Error("Input không hợp lệ")
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(input)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật phường xã SNN:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi cập nhật phường xã SNN")
        }

        return data as PhuongXaSNN
    }

    /**
     * Delete phường xã SNN
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa phường xã SNN:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete phường xã SNN
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt phường xã SNN:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Get all phường xã SNN by tỉnh thành ID (for embedded lists in detail views)
     * @param tinhThanhId - The ID of the parent tỉnh thành
     * @returns Array of PhuongXaSNN records
     */
    static async getByTinhThanhId(tinhThanhId: number): Promise<PhuongXaSNN[]> {
        try {
            const query = supabase
                .from(TABLE_NAME)
                .select("*")
                .eq("tinh_thanh_id", tinhThanhId)
                .order("ten_phuong_xa", { ascending: true })

            return await fetchAllRecursive<PhuongXaSNN>(query as any)
        } catch (error) {
            console.error(`Lỗi khi tải danh sách phường xã SNN cho tỉnh thành ID ${tinhThanhId}:`, error)
            throw error instanceof Error ? error : new Error("Failed to fetch phường xã SNN by tỉnh thành ID")
        }
    }
}

