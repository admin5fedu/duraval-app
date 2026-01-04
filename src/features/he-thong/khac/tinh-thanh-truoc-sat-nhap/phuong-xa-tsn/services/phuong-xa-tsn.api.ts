import { supabase } from "@/lib/supabase"
import { fetchAllRecursive, fetchPaginated, searchRecords, type PaginationResult } from "@/lib/supabase-utils"
import type { ColumnFiltersState } from "@tanstack/react-table"
import { PhuongXaTSN, CreatePhuongXaTSNInput, UpdatePhuongXaTSNInput } from "../schema"

const TABLE_NAME = "var_tsn_phuong_xa"

/**
 * API service for Phường Xã TSN
 * Handles all Supabase operations
 */
export class PhuongXaTSNAPI {
    /**
     * Get all phường xã TSN (recursive fetch - bypasses 1000 row limit)
     * Use this for reference data (dropdowns, selects) when you need all records
     */
    static async getAll(): Promise<PhuongXaTSN[]> {
        try {
            const query = supabase
            .from(TABLE_NAME)
            .select("*")
            .order("tg_tao", { ascending: false })

            return await fetchAllRecursive<PhuongXaTSN>(query as any)
        } catch (error) {
            console.error("Lỗi khi tải danh sách phường xã TSN:", error)
            throw error instanceof Error ? error : new Error("Failed to fetch phường xã TSN")
        }
    }

    /**
     * Get paginated phường xã TSN (for server-side pagination in list views)
     * @param page - Page number (1-indexed)
     * @param pageSize - Number of records per page
     * @param filters - Optional column filters to apply (server-side filtering)
     * @returns Pagination result with data and metadata
     */
    static async getPaginated(
        page: number = 1, 
        pageSize: number = 50,
        filters?: ColumnFiltersState
    ): Promise<PaginationResult<PhuongXaTSN>> {
        try {
            const query = supabase
                .from(TABLE_NAME)
                .select("*", { count: "exact" })
                .order("tg_tao", { ascending: false })
            
            // Filters are applied inside fetchPaginated
            return await fetchPaginated<PhuongXaTSN>(query as any, page, pageSize, filters)
        } catch (error) {
            console.error("Lỗi khi tải danh sách phân trang phường xã TSN:", error)
            throw error instanceof Error ? error : new Error("Failed to fetch paginated phường xã TSN")
        }
    }

    /**
     * Search phường xã TSN (for async select/dropdown and server-side search)
     * @param searchTerm - Search term
     * @param page - Page number (1-indexed)
     * @param pageSize - Number of records per page
     * @param quanHuyenId - Optional: Filter by quận huyện ID (for cascade selects)
     * @param filters - Optional: Additional column filters (server-side filtering)
     * @returns Pagination result with filtered data
     */
    static async search(
        searchTerm: string,
        page: number = 1,
        pageSize: number = 20,
        quanHuyenId?: number | null,
        filters?: ColumnFiltersState
    ): Promise<PaginationResult<PhuongXaTSN>> {
        try {
            const query = supabase
                .from(TABLE_NAME)
                .select("*", { count: "exact" })
                .order("ten_phuong_xa", { ascending: true })
            
            // Combine quanHuyenId filter with other filters
            const combinedFilters: ColumnFiltersState = [...(filters || [])]
            if (quanHuyenId) {
                // Add quanHuyenId to filters if not already present
                const hasQuanHuyenFilter = combinedFilters.some(f => f.id === 'quan_huyen_id')
                if (!hasQuanHuyenFilter) {
                    combinedFilters.push({ id: 'quan_huyen_id', value: quanHuyenId })
                }
            }
            
            // Search across multiple fields: ten_phuong_xa, ma_phuong_xa
            // Filters are applied inside searchRecords
            return await searchRecords<PhuongXaTSN>(
                query as any, 
                searchTerm, 
                ["ten_phuong_xa", "ma_phuong_xa"], 
                page, 
                pageSize,
                combinedFilters.length > 0 ? combinedFilters : undefined
            )
        } catch (error) {
            console.error("Lỗi khi tìm kiếm phường xã TSN:", error)
            throw error instanceof Error ? error : new Error("Failed to search phường xã TSN")
        }
    }

    /**
     * Get phường xã TSN by ID
     */
    static async getById(id: number): Promise<PhuongXaTSN | null> {
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
            console.error("Lỗi khi tải chi tiết phường xã TSN:", error)
            throw new Error(error.message)
        }

        if (!data) {
            return null
        }

        return data as PhuongXaTSN
    }

    /**
     * Create new phường xã TSN
     */
    static async create(input: CreatePhuongXaTSNInput): Promise<PhuongXaTSN> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(input)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo phường xã TSN:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi tạo phường xã TSN")
        }

        return data as PhuongXaTSN
    }

    /**
     * Update phường xã TSN
     */
    static async update(id: number, input: UpdatePhuongXaTSNInput): Promise<PhuongXaTSN> {
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
            console.error("Lỗi khi cập nhật phường xã TSN:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi cập nhật phường xã TSN")
        }

        return data as PhuongXaTSN
    }

    /**
     * Delete phường xã TSN
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa phường xã TSN:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete phường xã TSN
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt phường xã TSN:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Get all phường xã TSN by quận huyện ID (for embedded lists in detail views)
     * @param quanHuyenId - The ID of the parent quận huyện
     * @returns Array of PhuongXaTSN records
     */
    static async getByQuanHuyenId(quanHuyenId: number): Promise<PhuongXaTSN[]> {
        try {
            const query = supabase
                .from(TABLE_NAME)
                .select("*")
                .eq("quan_huyen_id", quanHuyenId)
                .order("ten_phuong_xa", { ascending: true })

            return await fetchAllRecursive<PhuongXaTSN>(query as any)
        } catch (error) {
            console.error(`Lỗi khi tải danh sách phường xã TSN cho quận huyện ID ${quanHuyenId}:`, error)
            throw error instanceof Error ? error : new Error("Failed to fetch phường xã TSN by quận huyện ID")
        }
    }
}

