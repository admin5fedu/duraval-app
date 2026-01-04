import { supabase } from "@/lib/supabase"
import { fetchAllRecursive, fetchPaginated, searchRecords, type PaginationResult } from "@/lib/supabase-utils"
import type { ColumnFiltersState } from "@tanstack/react-table"
import { QuanHuyenTSN, CreateQuanHuyenTSNInput, UpdateQuanHuyenTSNInput } from "../schema"

const TABLE_NAME = "var_tsn_quan_huyen"

/**
 * API service for Quận huyện TSN
 * Handles all Supabase operations
 */
export class QuanHuyenTSNAPI {
    /**
     * Get all quận huyện TSN (recursive fetch - bypasses 1000 row limit)
     * Use this for reference data (dropdowns, selects) when you need all records
     */
    static async getAll(): Promise<QuanHuyenTSN[]> {
        try {
            const query = supabase
                .from(TABLE_NAME)
                .select("*")
                .order("tg_tao", { ascending: false })
            
            return await fetchAllRecursive<QuanHuyenTSN>(query as any)
        } catch (error) {
            console.error("Lỗi khi tải danh sách quận huyện TSN:", error)
            throw error instanceof Error ? error : new Error("Failed to fetch quận huyện TSN")
        }
    }

    /**
     * Get paginated quận huyện TSN (for server-side pagination in list views)
     * @param page - Page number (1-indexed)
     * @param pageSize - Number of records per page
     * @param filters - Optional column filters to apply (server-side filtering)
     * @returns Pagination result with data and metadata
     */
    static async getPaginated(
        page: number = 1, 
        pageSize: number = 50,
        filters?: ColumnFiltersState
    ): Promise<PaginationResult<QuanHuyenTSN>> {
        try {
            const query = supabase
                .from(TABLE_NAME)
                .select("*", { count: "exact" })
                .order("tg_tao", { ascending: false })
            
            // Filters are applied inside fetchPaginated
            return await fetchPaginated<QuanHuyenTSN>(query as any, page, pageSize, filters)
        } catch (error) {
            console.error("Lỗi khi tải danh sách phân trang quận huyện TSN:", error)
            throw error instanceof Error ? error : new Error("Failed to fetch paginated quận huyện TSN")
        }
    }

    /**
     * Search quận huyện TSN (for async select/dropdown and server-side search)
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
    ): Promise<PaginationResult<QuanHuyenTSN>> {
        try {
            const query = supabase
                .from(TABLE_NAME)
                .select("*", { count: "exact" })
                .order("ten_quan_huyen", { ascending: true })
            
            // Combine tinhThanhId filter with other filters
            const combinedFilters: ColumnFiltersState = [...(filters || [])]
            if (tinhThanhId) {
                // Add tinhThanhId to filters if not already present
                const hasTinhThanhFilter = combinedFilters.some(f => f.id === 'tinh_thanh_id')
                if (!hasTinhThanhFilter) {
                    combinedFilters.push({ id: 'tinh_thanh_id', value: tinhThanhId })
                }
            }
            
            // Search across multiple fields: ten_quan_huyen, ma_quan_huyen
            // Filters are applied inside searchRecords
            return await searchRecords<QuanHuyenTSN>(
                query as any, 
                searchTerm, 
                ["ten_quan_huyen", "ma_quan_huyen"], 
                page, 
                pageSize,
                combinedFilters.length > 0 ? combinedFilters : undefined
            )
        } catch (error) {
            console.error("Lỗi khi tìm kiếm quận huyện TSN:", error)
            throw error instanceof Error ? error : new Error("Failed to search quận huyện TSN")
        }
    }

    /**
     * Get quận huyện TSN by tỉnh thành ID
     * @param tinhThanhId - ID của tỉnh thành
     * @returns List of quận huyện TSN
     */
    static async getByTinhThanhId(tinhThanhId: number): Promise<QuanHuyenTSN[]> {
        try {
            const query = supabase
                .from(TABLE_NAME)
                .select("*")
                .eq("tinh_thanh_id", tinhThanhId)
                .order("ten_quan_huyen", { ascending: true })
            
            return await fetchAllRecursive<QuanHuyenTSN>(query as any)
        } catch (error) {
            console.error("Lỗi khi tải danh sách quận huyện TSN theo tỉnh thành:", error)
            throw error instanceof Error ? error : new Error("Failed to fetch quận huyện TSN by tỉnh thành ID")
        }
    }

    /**
     * Get quận huyện TSN by ID
     */
    static async getById(id: number): Promise<QuanHuyenTSN | null> {
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
            console.error("Lỗi khi tải chi tiết quận huyện TSN:", error)
            throw new Error(error.message)
        }

        if (!data) {
            return null
        }

        return data as QuanHuyenTSN
    }

    /**
     * Create new quận huyện TSN
     */
    static async create(input: CreateQuanHuyenTSNInput): Promise<QuanHuyenTSN> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(input)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo quận huyện TSN:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi tạo quận huyện TSN")
        }

        return data as QuanHuyenTSN
    }

    /**
     * Update quận huyện TSN
     */
    static async update(id: number, input: UpdateQuanHuyenTSNInput): Promise<QuanHuyenTSN> {
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
            console.error("Lỗi khi cập nhật quận huyện TSN:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi cập nhật quận huyện TSN")
        }

        return data as QuanHuyenTSN
    }

    /**
     * Delete quận huyện TSN
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa quận huyện TSN:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete quận huyện TSN
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt quận huyện TSN:", error)
            throw new Error(error.message)
        }
    }
}

