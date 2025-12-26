"use client"

import * as React from "react"
import { useDeferredValue, useMemo } from "react"
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { useUserPreferencesStore } from "@/shared/stores/user-preferences-store"
import { useLazySelection } from "../../selection/use-lazy-selection"
import type {
    UseGenericListTableStateParams,
    UseGenericListTableStateReturn,
} from "../types"

/**
 * Hook to manage table state for GenericListView
 * Handles pagination, sorting, filtering, search, and row selection
 */
export function useGenericListTableState<TData, TValue>({
    columns,
    data,
    initialFilters,
    initialSorting,
    initialSearch,
    onFiltersChange,
    onSearchChange,
    onSortChange,
    persistSelection,
}: UseGenericListTableStateParams<TData, TValue>): UseGenericListTableStateReturn {
    const { defaultPageSize } = useUserPreferencesStore()

    const [rowSelection, setRowSelection] = React.useState({})
    const persistSelectionRef = React.useRef(persistSelection)
    React.useEffect(() => {
        persistSelectionRef.current = persistSelection
    }, [persistSelection])

    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(initialFilters || [])
    const [sorting, setSorting] = React.useState<SortingState>(initialSorting || [])
    const [globalFilter, setGlobalFilter] = React.useState(initialSearch || "")
    const deferredGlobalFilter = useDeferredValue(globalFilter)

    const [debouncedColumnFilters, setDebouncedColumnFilters] = React.useState<ColumnFiltersState>(initialFilters || [])
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedColumnFilters(columnFilters)
        }, 150)
        return () => clearTimeout(timer)
    }, [columnFilters])

    const debouncedSearchChangeRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
    React.useEffect(() => {
        if (debouncedSearchChangeRef.current) {
            clearTimeout(debouncedSearchChangeRef.current)
        }
        debouncedSearchChangeRef.current = setTimeout(() => {
            onSearchChange?.(globalFilter)
        }, 300)

        return () => {
            if (debouncedSearchChangeRef.current) {
                clearTimeout(debouncedSearchChangeRef.current)
                debouncedSearchChangeRef.current = null
            }
        }
    }, [globalFilter, onSearchChange])

    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: defaultPageSize,
    })

    // Scroll to top khi pagination thay đổi (chuyển trang)
    React.useEffect(() => {
        // Tìm scroll containers:
        // 1. Layout container (main scroll container trong Layout)
        const layoutContainer = document.querySelector('.flex-1.overflow-y-auto') as HTMLElement
        // 2. Table body (nếu table có scroll riêng - desktop)
        const tableBody = document.querySelector('[data-testid="list-view-table-body"]') as HTMLElement
        // 3. Mobile cardview container (mobile cardview có scroll riêng)
        const mobileCardContainer = document.querySelector('[data-testid="list-view-mobile-cards"]') as HTMLElement

        // Scroll Layout container (main page scroll) - luôn scroll khi chuyển trang
        if (layoutContainer) {
            layoutContainer.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
            // Fallback: scroll window
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }

        // Scroll table body nếu có (table có scroll riêng - desktop)
        if (tableBody) {
            tableBody.scrollTo({ top: 0, behavior: 'smooth' })
        }

        // Scroll mobile cardview container nếu có (mobile cardview)
        if (mobileCardContainer) {
            mobileCardContainer.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }, [pagination.pageIndex]) // Scroll khi pageIndex thay đổi (chuyển trang)

    const table = useReactTable({
        data,
        columns,
        getRowId: (row: any, index: number) => {
            if (row.id !== undefined && row.id !== null) {
                return String(row.id)
            }
            return `row-${index}`
        },
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters: debouncedColumnFilters,
            globalFilter: deferredGlobalFilter,
            pagination,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: (updater) => {
            const newSorting = typeof updater === "function" ? updater(sorting) : updater
            setSorting(newSorting)
            onSortChange?.(newSorting)
        },
        onColumnFiltersChange: (updater) => {
            const newFilters = typeof updater === "function" ? updater(columnFilters) : updater
            setColumnFilters(newFilters)
            onFiltersChange?.(newFilters)
            if (!persistSelectionRef.current) {
                setTimeout(() => {
                    setRowSelection({})
                }, 0)
            }
        },
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange: (updater) => {
            const newSearch = typeof updater === "function" ? updater(globalFilter) : updater
            setGlobalFilter(newSearch)
            if (!persistSelectionRef.current) {
                setTimeout(() => {
                    setRowSelection({})
                }, 0)
            }
        },
        onPaginationChange: (updater) => {
            const newPagination = typeof updater === "function" ? updater(pagination) : updater
            setPagination(newPagination)
            if (!persistSelectionRef.current) {
                setTimeout(() => {
                    setRowSelection({})
                }, 0)
            }
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        globalFilterFn: (row, columnId, filterValue) => {
            const safeValue = (() => {
                const value = row.getValue(columnId)
                return typeof value === "number" ? String(value) : value
            })()

            const searchText = String(safeValue || "")
            const searchQuery = String(filterValue || "")

            // Support advanced search operators if available
            if (
                searchQuery.includes('"') ||
                searchQuery.toUpperCase().includes(" AND ") ||
                searchQuery.toUpperCase().includes(" OR ") ||
                searchQuery.toUpperCase().includes(" NOT ") ||
                searchQuery.includes("*") ||
                searchQuery.includes("?") ||
                searchQuery.includes(":")
            ) {
                try {
                    const searchOperators = require("@/shared/utils/search-operators")
                    if (searchOperators.evaluateSearchQuery) {
                        return searchOperators.evaluateSearchQuery(searchQuery, searchText, false)
                    }
                } catch (error) {
                    // Fallback to simple search
                }
            }

            return searchText.toLowerCase().includes(searchQuery.toLowerCase())
        },
    })

    const pageInputRef = React.useRef<HTMLInputElement>(null)
    const isPageInputFocused = React.useRef(false)
    const [pageInputValue, setPageInputValue] = React.useState<string>("")

    React.useEffect(() => {
        if (!isPageInputFocused.current) {
            setPageInputValue(`${table.getState().pagination.pageIndex + 1}`)
        }
    }, [table.getState().pagination.pageIndex])

    const handlePageInputBlur = () => {
        isPageInputFocused.current = false
        const pageNum = pageInputValue.trim() ? Number(pageInputValue.trim()) : 1
        const maxPage = table.getPageCount()
        if (maxPage === 0) {
            setPageInputValue("1")
            return
        }
        const validPage = Math.max(1, Math.min(pageNum, maxPage))
        table.setPageIndex(validPage - 1)
        setPageInputValue(`${validPage}`)
    }

    const handlePageInputFocus = () => {
        isPageInputFocused.current = true
    }

    const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.currentTarget.blur()
        }
    }

    const rowModel = table.getRowModel()
    const filteredRows = useMemo(() => rowModel.rows, [rowModel.rows])
    const selectedRowModel = table.getFilteredSelectedRowModel()
    const selectedRowCount = useMemo(
        () => selectedRowModel.rows.length,
        [selectedRowModel.rows.length]
    )
    const filteredRowModel = table.getFilteredRowModel()
    const totalRowCount = useMemo(
        () => filteredRowModel.rows.length,
        [filteredRowModel.rows.length]
    )
    const totalDataCount = useMemo(() => data.length, [data.length])

    useLazySelection(table, {
        threshold: 1000,
        batchSize: 100,
    })

    const headerGroups = useMemo(
        () => table.getHeaderGroups(),
        [table.getHeaderGroups()]
    )

    const isSearchActive = !!globalFilter || (columnFilters && columnFilters.length > 0)

    return {
        table,
        rowSelection,
        setRowSelection,
        columnFilters,
        globalFilter,
        setGlobalFilter,
        pagination,
        setPagination,
        filteredRows,
        selectedRowCount,
        totalRowCount,
        totalDataCount,
        headerGroups,
        isSearchActive,
        pageInputRef,
        pageInputValue,
        setPageInputValue,
        handlePageInputBlur,
        handlePageInputFocus,
        handlePageInputKeyDown,
    }
}

