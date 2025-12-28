"use client"

import { useMemo, useCallback } from "react"
import type { ColumnDef, ColumnFiltersState, SortingState } from "@tanstack/react-table"
import { useListQuery } from "@/lib/react-query"
import type { QueryKeyFactory } from "@/lib/react-query/query-keys/types"
import { useListViewFilters } from "./use-list-view-filters"
import type { GenericListViewProps } from "@/shared/components/data-display/generic-list-view/types"

/**
 * Configuration for useDataTable hook
 */
export interface UseDataTableConfig<TData> {
  /**
   * Query key factory for the module
   */
  queryKeys: QueryKeyFactory

  /**
   * API function to fetch all entities
   */
  queryFn: () => Promise<TData[]>

  /**
   * Initial data (from server-side)
   */
  initialData?: TData[]

  /**
   * Module name (for filter persistence)
   */
  module: string

  /**
   * Table columns definition
   */
  columns: ColumnDef<TData, any>[]

  /**
   * Default sorting state
   */
  defaultSorting?: SortingState

  /**
   * Filter column key (for default search)
   */
  filterColumn?: string

  /**
   * Filter options (for filter chips)
   */
  filters?: {
    columnId: string
    title: string
    options: { label: string; value: string }[]
  }[]

  /**
   * Custom filter components
   */
  customFilters?: React.ReactNode[]

  /**
   * Search fields (for search suggestions)
   */
  searchFields?: (keyof TData)[]

  /**
   * Row click handler
   */
  onRowClick?: (row: TData) => void

  /**
   * Row hover handler
   */
  onRowHover?: (row: TData) => void

  /**
   * Edit handler
   */
  onEdit?: (row: TData) => void

  /**
   * Delete handler
   */
  onDelete?: (row: TData) => void

  /**
   * Add new handler
   */
  onAdd?: () => void

  /**
   * Add new href (alternative to onAdd)
   */
  addHref?: string

  /**
   * Back handler
   */
  onBack?: () => void

  /**
   * Delete selected handler
   */
  onDeleteSelected?: (selectedRows: TData[]) => Promise<void>

  /**
   * Export handler
   */
  onExport?: (exportInfo: {
    selectedRowIds: Set<any>
    filters: ColumnFiltersState
    search: string
    filteredCount: number
  }) => void

  /**
   * Import handler
   */
  onImport?: () => void

  /**
   * Is importing state
   */
  isImporting?: boolean

  /**
   * Enable search suggestions
   */
  enableSuggestions?: boolean

  /**
   * Enable range selection
   */
  enableRangeSelection?: boolean

  /**
   * Enable long press selection
   */
  enableLongPress?: boolean

  /**
   * Persist selection across filters/search
   */
  persistSelection?: boolean

  /**
   * Render mobile card
   */
  renderMobileCard?: (row: TData) => React.ReactNode

  /**
   * Enable virtualization
   */
  enableVirtualization?: boolean

  /**
   * Virtual row height
   */
  virtualRowHeight?: number

  /**
   * Export options
   */
  exportOptions?: {
    moduleName?: string
    getColumnTitle?: (columnId: string, columnDef: ColumnDef<TData> | undefined) => string
    getCellValue?: (row: TData, columnId: string, columnDef: ColumnDef<TData> | undefined) => any
    columns?: ColumnDef<TData>[]
    totalCount?: number
  }

  /**
   * Render left actions
   */
  renderLeftActions?: (row: TData) => React.ReactNode
}

/**
 * Hook "tổng lực" kết hợp Query, Filters, Selection, Pagination
 * Return tất cả props cần thiết cho GenericListView
 * 
 * @example
 * ```tsx
 * export function LichDangListView() {
 *   const dataTableProps = useDataTable({
 *     queryKeys: lichDangQueryKeys,
 *     queryFn: LichDangAPI.getAll,
 *     module: lichDangConfig.moduleName,
 *     columns,
 *     defaultSorting: [{ id: "ngay_dang", desc: true }],
 *     filterColumn: "cau_hoi",
 *     onRowClick: (row) => navigate(`/cong-viec/lich-dang/${row.id}`),
 *     onEdit: (row) => navigate(`/cong-viec/lich-dang/${row.id}/sua?returnTo=list`),
 *     onAdd: () => navigate(`/cong-viec/lich-dang/moi`),
 *     onDeleteSelected: async (rows) => {
 *       await batchDeleteMutation.mutateAsync(rows.map(r => r.id))
 *     },
 *     filters,
 *     exportOptions: { getColumnTitle, getCellValue },
 *   })
 *   
 *   return <GenericListView {...dataTableProps} />
 * }
 * ```
 */
export function useDataTable<TData>(config: UseDataTableConfig<TData>) {
  // 1. Fetch data using React Query
  const { data, isLoading, isError, refetch } = useListQuery<TData[], Error>({
    queryKey: config.queryKeys.list(),
    queryFn: config.queryFn,
    initialData: config.initialData,
  })

  // 2. Manage filters/search/sort with session storage
  const {
    initialFilters,
    initialSearch,
    initialSorting,
    handleFiltersChange,
    handleSearchChange,
    handleSortChange,
  } = useListViewFilters(config.module, config.defaultSorting || [{ id: "id", desc: true }])

  // 3. Prepare props for GenericListView
  const props: GenericListViewProps<TData, any> = useMemo(
    () => ({
      columns: config.columns,
      data: data || [],
      filterColumn: config.filterColumn,
      initialSorting: initialSorting,
      initialFilters: initialFilters,
      initialSearch: initialSearch,
      onFiltersChange: handleFiltersChange,
      onSearchChange: handleSearchChange,
      onSortChange: handleSortChange,
      filters: config.filters,
      customFilters: config.customFilters,
      searchFields: config.searchFields,
      module: config.module,
      enableSuggestions: config.enableSuggestions ?? true,
      enableRangeSelection: config.enableRangeSelection ?? true,
      enableLongPress: config.enableLongPress ?? true,
      persistSelection: config.persistSelection,
      renderMobileCard: config.renderMobileCard,
      enableVirtualization: config.enableVirtualization,
      virtualRowHeight: config.virtualRowHeight,
      onRowClick: config.onRowClick,
      onRowHover: config.onRowHover,
      onEdit: config.onEdit,
      onDelete: config.onDelete,
      onAdd: config.onAdd,
      addHref: config.addHref,
      onBack: config.onBack,
      onDeleteSelected: config.onDeleteSelected,
      onExport: config.onExport,
      onImport: config.onImport,
      isImporting: config.isImporting,
      exportOptions: config.exportOptions,
      renderLeftActions: config.renderLeftActions,
    }),
    [
      config.columns,
      data,
      config.filterColumn,
      initialSorting,
      initialFilters,
      initialSearch,
      handleFiltersChange,
      handleSearchChange,
      handleSortChange,
      config.filters,
      config.customFilters,
      config.searchFields,
      config.module,
      config.enableSuggestions,
      config.enableRangeSelection,
      config.enableLongPress,
      config.persistSelection,
      config.renderMobileCard,
      config.enableVirtualization,
      config.virtualRowHeight,
      config.onRowClick,
      config.onRowHover,
      config.onEdit,
      config.onDelete,
      config.onAdd,
      config.addHref,
      config.onBack,
      config.onDeleteSelected,
      config.onExport,
      config.onImport,
      config.isImporting,
      config.exportOptions,
      config.renderLeftActions,
    ]
  )

  return {
    ...props,
    isLoading,
    isError,
    refetch,
  }
}

