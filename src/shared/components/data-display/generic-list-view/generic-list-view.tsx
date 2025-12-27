"use client"

import * as React from "react"
import type { GenericListViewProps } from "./types"
import { useGenericListTableState } from "./hooks/use-generic-list-table-state"
import { useGenericListSelection } from "./hooks/use-generic-list-selection"
import { GenericListToolbarSection } from "./sections/generic-list-toolbar-section"
import { GenericListMobileSection } from "./sections/generic-list-mobile-section"
import { GenericListTableSection } from "./sections/generic-list-table-section"
import { GenericListMobileFooterSection } from "./sections/generic-list-mobile-footer-section"
import { GenericListFooterSection } from "./sections/generic-list-footer-section"
import { useElementHeight } from "@/shared/hooks/use-element-height"
import { useMobileBreakpoint } from "@/shared/hooks/use-mobile-breakpoint"
import { getListViewContainerHeight } from "@/shared/constants"

/**
 * GenericListView Component
 * 
 * A comprehensive, professional list view component for React ERP applications.
 * Supports search, filtering, sorting, pagination, selection, and virtualization.
 * 
 * @example
 * ```tsx
 * <GenericListView
 *   columns={columns}
 *   data={data}
 *   filterColumn="name"
 *   onRowClick={(row) => navigate(`/details/${row.id}`)}
 *   onAdd={() => navigate('/create')}
 * />
 * ```
 */
export function GenericListView<TData, TValue>({
    columns,
    data,
    filterColumn = "name",
    onExport,
    onImport,
    isImporting = false,
    onRowClick,
    onRowHover,
    onDeleteSelected,
    initialSorting = [{ id: "id", desc: true }],
    initialFilters = [],
    initialSearch = "",
    onFiltersChange,
    onSearchChange,
    onSortChange,
    onAdd,
    addHref,
    onBack,
    filters = [],
    customFilters = [],
    searchFields,
    module,
    enableSuggestions = true,
    enableRangeSelection = true,
    enableLongPress = true,
    persistSelection = false,
    renderMobileCard,
    enableVirtualization = false,
    virtualRowHeight = 50,
    exportOptions,
    onEdit,
    onDelete,
    renderLeftActions,
}: GenericListViewProps<TData, TValue>) {
    // 1. Manage table state (pagination, sorting, filtering, search)
    const {
        table,
        rowSelection,
        setRowSelection,
        filteredRows,
        selectedRowCount,
        totalRowCount,
        totalDataCount,
        isSearchActive,
        pageInputRef,
        pageInputValue,
        setPageInputValue,
        handlePageInputBlur,
        handlePageInputFocus,
        handlePageInputKeyDown,
    } = useGenericListTableState<TData, TValue>({
        columns,
        data,
        initialFilters,
        initialSorting,
        initialSearch,
        onFiltersChange,
        onSearchChange,
        onSortChange,
        persistSelection,
    })

    // 2. Manage selection state (selection mode, range selection, keyboard shortcuts)
    const {
        isSelectionMode,
        handleRowSelect,
        handleRowPointerDown,
        handleRowPointerUp,
        rangeStartIndex,
        rangeEndIndex,
        clearSelectionMode,
    } = useGenericListSelection(table, {
        enableRangeSelection,
        enableLongPress,
        persistSelection,
        rowSelection,
        setRowSelection,
    })

    // 3. ESC key handler to clear selection / selection mode
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && (table.getFilteredSelectedRowModel().rows.length > 0 || isSelectionMode)) {
                const activeElement = document.activeElement
                const isInputFocused = activeElement?.tagName === "INPUT" || activeElement?.tagName === "TEXTAREA"
                
                if (!isInputFocused) {
                    table.resetRowSelection()
                    clearSelectionMode()
                }
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [table, isSelectionMode, clearSelectionMode])

    // 4. ✅ Sử dụng custom hooks cho responsive layout
    const { ref: toolbarRef, height: toolbarHeight } = useElementHeight<HTMLDivElement>()
    const { isMobile } = useMobileBreakpoint()

    // ✅ Tính toán chiều cao container responsive sử dụng constants
    const containerHeight = React.useMemo(() => {
        // ✅ SSR fallback
        if (typeof window === 'undefined') {
            return '100vh'
        }
        
        return getListViewContainerHeight(isMobile)
    }, [isMobile])

    // 5. Render all sections
    return (
        <div 
            className="flex flex-col w-full max-w-full min-w-0"
            style={{
                minHeight: containerHeight,
                height: containerHeight,
            }}
        >
            {/* ✅ Toolbar với ref để đo chiều cao */}
            <div ref={toolbarRef} data-testid="list-view-toolbar">
                <GenericListToolbarSection
                    table={table}
                    filterColumn={filterColumn}
                    onExport={onExport}
                    onImport={onImport}
                    isImporting={isImporting}
                    onAdd={onAdd}
                    addHref={addHref}
                    onBack={onBack}
                    filters={filters}
                    customFilters={customFilters}
                    searchFields={searchFields || [filterColumn as keyof TData]}
                    module={module}
                    enableSuggestions={enableSuggestions}
                    onDeleteSelected={onDeleteSelected}
                    filteredRows={filteredRows}
                    isSearchActive={isSearchActive}
                    totalDataCount={totalDataCount}
                    columns={columns}
                    exportOptions={exportOptions}
                />
            </div>

            {/* ✅ Table container với chiều cao được tính toán động */}
            <div 
                className="flex-1 min-h-0 flex flex-col w-full max-w-full min-w-0"
                style={{
                    height: `calc(${containerHeight} - ${toolbarHeight}px)`,
                    maxHeight: `calc(${containerHeight} - ${toolbarHeight}px)`,
                }}
            >
                <GenericListMobileSection
                    filteredRows={filteredRows}
                    renderMobileCard={renderMobileCard}
                    onRowClick={onRowClick}
                    table={table}
                    handleRowSelect={handleRowSelect}
                    handleRowPointerDown={handleRowPointerDown}
                    handleRowPointerUp={handleRowPointerUp}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    renderLeftActions={renderLeftActions}
                />

                <GenericListTableSection
                    table={table}
                    columns={columns}
                    filteredRows={filteredRows}
                    onRowClick={onRowClick}
                    onRowHover={onRowHover}
                    handleRowSelect={handleRowSelect}
                    handleRowPointerDown={handleRowPointerDown}
                    handleRowPointerUp={handleRowPointerUp}
                    isSelectionMode={isSelectionMode}
                    enableRangeSelection={enableRangeSelection}
                    rangeStartIndex={rangeStartIndex}
                    rangeEndIndex={rangeEndIndex}
                    enableVirtualization={enableVirtualization}
                    virtualRowHeight={virtualRowHeight}
                    selectedRowCount={selectedRowCount}
                    totalRowCount={totalRowCount}
                    pageInputRef={pageInputRef}
                    pageInputValue={pageInputValue}
                    setPageInputValue={setPageInputValue}
                    handlePageInputBlur={handlePageInputBlur}
                    handlePageInputFocus={handlePageInputFocus}
                    handlePageInputKeyDown={handlePageInputKeyDown}
                />

                <GenericListMobileFooterSection
                    table={table}
                    selectedRowCount={selectedRowCount}
                    totalRowCount={totalRowCount}
                    pageInputRef={pageInputRef}
                    pageInputValue={pageInputValue}
                    setPageInputValue={setPageInputValue}
                    handlePageInputBlur={handlePageInputBlur}
                    handlePageInputFocus={handlePageInputFocus}
                    handlePageInputKeyDown={handlePageInputKeyDown}
                />
            </div>
        </div>
    )
}

