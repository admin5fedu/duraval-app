"use client"

import * as React from "react"
import { GenericListToolbar } from "../../generic-list-toolbar"
import type { GenericListToolbarSectionProps } from "../types"

/**
 * Toolbar section component for GenericListView
 * Handles search, filters, and action buttons
 */
export function GenericListToolbarSection<TData>({
    table,
    filterColumn,
    onExport,
    onImport,
    isImporting = false,
    onAdd,
    addHref,
    onBack,
    filters,
    customFilters,
    searchFields,
    module,
    enableSuggestions,
    onDeleteSelected,
    filteredRows,
    isSearchActive,
    totalDataCount,
    columns,
    exportOptions,
}: GenericListToolbarSectionProps<TData>) {
    return (
        <div className="shrink-0 sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b shadow-sm">
            <GenericListToolbar
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
                exportOptions={exportOptions ? {
                    columns: exportOptions.columns || columns,
                    totalCount: exportOptions.totalCount ?? totalDataCount,
                    moduleName: exportOptions.moduleName || module,
                    getColumnTitle: exportOptions.getColumnTitle,
                    getCellValue: exportOptions.getCellValue,
                } : undefined}
                onDeleteSelected={
                    onDeleteSelected
                        ? async () => {
                              const selectedData =
                                  table.getFilteredSelectedRowModel().rows.map(
                                      (row: any) => row.original
                                  )
                              try {
                                  await onDeleteSelected(selectedData)
                                  table.resetRowSelection()
                              } catch (error) {
                                  if (error !== "CANCELLED") {
                                      console.error(
                                          "Error in onDeleteSelected:",
                                          error
                                      )
                                  }
                              }
                          }
                        : undefined
                }
            />
            
            {isSearchActive && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground border-b">
                    {filteredRows.length === 0 ? (
                        <span>Không tìm thấy kết quả nào</span>
                    ) : filteredRows.length === totalDataCount ? (
                        <span>Hiển thị tất cả {totalDataCount} kết quả</span>
                    ) : (
                        <span>
                            Tìm thấy{" "}
                            <strong className="text-foreground font-medium">
                                {filteredRows.length}
                            </strong>{" "}
                            trong tổng số{" "}
                            <strong className="text-foreground font-medium">
                                {totalDataCount}
                            </strong>{" "}
                            kết quả
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}

