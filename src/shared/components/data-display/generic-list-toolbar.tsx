"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { X, Download, Plus, ChevronLeft, Search, Upload, Loader2 } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getParentRouteFromBreadcrumb } from "@/lib/utils"
import { toolbarButtonClass, toolbarButtonOutlineClass, toolbarGapClass, toolbarContainerClass, actionButtonClass } from "@/shared/utils/toolbar-styles"
import { BADGE_TYPOGRAPHY } from "@/shared/constants/typography"
import { useFiltersStore } from "@/shared/stores/filters-store"
import { extractSearchSuggestions } from "@/shared/utils/search-operators"
import { SearchSuggestions } from "./search-suggestions"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { SelectionToolbar } from "./selection/selection-toolbar"
import type { BulkAction } from "./selection/bulk-actions-menu"
import { ExportDialog } from "./export/export-dialog"
import type { ColumnDef } from "@tanstack/react-table"

interface GenericListToolbarProps<TData> {
    table: Table<TData>
    filterColumn?: string
    placeholder?: string
    onExport?: (exportInfo: {
        selectedRowIds: Set<any>
        filters: any[]
        search: string
        filteredCount: number
    }) => void
    onImport?: () => void
    isImporting?: boolean
    onDeleteSelected?: () => void
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
    bulkActions?: BulkAction<TData>[]
    exportOptions?: {
        columns: ColumnDef<TData>[]
        totalCount: number
        moduleName?: string
        getColumnTitle?: (columnId: string, columnDef: ColumnDef<TData> | undefined) => string
        getCellValue?: (row: TData, columnId: string, columnDef: ColumnDef<TData> | undefined) => any
    }
}

