import type { ColumnDef, ColumnFiltersState, SortingState, VisibilityState } from "@tanstack/react-table"

/**
 * Main props interface for GenericListView component
 */
export interface GenericListViewProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    filterColumn?: string
    onExport?: (exportInfo: {
        selectedRowIds: Set<any>
        filters: ColumnFiltersState
        search: string
        filteredCount: number
    }) => void
    onImport?: () => void
    isImporting?: boolean
    onRowClick?: (row: TData) => void
    onRowHover?: (row: TData) => void
    onDeleteSelected?: (selectedRows: TData[]) => Promise<void>
    initialSorting?: SortingState
    initialFilters?: ColumnFiltersState
    initialSearch?: string
    initialColumnVisibility?: VisibilityState
    onFiltersChange?: (filters: ColumnFiltersState) => void
    onSearchChange?: (search: string) => void
    onSortChange?: (sorting: SortingState) => void
    onAdd?: () => void
    addHref?: string
    onBack?: () => void
    filters?: {
        columnId: string
        title: string
        options: { label: string; value: string }[]
    }[]
    customFilters?: React.ReactNode[]
    searchFields?: (keyof TData)[]
    module?: string
    enableSuggestions?: boolean
    enableRangeSelection?: boolean
    enableLongPress?: boolean
    persistSelection?: boolean
    renderMobileCard?: (row: TData) => React.ReactNode
    enableVirtualization?: boolean
    virtualRowHeight?: number
    exportOptions?: {
        moduleName?: string
        getColumnTitle?: (columnId: string, columnDef: ColumnDef<TData> | undefined) => string
        getCellValue?: (row: TData, columnId: string, columnDef: ColumnDef<TData> | undefined) => any
        columns?: ColumnDef<TData>[]
        totalCount?: number
    }
    onEdit?: (row: TData) => void
    onDelete?: (row: TData) => void
    renderLeftActions?: (row: TData) => React.ReactNode
    batchDeleteConfig?: {
        itemName: string
        moduleName: string
        isLoading: boolean
        getItemLabel: (item: TData) => string
    }
    /**
     * Server-side pagination configuration
     * When enabled, pagination is handled on the server instead of client-side
     */
    serverSidePagination?: {
        enabled: boolean
        pageCount: number  // Total number of pages from server (totalPages)
        total: number      // Total number of records from server
        isLoading?: boolean // Loading state when fetching new page
        onPaginationChange?: (page: number, pageSize: number) => void
    }
    /**
     * Server-side search configuration
     * When enabled, search is handled on the server instead of client-side
     */
    serverSideSearch?: {
        enabled: boolean
        onSearchChange?: (searchTerm: string) => void
        debounceMs?: number // Debounce delay for search input (default: 300ms)
    }
}

/**
 * Parameters for useGenericListTableState hook
 */
export interface UseGenericListTableStateParams<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    initialFilters?: ColumnFiltersState
    initialSorting?: SortingState
    initialSearch?: string
    initialColumnVisibility?: VisibilityState
    onFiltersChange?: (filters: ColumnFiltersState) => void
    onSearchChange?: (search: string) => void
    onSortChange?: (sorting: SortingState) => void
    persistSelection: boolean | undefined
    serverSidePagination?: {
        enabled: boolean
        pageCount: number
        total: number
        onPaginationChange?: (page: number, pageSize: number) => void
    }
}

/**
 * Return type for useGenericListTableState hook
 */
