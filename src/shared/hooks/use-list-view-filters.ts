"use client"

import { useState } from "react"
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table"
import { useFiltersStore } from "@/shared/stores/filters-store"

/**
 * Custom hook để quản lý filters cho list views với session storage
 * 
 * ✅ Session Storage Pattern:
 * - Filters KHÔNG persist qua page reload (fresh start)
 * - Filters được maintain khi navigate trong cùng session
 * - Tự động clear khi đóng tab
 * 
 * @example
 * ```tsx
 * // 1. Import hook
 * import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
 * 
 * // 2. Sử dụng trong component
 * export function MyListView() {
 *   const module = "my-module"
 *   const { 
 *     initialFilters, 
 *     initialSearch, 
 *     initialSorting, 
 *     handleFiltersChange, 
 *     handleSearchChange, 
 *     handleSortChange 
 *   } = useListViewFilters(module, [{ id: "id", desc: true }])
 * 
 *   return (
 *     <GenericListView
 *       initialFilters={initialFilters}
 *       initialSearch={initialSearch}
 *       initialSorting={initialSorting}
 *       onFiltersChange={handleFiltersChange}
 *       onSearchChange={handleSearchChange}
 *       onSortChange={handleSortChange}
 *       // ... other props
 *     />
 *   )
 * }
 * ```
 * 
 * @see src/features/he-thong/nhan-su/danh-sach-nhan-su/components/nhan-su-list-view.tsx
 * for a complete example
 */
export function useListViewFilters(module: string, defaultSorting: SortingState = [{ id: "id", desc: true }]) {
    const { setFilter, setSearchQuery, setSortPreference } = useFiltersStore()

    // ✅ Session Storage: Filters are NOT auto-loaded on page reload
    // Filters are only maintained during navigation in the same session
    // This provides a fresh start each time user reloads the page
    const [initialFilters] = useState<ColumnFiltersState>([])
    const [initialSearch] = useState<string>("")
    const [initialSorting] = useState<SortingState>(defaultSorting)

    const handleFiltersChange = (filters: ColumnFiltersState) => {
        // Save filters to store (session storage)
        filters.forEach((filter) => {
            setFilter(module, filter.id, filter.value)
        })
    }

    const handleSearchChange = (search: string) => {
        // Save search query to store (session storage)
        setSearchQuery(module, search)
    }

    const handleSortChange = (sorting: SortingState) => {
        // Save sort preference to store (session storage)
        if (sorting.length > 0) {
            const sort = sorting[0]
            setSortPreference(module, { 
                column: sort.id, 
                direction: sort.desc ? "desc" : "asc" 
            })
        }
    }

    return {
        initialFilters,
        initialSearch,
        initialSorting,
        handleFiltersChange,
        handleSearchChange,
        handleSortChange,
    }
}