function GenericListToolbarComponent<TData>({
    table,
    filterColumn = "name",
    placeholder = "Tìm kiếm...",
    onExport,
    onImport,
    isImporting = false,
    onDeleteSelected,
    onAdd,
    addHref,
    onBack,
    filters = [],
    customFilters = [],
    searchFields,
    module,
    enableSuggestions = true,
    bulkActions,
    exportOptions,
}: GenericListToolbarProps<TData>) {
    const navigate = useNavigate()
    const location = useLocation()
    const { addRecentSearch, getRecentSearches } = useFiltersStore()
    
    const isFiltered = table.getState().columnFilters.length > 0 || !!table.getState().globalFilter
    const filterCount = table.getState().columnFilters.length + (table.getState().globalFilter ? 1 : 0)
    const selectedCount = table.getFilteredSelectedRowModel().rows.length
    const hasSelection = selectedCount > 0
    void hasSelection

    // Recent searches
    const recentSearches = React.useMemo(() => {
        if (!module) return []
        return getRecentSearches(module, 5)
    }, [module, getRecentSearches])

    // Search suggestions state
    const [showSuggestions, setShowSuggestions] = React.useState(false)
    const [suggestionIndex, setSuggestionIndex] = React.useState(0)
    const suggestionsContainerRef = React.useRef<HTMLDivElement>(null)

    // Local state cho input value để xử lý IME composition (tiếng Việt có dấu)
    const [inputValue, setInputValue] = React.useState(
        (table.getState().globalFilter as string) ?? ""
    )
    const isComposingRef = React.useRef(false)
    const searchInputRef = React.useRef<HTMLInputElement>(null)

    // Sync input value với table state khi không phải từ user input
    // (ví dụ: khi clear filter từ button)
    React.useEffect(() => {
        if (!isComposingRef.current) {
            const tableFilter = (table.getState().globalFilter as string) ?? ""
            if (tableFilter !== inputValue) {
                setInputValue(tableFilter)
            }
        }
    }, [table.getState().globalFilter]) // ⚡ Fix: Bỏ inputValue khỏi dependency để tránh conflict khi nhập nhanh

    // Keyboard shortcuts cho search
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+K hoặc Cmd+K để focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                const activeElement = document.activeElement
                const isInputFocused = activeElement?.tagName === "INPUT" || activeElement?.tagName === "TEXTAREA"
                
                if (!isInputFocused && searchInputRef.current) {
                    e.preventDefault()
                    searchInputRef.current.focus()
                    searchInputRef.current.select()
                }
            }
            
            // Esc để clear search nếu đang focus vào search input
            if (e.key === 'Escape' && searchInputRef.current && document.activeElement === searchInputRef.current) {
                e.preventDefault()
                setInputValue("")
                table.setGlobalFilter("")
                searchInputRef.current.blur()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [table])

    // Handler để clear search
    const handleClearSearch = () => {
        setInputValue("")
        table.setGlobalFilter("")
        setShowSuggestions(false)
        if (searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }

    // Handle suggestion select
    const handleSuggestionSelect = (value: string) => {
        setInputValue(value)
        table.setGlobalFilter(value)
        setShowSuggestions(false)
        if (module && value.trim()) {
            addRecentSearch(module, value.trim())
        }
        searchInputRef.current?.focus()
    }

    // Handle keyboard navigation for suggestions
    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || !enableSuggestions) {
            if (e.key === 'Escape') {
                e.preventDefault()
                handleClearSearch()
            }
            return
        }

        const data = table.getRowModel().rows.map(row => row.original) as Record<string, any>[]
        const fields = (searchFields || [filterColumn as keyof TData]).map(f => String(f))
        const suggestions = extractSearchSuggestions(data, fields, inputValue, 5)
        const items = inputValue.length < 2 && recentSearches.length > 0 ? recentSearches : suggestions
        const maxIndex = items.length - 1

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSuggestionIndex(prev => Math.min(prev + 1, maxIndex))
                break
            case 'ArrowUp':
                e.preventDefault()
                setSuggestionIndex(prev => Math.max(prev - 1, 0))
                break
            case 'Enter':
                if (suggestionIndex >= 0 && suggestionIndex < items.length) {
                    e.preventDefault()
                    handleSuggestionSelect(items[suggestionIndex])
                }
                break
            case 'Escape':
                e.preventDefault()
                setShowSuggestions(false)
                break
        }
    }

    const [exportDialogOpen, setExportDialogOpen] = React.useState(false)

    const handleBack = () => {
        if (onBack) {
            onBack()
            return
        }
        
        const parentRoute = getParentRouteFromBreadcrumb(location.pathname)
        if (parentRoute) {
            navigate(parentRoute)
            return
        }
        
        navigate(-1)
    }

    const handleExportClick = () => {
        if (exportOptions) {
            setExportDialogOpen(true)
        } else if (onExport) {
            const selectedRows = table.getFilteredSelectedRowModel().rows
            const selectedIds = new Set(selectedRows.map(row => {
                const rowData = row.original as any
                return rowData.id
            }))
            onExport({
                selectedRowIds: selectedIds,
                filters: table.getState().columnFilters,
                search: table.getState().globalFilter || '',
                filteredCount: table.getFilteredRowModel().rows.length
            })
        }
    }

    return (
        <div className="flex flex-col space-y-2 py-2 md:py-2 w-full max-w-full min-w-0">

            {/* Mobile Layout: 2 hàng */}
            <div className={cn("md:hidden flex flex-col w-full max-w-full min-w-0", toolbarGapClass())}>
                {/* Hàng 1: Search + View Options */}
                <div className={cn("flex items-center w-full max-w-full min-w-0", toolbarGapClass())}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleBack} title="Quay lại">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {/* Search input với icon và clear button */}
                    <div className="relative flex-1 min-w-0" ref={suggestionsContainerRef}>
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none z-10" />
                        <Input
                            ref={searchInputRef}
                            id="table-search-input"
                            name="table-search"
                            placeholder={placeholder}
                            value={inputValue}
                            autoComplete="off"
                            onCompositionStart={() => {
                                // ⚡ Fix: Đánh dấu đang composition (nhập tiếng Việt có dấu)
                                isComposingRef.current = true
                            }}
                            onCompositionEnd={(e) => {
                                // ⚡ Fix: Kết thúc composition, update table filter
                                isComposingRef.current = false
                                const value = e.currentTarget.value
                                setInputValue(value)
                                table.setGlobalFilter(value)
                            }}
                            onChange={(event) => {
                                const value = event.target.value
                                setInputValue(value)
                                // ⚡ Professional: Show suggestions when typing
                                if (enableSuggestions) {
                                    setShowSuggestions(true)
                                }
                                // ⚡ Fix: Chỉ update table khi không đang composition
                                // Tránh duplicate và mất chữ khi nhập tiếng Việt
                                // ⚡ Fix: Update ngay lập tức để nhận diện khi nhập nhanh
                                if (!isComposingRef.current) {
                                    table.setGlobalFilter(value)
                                }
                            }}
                            onKeyDown={handleSearchKeyDown}
                            onFocus={() => {
                                // ⚡ Professional: Show suggestions on focus
                                if (enableSuggestions && (inputValue.length >= 2 || recentSearches.length > 0)) {
                                    setShowSuggestions(true)
                                }
                            }}
                            onBlur={() => {
                                // ⚡ Professional: Hide suggestions on blur (with delay to allow click)
                                setTimeout(() => {
                                    if (!suggestionsContainerRef.current?.contains(document.activeElement)) {
                                        setShowSuggestions(false)
                                    }
                                }, 200)
                            }}
                            className={cn(
                                "h-8 flex-1 min-w-0 pl-8 pr-8 relative z-0",
                                inputValue && "pr-8"
                            )}
                        />
                        {inputValue && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 hover:bg-transparent"
                                onClick={handleClearSearch}
                                type="button"
                                title="Xóa tìm kiếm (Esc)"
                            >
                                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                            </Button>
                        )}
                        {/* Search suggestions */}
                        {showSuggestions && enableSuggestions && searchFields && (
                            <SearchSuggestions
                                data={table.getRowModel().rows.map(row => row.original) as Record<string, any>[]}
                                searchFields={(searchFields || [filterColumn as keyof TData]).map(f => String(f))}
                                query={inputValue}
                                onSelect={handleSuggestionSelect}
                                maxSuggestions={5}
                                showRecentSearches={!!module}
                                recentSearches={recentSearches}
                                onRecentSearchSelect={handleSuggestionSelect}
                            />
                        )}
                    </div>
                    <div className="shrink-0">
                        <DataTableViewOptions table={table} />
                    </div>
                </div>

                {/* Hàng 2: Import, Export, Thêm mới */}
                <div className="flex items-center justify-end gap-2 w-full max-w-full min-w-0">
                    {/* ⚡ Professional: Selection toolbar */}
                    <SelectionToolbar
                        table={table}
                        bulkActions={bulkActions}
                        onDelete={onDeleteSelected}
                        onExport={exportOptions ? () => {
                            setExportDialogOpen(true)
                        } : (onExport ? () => {
                            const selectedRows = table.getFilteredSelectedRowModel().rows
                            const selectedIds = new Set(selectedRows.map(row => {
                                const rowData = row.original as any
                                return rowData.ma_nhan_vien || rowData.id
                            }))
                            onExport({
                                selectedRowIds: selectedIds,
                                filters: table.getState().columnFilters,
                                search: table.getState().globalFilter || '',
                                filteredCount: table.getFilteredRowModel().rows.length
                            })
                        } : undefined)}
                        showCount={false}
                    />
                    {onImport && !hasSelection && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 shrink-0 hidden md:flex" 
                            onClick={onImport}
                            title="Nhập dữ liệu từ Excel"
                            disabled={isImporting}
                        >
                            {isImporting ? (
                                <>
                                    <Loader2 className="mr-1.5 lg:mr-2 h-3.5 w-3.5 lg:h-4 lg:w-4 animate-spin" />
                                    <span className="hidden lg:inline">Đang nhập...</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-1.5 lg:mr-2 h-3.5 w-3.5 lg:h-4 lg:w-4" />
                                    <span className="hidden lg:inline">Nhập Excel</span>
                                </>
                            )}
                        </Button>
                    )}
                    {(onExport || exportOptions) && !hasSelection && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 shrink-0 hidden lg:flex" 
                            onClick={handleExportClick}
                            title="Xuất dữ liệu"
                        >
                            <Download className="mr-1.5 lg:mr-2 h-3.5 w-3.5 lg:h-4 lg:w-4" />
                            <span className="hidden xl:inline">Xuất</span>
                        </Button>
                    )}
                    {(onAdd || addHref) && (
                        addHref ? (
                            <Button size="sm" className="h-8 shrink-0" onClick={() => navigate(addHref)}>
                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                <span>Thêm mới</span>
                            </Button>
                        ) : (
                            <Button size="sm" className="h-8 shrink-0" onClick={onAdd}>
                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                <span>Thêm mới</span>
                            </Button>
                        )
                    )}
                </div>
            </div>

            {/* Desktop/Tablet Layout: 1 hàng */}
            <div className={cn("hidden md:flex flex-row items-center justify-between w-full max-w-full min-w-0", toolbarGapClass())}>
                <div className={cn("flex flex-1 items-center min-w-0 max-w-full", toolbarGapClass())}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleBack} title="Quay lại">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {/* Search input với icon và clear button */}
                    <div className="relative w-[140px] lg:w-[180px] xl:w-[220px] flex-shrink" ref={suggestionsContainerRef}>
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none z-10" />
                        <Input
                            ref={searchInputRef}
                            id="table-search-input-desktop"
                            name="table-search"
                            placeholder={placeholder}
                            value={inputValue}
                            autoComplete="off"
                            onCompositionStart={() => {
                                // ⚡ Fix: Đánh dấu đang composition (nhập tiếng Việt có dấu)
                                isComposingRef.current = true
                            }}
                            onCompositionEnd={(e) => {
                                // ⚡ Fix: Kết thúc composition, update table filter
                                isComposingRef.current = false
                                const value = e.currentTarget.value
                                setInputValue(value)
                                table.setGlobalFilter(value)
                            }}
                            onChange={(event) => {
                                const value = event.target.value
                                setInputValue(value)
                                // ⚡ Professional: Show suggestions when typing
                                if (enableSuggestions) {
                                    setShowSuggestions(true)
                                }
                                // ⚡ Fix: Chỉ update table khi không đang composition
                                // Tránh duplicate và mất chữ khi nhập tiếng Việt
                                // ⚡ Fix: Update ngay lập tức để nhận diện khi nhập nhanh
                                if (!isComposingRef.current) {
                                    table.setGlobalFilter(value)
                                }
                            }}
                            onKeyDown={handleSearchKeyDown}
                            onFocus={() => {
                                // ⚡ Professional: Show suggestions on focus
                                if (enableSuggestions && (inputValue.length >= 2 || recentSearches.length > 0)) {
                                    setShowSuggestions(true)
                                }
                            }}
                            onBlur={() => {
                                // ⚡ Professional: Hide suggestions on blur (with delay to allow click)
                                setTimeout(() => {
                                    if (!suggestionsContainerRef.current?.contains(document.activeElement)) {
                                        setShowSuggestions(false)
                                    }
                                }, 200)
                            }}
                            className={cn(
                                "h-8 w-full pl-8 pr-8 relative z-0",
                                inputValue && "pr-8"
                            )}
                        />
                        {inputValue && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 hover:bg-transparent"
                                onClick={handleClearSearch}
                                type="button"
                                title="Xóa tìm kiếm (Esc)"
                            >
                                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                            </Button>
                        )}
                        {/* Keyboard shortcut hint */}
                        {!inputValue && (
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center gap-1">
                                <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                    <span className="text-xs">⌘</span>K
                                </kbd>
                            </div>
                        )}
                        {/* Search suggestions */}
                        {showSuggestions && enableSuggestions && searchFields && (
                            <SearchSuggestions
                                data={table.getRowModel().rows.map(row => row.original) as Record<string, any>[]}
                                searchFields={(searchFields || [filterColumn as keyof TData]).map(f => String(f))}
                                query={inputValue}
                                onSelect={handleSuggestionSelect}
                                maxSuggestions={5}
                                showRecentSearches={!!module}
                                recentSearches={recentSearches}
                                onRecentSearchSelect={handleSuggestionSelect}
                            />
                        )}
                    </div>
                    {isFiltered && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                // Clear table filters
                                table.resetColumnFilters()
                                table.setGlobalFilter("")
                                setInputValue("")
                                
                                // ✅ Clear filters from store (session storage)
                                if (module) {
                                    const { clearModuleFilters, clearSearchQuery } = useFiltersStore.getState()
                                    clearModuleFilters(module)
                                    clearSearchQuery(module)
                                }
                            }}
                            className={toolbarButtonOutlineClass("px-2.5 lg:px-3")}
                        >
                            <X className="h-3.5 w-3.5 lg:h-4 lg:w-4 mr-1.5" />
                            <span>Bỏ lọc</span>
                            {filterCount > 1 && (
                                <Badge variant="secondary" className={cn("ml-1.5 h-4 px-1", BADGE_TYPOGRAPHY.default.fontSize, BADGE_TYPOGRAPHY.default.fontWeight)}>
                                    {filterCount}
                                </Badge>
                            )}
                        </Button>
                    )}

                    {/* View Options - columns toggle */}
                    <div className="shrink-0">
                        <DataTableViewOptions table={table} />
                    </div>
                </div>

                <div className={toolbarContainerClass("shrink-0 min-w-0")}>
                    {/* ⚡ Professional: Selection toolbar - moved to separate component */}
                    <SelectionToolbar
                        table={table}
                        bulkActions={bulkActions}
                        onDelete={onDeleteSelected}
                        onExport={exportOptions ? () => {
                            setExportDialogOpen(true)
                        } : (onExport ? () => {
                            const selectedRows = table.getFilteredSelectedRowModel().rows
                            const selectedIds = new Set(selectedRows.map(row => {
                                const rowData = row.original as any
                                return rowData.ma_nhan_vien || rowData.id
                            }))
                            onExport({
                                selectedRowIds: selectedIds,
                                filters: table.getState().columnFilters,
                                search: table.getState().globalFilter || '',
                                filteredCount: table.getFilteredRowModel().rows.length
                            })
                        } : undefined)}
                        showCount={false} // Count is shown in footer
                    />

                    {onImport && !hasSelection && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 shrink-0 hidden md:flex" 
                            onClick={onImport}
                            title="Nhập dữ liệu từ Excel"
                            disabled={isImporting}
                        >
                            {isImporting ? (
                                <>
                                    <Loader2 className="mr-1.5 lg:mr-2 h-3.5 w-3.5 lg:h-4 lg:w-4 animate-spin" />
                                    <span className="hidden lg:inline">Đang nhập...</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-1.5 lg:mr-2 h-3.5 w-3.5 lg:h-4 lg:w-4" />
                                    <span className="hidden lg:inline">Nhập Excel</span>
                                </>
                            )}
                        </Button>
                    )}
                    {(onExport || exportOptions) && !hasSelection && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 shrink-0 hidden lg:flex" 
                            onClick={handleExportClick}
                            title="Xuất dữ liệu"
                        >
                            <Download className="mr-1.5 lg:mr-2 h-3.5 w-3.5 lg:h-4 lg:w-4" />
                            <span className="hidden xl:inline">Xuất</span>
                        </Button>
                    )}
                    {(onAdd || addHref) && (
                        addHref ? (
                            <Button size="sm" className={actionButtonClass()} onClick={() => navigate(addHref)}>
                                <Plus className="mr-2 h-4 w-4" />
                                <span>Thêm mới</span>
                            </Button>
                        ) : (
                            <Button size="sm" className={actionButtonClass()} onClick={onAdd}>
                                <Plus className="mr-2 h-4 w-4" />
                                <span>Thêm mới</span>
                            </Button>
                        )
                    )}
                </div>
            </div>

            {/* Bottom Row - Quick Filters */}
            {(filters.length > 0 || customFilters.length > 0) && (
                <div className="flex items-center gap-2 overflow-x-auto w-full max-w-full min-w-0 pb-1 -mx-1 px-1 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded">
                    {customFilters.map((filter, index) => {
                        // Clone element and inject table/column props if needed
                        if (React.isValidElement(filter)) {
                            const filterProps = filter.props as any
                            if (filterProps.column === undefined) {
                                // Try to find columnId prop to get the column
                                const columnId = filterProps.columnId || filter.key
                                if (columnId && typeof columnId === 'string') {
                                    const column = table.getColumn(columnId)
                                    if (column) {
                                        return React.cloneElement(filter as React.ReactElement<any>, {
                                            key: `custom-filter-${index}`,
                                            column
                                        })
                                    }
                                }
                            }
                        }
                        return (
                            <React.Fragment key={`custom-filter-${index}`}>
                                {filter}
                            </React.Fragment>
                        )
                    })}
                    {filters.map(filter => (
                        table.getColumn(filter.columnId) && (
                            <DataTableFacetedFilter
                                key={filter.columnId}
                                column={table.getColumn(filter.columnId)}
                                title={filter.title}
                                options={filter.options}
                            />
                        )
                    ))}
                </div>
            )}

            {/* Export Dialog */}
            {exportOptions && (
                <ExportDialog
                    open={exportDialogOpen}
                    onOpenChange={setExportDialogOpen}
                    data={table.getRowModel().rows.map(row => row.original)}
                    columns={exportOptions.columns}
                    totalCount={exportOptions.totalCount}
                    selectedRowIds={new Set(
                        table.getFilteredSelectedRowModel().rows
                            .map(row => {
                                const rowData = row.original as any
                                return rowData.id || rowData.ma_nhan_vien
                            })
                            .filter(Boolean)
                    )}
                    currentFilters={table.getState().columnFilters}
                    currentSearch={table.getState().globalFilter as string}
                    moduleName={exportOptions.moduleName || module || 'export'}
                    getColumnTitle={exportOptions.getColumnTitle}
                    getCellValue={exportOptions.getCellValue}
                />
            )}
        </div>
    )
}

// Memoize component để tránh re-render không cần thiết
export const GenericListToolbar = React.memo(GenericListToolbarComponent) as typeof GenericListToolbarComponent
