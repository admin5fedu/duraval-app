"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { GenericListViewProps } from "./types"
import { useGenericListTableState } from "./hooks/use-generic-list-table-state"
import { useGenericListSelection } from "./hooks/use-generic-list-selection"
import { GenericListToolbarSection } from "./sections/generic-list-toolbar-section"
import { GenericListMobileSection } from "./sections/generic-list-mobile-section"
import { GenericListTableSection } from "./sections/generic-list-table-section"
import { GenericListMobileFooterSection } from "./sections/generic-list-mobile-footer-section"
import { useElementHeight } from "@/shared/hooks/use-element-height"
import { useMobileBreakpoint } from "@/shared/hooks/use-mobile-breakpoint"
import { getListViewContainerHeight } from "@/shared/constants"
import { BatchDeleteConfirmationDialog } from "@/shared/components"
import { Loader2 } from "lucide-react"

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
export function GenericListView<TData = any, TValue = unknown>({
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
    initialColumnVisibility,
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
    batchDeleteConfig,
    serverSidePagination,
}: GenericListViewProps<TData, TValue>) {
    // Batch delete confirmation dialog state
    const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = React.useState(false)
    const [selectedRowsToDelete, setSelectedRowsToDelete] = React.useState<TData[]>([])

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
        initialColumnVisibility,
        onFiltersChange,
        onSearchChange,
        onSortChange,
        persistSelection,
        serverSidePagination,
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

    // Handle batch delete with confirmation if config is provided
    const handleDeleteSelected = React.useCallback(async (selectedRows: TData[]) => {
        if (batchDeleteConfig && onDeleteSelected) {
            // Show confirmation dialog
            setSelectedRowsToDelete(selectedRows)
            setBatchDeleteDialogOpen(true)
        } else if (onDeleteSelected) {
            // Direct call without confirmation (backward compatible)
            await onDeleteSelected(selectedRows)
        }
    }, [batchDeleteConfig, onDeleteSelected])

    // Confirm batch delete (must be after table is initialized)
    const confirmBatchDelete = React.useCallback(async () => {
        if (onDeleteSelected && selectedRowsToDelete.length > 0) {
            try {
                await onDeleteSelected(selectedRowsToDelete)
                // Reset selection after successful delete
                table.resetRowSelection()
                setSelectedRowsToDelete([])
                setBatchDeleteDialogOpen(false)
            } catch (error) {
                // Error is handled by mutation or parent component
                console.error("Error in batch delete:", error)
            }
        }
    }, [onDeleteSelected, selectedRowsToDelete, table])

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
                    onDeleteSelected={batchDeleteConfig ? handleDeleteSelected : onDeleteSelected}
                    filteredRows={filteredRows}
                    isSearchActive={isSearchActive}
                    totalDataCount={totalDataCount}
                    columns={columns as ColumnDef<TData>[]}
                    exportOptions={exportOptions}
                />
            </div>

            {/* ✅ Table container với chiều cao được tính toán động */}
            <div 
                className="flex-1 min-h-0 flex flex-col w-full max-w-full min-w-0 relative"
                style={{
                    height: `calc(${containerHeight} - ${toolbarHeight}px)`,
                    maxHeight: `calc(${containerHeight} - ${toolbarHeight}px)`,
                }}
            >
                {/* Loading overlay for server-side pagination */}
                {serverSidePagination?.enabled && serverSidePagination.isLoading && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
                        </div>
                    </div>
                )}
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
                    serverSidePagination={serverSidePagination}
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
                    serverSidePagination={serverSidePagination}
                />
            </div>

            {/* Batch Delete Confirmation Dialog */}
            {batchDeleteConfig && (
                <BatchDeleteConfirmationDialog
                    open={batchDeleteDialogOpen}
                    onOpenChange={setBatchDeleteDialogOpen}
                    selectedItems={selectedRowsToDelete}
                    onConfirm={confirmBatchDelete}
                    isLoading={batchDeleteConfig.isLoading}
                    itemName={batchDeleteConfig.itemName}
                    moduleName={batchDeleteConfig.moduleName}
                    getItemLabel={batchDeleteConfig.getItemLabel}
                />
            )}
        </div>
    )
}