export interface UseGenericListTableStateReturn {
    table: any
    rowSelection: any
    setRowSelection: (value: any) => void
    columnFilters: ColumnFiltersState
    globalFilter: string
    setGlobalFilter: (value: string | ((prev: string) => string)) => void
    pagination: any
    setPagination: (value: any) => void
    filteredRows: any[]
    selectedRowCount: number
    totalRowCount: number
    totalDataCount: number
    headerGroups: any[]
    isSearchActive: boolean
    pageInputRef: React.RefObject<HTMLInputElement>
    pageInputValue: string
    setPageInputValue: (value: string) => void
    handlePageInputBlur: () => void
    handlePageInputFocus: () => void
    handlePageInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

/**
 * Parameters for useGenericListSelection hook
 */
export interface UseGenericListSelectionParams {
    enableRangeSelection?: boolean
    enableLongPress?: boolean
    persistSelection?: boolean
    rowSelection: any
    setRowSelection: (value: any) => void
}

/**
 * Return type for useGenericListSelection hook
 */
export interface UseGenericListSelectionReturn {
    isSelectionMode: boolean
    handleRowSelect: (rowId: string, event: React.MouseEvent | React.PointerEvent) => void
    handleRowPointerDown: (rowId: string, event: React.PointerEvent) => void
    handleRowPointerUp: (rowId: string, event: React.PointerEvent) => void
    rangeStartIndex: number | null
    rangeEndIndex: number | null
    clearSelectionMode: () => void
    isShiftHeldRef: React.MutableRefObject<boolean>
    lastSelectedRowIndex: number | null
}

/**
 * Props for GenericListToolbarSection component
 */
export interface GenericListToolbarSectionProps<TData> {
    table: any
    filterColumn: string
    onExport?: GenericListViewProps<TData, any>["onExport"]
    onImport?: () => void
    isImporting?: boolean
    onAdd?: () => void
    addHref?: string
    onBack?: () => void
    filters?: {
        columnId: string
        title: string
        options: { label: string; value: string }[]
    }[]
    customFilters?: React.ReactNode[]
    searchFields?: (keyof TData)[]
    module?: string
    enableSuggestions?: boolean
    onDeleteSelected?: (selectedRows: TData[]) => Promise<void>
    filteredRows: any[]
    isSearchActive: boolean
    totalDataCount: number
    columns: ColumnDef<TData>[]
    exportOptions?: {
        moduleName?: string
        getColumnTitle?: (columnId: string, columnDef: ColumnDef<TData> | undefined) => string
        getCellValue?: (row: TData, columnId: string, columnDef: ColumnDef<TData> | undefined) => any
        columns?: ColumnDef<TData>[]
        totalCount?: number
    }
}

/**
 * Props for GenericListMobileSection component
 */
export interface GenericListMobileSectionProps<TData> {
    filteredRows: any[]
    renderMobileCard?: (row: TData) => React.ReactNode
    onRowClick?: (row: TData) => void
    table: any
    handleRowSelect: (rowId: string, event: React.MouseEvent | React.PointerEvent) => void
    handleRowPointerDown: (rowId: string, event: React.PointerEvent) => void
    handleRowPointerUp: (rowId: string, event: React.PointerEvent) => void
    onEdit?: (row: TData) => void
    onDelete?: (row: TData) => void
    renderLeftActions?: (row: TData) => React.ReactNode
}

/**
 * Props for GenericListMobileFooterSection component
 */
export interface GenericListMobileFooterSectionProps {
    table: any
    selectedRowCount: number
    totalRowCount: number
    pageInputRef: React.RefObject<HTMLInputElement>
    pageInputValue: string
    setPageInputValue: (value: string) => void
    handlePageInputBlur: () => void
    handlePageInputFocus: () => void
    handlePageInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
    serverSidePagination?: {
        enabled: boolean
        pageCount: number
        total: number
    }
}

/**
 * Props for GenericListTableSection component
 */
export interface GenericListTableSectionProps<TData, TValue> {
    table: any
    columns: ColumnDef<TData, TValue>[]
    filteredRows: any[]
    onRowClick?: (row: TData) => void
    onRowHover?: (row: TData) => void
    handleRowSelect: (rowId: string, event: React.MouseEvent | React.PointerEvent) => void
    handleRowPointerDown: (rowId: string, event: React.PointerEvent) => void
    handleRowPointerUp: (rowId: string, event: React.PointerEvent) => void
    isSelectionMode: boolean
    enableRangeSelection?: boolean
    rangeStartIndex: number | null
    rangeEndIndex: number | null
    enableVirtualization?: boolean
    virtualRowHeight?: number
    // Footer props (moved from GenericListFooterSection)
    selectedRowCount: number
    totalRowCount: number
    pageInputRef: React.RefObject<HTMLInputElement>
    pageInputValue: string
    setPageInputValue: (value: string) => void
    handlePageInputBlur: () => void
    handlePageInputFocus: () => void
    handlePageInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
    serverSidePagination?: {
        enabled: boolean
        pageCount: number
        total: number
    }
}

/**
 * Props for GenericListFooterSection component
 */
export interface GenericListFooterSectionProps {
    table: any
    selectedRowCount: number
    totalRowCount: number
    pageInputRef: React.RefObject<HTMLInputElement>
    pageInputValue: string
    setPageInputValue: (value: string) => void
    handlePageInputBlur: () => void
    handlePageInputFocus: () => void
    handlePageInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
    serverSidePagination?: {
        enabled: boolean
        pageCount: number
        total: number
    }
}

