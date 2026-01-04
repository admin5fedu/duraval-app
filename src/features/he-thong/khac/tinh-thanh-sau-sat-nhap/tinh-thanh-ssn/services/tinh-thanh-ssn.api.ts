import { supabase } from "@/lib/supabase"
import { fetchAllRecursive, fetchPaginated, searchRecords, type PaginationResult } from "@/lib/supabase-utils"
import type { ColumnFiltersState } from "@tanstack/react-table"
import { TinhThanhSSN, CreateTinhThanhSSNInput, UpdateTinhThanhSSNInput } from "../schema"

const TABLE_NAME = "var_ssn_tinh_thanh"

/**
 * API service for Tỉnh thành SSN
 * Handles all Supabase operations
 */
export class TinhThanhSSNAPI {
    /**
     * Get all tỉnh thành SSN (recursive fetch - bypasses 1000 row limit)
     * Use this for reference data (dropdowns, selects) when you need all records
     */
    static async getAll(): Promise<TinhThanhSSN[]> {
        try {
            const query = supabase
                .from(TABLE_NAME)
                .select("*")
                .order("tg_tao", { ascending: false })
            
            return await fetchAllRecursive<TinhThanhSSN>(query as any)
        } catch (error) {
            console.error("Lỗi khi tải danh sách tỉnh thành SSN:", error)
            throw error instanceof Error ? error : new Error("Failed to fetch tỉnh thành SSN")
        }
    }

    /**
     * Get paginated tỉnh thành SSN (for server-side pagination in list views)
     * @param page - Page number (1-indexed)
     * @param pageSize - Number of records per page
     * @param filters - Optional column filters to apply (server-side filtering)
     * @returns Pagination result with data and metadata
     */
    static async getPaginated(
        page: number = 1, 
        pageSize: number = 50,
        filters?: ColumnFiltersState
    ): Promise<PaginationResult<TinhThanhSSN>> {
        try {
            const query = supabase
                .from(TABLE_NAME)
                .select("*", { count: "exact" })
                .order("tg_tao", { ascending: false })
            
            // Filters are applied inside fetchPaginated
            return await fetchPaginated<TinhThanhSSN>(query as any, page, pageSize, filters)
        } catch (error) {
            console.error("Lỗi khi tải danh sách phân trang tỉnh thành SSN:", error)
            throw error instanceof Error ? error : new Error("Failed to fetch paginated tỉnh thành SSN")
        }
    }

    /**
     * Search tỉnh thành SSN (for async select/dropdown and server-side search)
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
    ): Promise<PaginationResult<TinhThanhSSN>> {
        try {
            const query = supabase
                .from(TABLE_NAME)
                .select("*", { count: "exact" })
                .order("ten_tinh_thanh", { ascending: true })
            
            // Search across multiple fields: ten_tinh_thanh, ma_tinh_thanh
            // Filters are applied inside searchRecords
            return await searchRecords<TinhThanhSSN>(
                query as any, 
                searchTerm, 
                ["ten_tinh_thanh", "ma_tinh_thanh"], 
                page, 
                pageSize,
                filters
            )
        } catch (error) {
            console.error("Lỗi khi tìm kiếm tỉnh thành SSN:", error)
            throw error instanceof Error ? error : new Error("Failed to search tỉnh thành SSN")
        }
    }

    /**
     * Get tỉnh thành SSN by ID
     */
    static async getById(id: number): Promise<TinhThanhSSN | null> {
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
            console.error("Lỗi khi tải chi tiết tỉnh thành SSN:", error)
            throw new Error(error.message)
        }

        if (!data) {
            return null
        }

        return data as TinhThanhSSN
    }

    /**
     * Create new tỉnh thành SSN
     */
    static async create(input: CreateTinhThanhSSNInput): Promise<TinhThanhSSN> {
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
            console.error("Lỗi khi tạo tỉnh thành SSN:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi tạo tỉnh thành SSN")
        }

        return data as TinhThanhSSN
    }

    /**
     * Update tỉnh thành SSN
     */
    static async update(id: number, input: UpdateTinhThanhSSNInput): Promise<TinhThanhSSN> {
        // Validate input
        if (!input || typeof input !== 'object') {
            throw new Error("Input không hợp lệ")
        }
        
        // Sanitize input: convert empty strings to null for optional fields
        const sanitizedInput: UpdateTinhThanhSSNInput = {}
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
            console.error("Lỗi khi cập nhật tỉnh thành SSN:", error)
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không nhận được dữ liệu sau khi cập nhật tỉnh thành SSN")
        }

        return data as TinhThanhSSN
    }

    /**
     * Delete tỉnh thành SSN
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa tỉnh thành SSN:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete tỉnh thành SSN
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt tỉnh thành SSN:", error)
            throw new Error(error.message)
        }
    }
}

