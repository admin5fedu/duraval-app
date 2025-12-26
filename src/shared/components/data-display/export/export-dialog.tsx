"use client"

import * as React from "react"
import { Download, Loader2, FileSpreadsheet, FileText, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    type ColumnDef,
    type ColumnFiltersState,
} from "@tanstack/react-table"
import { toast } from "sonner"
import { createWorkbook, addDataToWorksheetWithFormat, downloadWorkbook, generateFilename } from "@/lib/excel/exceljs-utils"
import { exportToPDF } from "@/lib/pdf/pdf-utils"
import { cn } from "@/lib/utils"
import { bodyTextClass } from "@/shared/utils/text-styles"
import { ExportPreview } from "./export-preview"
import { ColumnOrderSelector } from "./column-order-selector"
import { ExportTemplateSelector } from "./export-template-selector"
import type { ExcelFormatOptions } from "@/shared/utils/excel-formatter"
import { getColumnDisplayName } from "@/shared/utils/column-name-mapper"
import { 
  loadExportPreferences, 
  saveExportPreferences,
  type ExportPreferences 
} from "@/shared/utils/export-preferences-manager"
import {
  getExportTemplates,
  saveExportTemplate,
  loadExportTemplate,
  deleteExportTemplate,
  type ExportTemplate
} from "@/shared/utils/export-template-manager"

export interface ExportOptions {
  includeMetadata?: boolean
  professionalFormatting?: boolean
  dateFormat?: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd'
}

interface ExportDialogProps<TData> {
    open: boolean
    onOpenChange: (open: boolean) => void
    data: TData[]
    columns: ColumnDef<TData>[]
    totalCount: number
    selectedRowIds?: Set<any>
    currentFilters?: ColumnFiltersState
    currentSearch?: string
    moduleName?: string
    getColumnTitle?: (columnId: string, columnDef: ColumnDef<TData> | undefined) => string
    getCellValue?: (row: TData, columnId: string, columnDef: ColumnDef<TData> | undefined) => any
    exportOptions?: ExportOptions
    onExportOptionsChange?: (options: ExportOptions) => void
}

type ExportMode = 'all' | 'filtered' | 'selected'
type ExportFormat = 'excel' | 'pdf'

export function ExportDialog<TData>({
    open,
    onOpenChange,
    data,
    columns,
    totalCount,
    selectedRowIds = new Set(),
    currentFilters = [],
    currentSearch = '',
    moduleName = 'export',
    getColumnTitle,
    getCellValue,
    exportOptions = {
        includeMetadata: true,
        professionalFormatting: true,
        dateFormat: 'dd/mm/yyyy',
    },
    onExportOptionsChange,
}: ExportDialogProps<TData>) {
    const [mode, setMode] = React.useState<ExportMode>('filtered')
    const [format, setFormat] = React.useState<ExportFormat>('excel')
    const [selectedColumns, setSelectedColumns] = React.useState<Set<string>>(new Set())
    const [columnOrder, setColumnOrder] = React.useState<Map<string, number>>(new Map())
    const [isExporting, setIsExporting] = React.useState(false)
    const [progress, setProgress] = React.useState(0)
    const [showPreview, setShowPreview] = React.useState(false)
    const [options, setOptions] = React.useState<ExportOptions>(exportOptions)
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(currentFilters)
    const [globalFilter, setGlobalFilter] = React.useState(currentSearch)

    // Sync filters when dialog opens
    React.useEffect(() => {
        if (open) {
            setColumnFilters(currentFilters)
            setGlobalFilter(currentSearch)
        }
    }, [open, currentFilters, currentSearch])

    // Create table instance for calculations
    const table = useReactTable({
        data,
        columns,
        state: {
            columnFilters,
            globalFilter,
        },
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        enableRowSelection: true,
    })

    // Initialize selected columns with visible columns or saved preferences
    React.useEffect(() => {
        if (open) {
            // Try to load saved preferences
            const savedPrefs = loadExportPreferences(moduleName)
            
            if (savedPrefs) {
                // Use saved preferences
                setSelectedColumns(new Set(savedPrefs.selectedColumns))
                setColumnOrder(new Map(Object.entries(savedPrefs.columnOrder)))
                setOptions(savedPrefs.exportOptions)
                setMode(savedPrefs.defaultMode || 'filtered')
                setFormat(savedPrefs.defaultFormat || 'excel')
            } else {
                // Initialize with visible columns
            const visibleColumns = table.getVisibleLeafColumns()
                .map(col => col.id)
                .filter((id): id is string => Boolean(id))
                .filter(id => id !== 'actions' && id !== 'select') as string[]
            setSelectedColumns(new Set(visibleColumns))
                
                // Initialize column order
                const orderMap = new Map<string, number>()
                visibleColumns.forEach((id, index) => {
                    orderMap.set(id, index)
                })
                setColumnOrder(orderMap)
            }
        }
    }, [open, table, moduleName])
    
    // Sync options when prop changes
    React.useEffect(() => {
        if (open) {
            setOptions(exportOptions)
        }
    }, [open, exportOptions])

    // Get available columns (excluding select and actions) with order
    const availableColumns = React.useMemo(() => {
        // Step 1: Get columns from table (defined columns)
        const definedColumns = new Map<string, { id: string; title: string; order: number }>()
        
        // Use getVisibleLeafColumns() which is more reliable
        table.getVisibleLeafColumns()
            .filter(col => {
                const colId = col.id
                return colId && colId !== 'select' && colId !== 'actions'
            })
            .forEach(col => {
                const colId = col.id!
                const meta = col.columnDef.meta as any
                const title = getColumnTitle
                    ? getColumnTitle(colId, col.columnDef)
                    : meta?.title || colId
                        .split('_')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')
                const customOrder = columnOrder.get(colId)
                const order = customOrder !== undefined ? customOrder : (meta?.order ?? 999)
                definedColumns.set(colId, { id: colId, title, order })
            })
        
        // Step 2: Auto-detect additional columns from data (fields that exist in data but not in columns)
        const dataColumns = new Map<string, { id: string; title: string; order: number }>()
        
        if (data.length > 0) {
            // Get all keys from first data row
            const firstRow = data[0] as any
            const allKeys = Object.keys(firstRow).filter(key => 
                key !== 'select' && 
                key !== 'actions' && 
                !definedColumns.has(key) &&
                // Exclude internal/private fields
                !key.startsWith('_') &&
                key !== 'id' // Exclude generic id if it's not the primary key
            )
            
            allKeys.forEach((key, index) => {
                // Only add if not already defined
                if (!definedColumns.has(key)) {
                    // Use column name mapper to get Vietnamese name with diacritics
                    const title = getColumnDisplayName(key)
                    const customOrder = columnOrder.get(key)
                    const order = customOrder !== undefined ? customOrder : (1000 + index) // Start from 1000 for auto-detected columns
                    dataColumns.set(key, { id: key, title, order })
                }
            })
        }
        
        // Step 3: Combine defined columns and auto-detected columns
        const allColumns = Array.from(definedColumns.values())
            .concat(Array.from(dataColumns.values()))
            .sort((a, b) => a.order - b.order)
        
        return allColumns
    }, [columns, getColumnTitle, columnOrder, table, data])
    
    // Handle column reorder
    const handleColumnReorder = React.useCallback((columnId: string, direction: 'up' | 'down') => {
        setColumnOrder(prev => {
            const newOrder = new Map(prev)
            const currentOrder = newOrder.get(columnId) ?? 999
            
            // Find adjacent column
            const sortedCols = [...availableColumns].sort((a, b) => a.order - b.order)
            const currentIndex = sortedCols.findIndex(col => col.id === columnId)
            
            if (direction === 'up' && currentIndex > 0) {
                const prevCol = sortedCols[currentIndex - 1]
                const prevOrder = newOrder.get(prevCol.id) ?? 999
                newOrder.set(columnId, prevOrder)
                newOrder.set(prevCol.id, currentOrder)
            } else if (direction === 'down' && currentIndex < sortedCols.length - 1) {
                const nextCol = sortedCols[currentIndex + 1]
                const nextOrder = newOrder.get(nextCol.id) ?? 999
                newOrder.set(columnId, nextOrder)
                newOrder.set(nextCol.id, currentOrder)
            }
            
            return newOrder
        })
    }, [availableColumns])

    // Calculate row count based on mode
    const rowCount = React.useMemo(() => {
        if (mode === 'all') return totalCount
        if (mode === 'selected') return selectedRowIds.size
        return table.getFilteredRowModel().rows.length
    }, [mode, table, totalCount, selectedRowIds])

    // Get export data based on mode
    const getExportData = React.useCallback((): TData[] => {
        if (mode === 'selected') {
            return data.filter((row: any) => {
                const rowId = row.id || row.ma_nhan_vien
                return selectedRowIds.has(rowId)
            })
        }
        if (mode === 'filtered') {
            return table.getFilteredRowModel().rows.map(row => row.original)
        }
        return data
    }, [mode, data, selectedRowIds, table])

    const handleColumnToggle = (columnId: string) => {
        setSelectedColumns(prev => {
            const newSet = new Set(prev)
            if (newSet.has(columnId)) {
                newSet.delete(columnId)
            } else {
                newSet.add(columnId)
            }
            return newSet
        })
    }

    const handleSelectAllColumns = () => {
        const allIds = availableColumns.map(col => col.id)
        setSelectedColumns(new Set(allIds))
    }

    const handleDeselectAllColumns = () => {
        setSelectedColumns(new Set())
    }

    const handleExport = async () => {
        if (selectedColumns.size === 0) {
            toast.error('Vui lòng chọn ít nhất một cột để xuất')
            return
        }

        setIsExporting(true)
        setProgress(0)

        try {
            const exportData = getExportData()
            const exportColumns = columns.filter(col => {
                const colId = col.id
                return colId && selectedColumns.has(colId) && colId !== 'actions' && colId !== 'select'
            })

            // Sort columns by custom order
            exportColumns.sort((a, b) => {
                const aId = a.id!
                const bId = b.id!
                const aOrder = columnOrder.get(aId) ?? (a.meta as any)?.order ?? 999
                const bOrder = columnOrder.get(bId) ?? (b.meta as any)?.order ?? 999
                return aOrder - bOrder
            })

            // Prepare headers
            const headers: string[] = []
            const columnIds: string[] = []

            exportColumns.forEach(col => {
                const colId = col.id!
                columnIds.push(colId)
                const title = getColumnTitle
                    ? getColumnTitle(colId, col)
                    : (col.meta as any)?.title || colId
                        .split('_')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')
                headers.push(title)
            })

            // Prepare rows with error handling
            const rows: any[][] = exportData.map((row, rowIndex) => {
                try {
                    return columnIds.map(colId => {
                        try {
                            const colDef = exportColumns.find(c => c.id === colId)
                            if (getCellValue) {
                                return getCellValue(row, colId, colDef) ?? ''
                            }
                            const value = (row as any)[colId]
                            // Handle null, undefined, and objects
                            if (value === null || value === undefined) return ''
                            if (typeof value === 'object') {
                                return JSON.stringify(value)
                            }
                            return String(value)
                        } catch (colError) {
                            console.warn(`Error processing column ${colId} for row ${rowIndex}:`, colError)
                            return ''
                        }
                    })
                } catch (rowError) {
                    console.warn(`Error processing row ${rowIndex}:`, rowError)
                    return columnIds.map(() => '')
                }
            })

            // Simulate progress for large exports
            if (rows.length >= 1000) {
                const progressInterval = setInterval(() => {
                    setProgress(prev => Math.min(prev + 10, 90))
                }, 100)
                
                setTimeout(() => clearInterval(progressInterval), 2000)
            }

            if (format === 'excel') {
                // Export to Excel with professional formatting
                const workbook = createWorkbook(moduleName)
                const worksheet = workbook.getWorksheet(1)
                if (!worksheet) {
                    throw new Error('Không thể tạo worksheet')
                }
                
                // Prepare format options
                const formatOptions: ExcelFormatOptions | undefined = options.professionalFormatting 
                    ? undefined // Use default formatting
                    : false // Disable formatting
                
                // Add data with formatting
                await addDataToWorksheetWithFormat(worksheet, headers, rows, {
                    formatOptions,
                    includeMetadata: options.includeMetadata,
                    metadata: options.includeMetadata ? {
                        moduleName,
                        exportDate: new Date().toLocaleString('vi-VN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                        }),
                        filters: currentFilters.length > 0 
                            ? currentFilters.map(f => `${f.id}: ${JSON.stringify(f.value)}`)
                            : undefined,
                        searchQuery: currentSearch || undefined,
                        recordCount: rows.length,
                        totalCount,
                    } : undefined,
                })
                
                const filename = generateFilename(`${moduleName}_export`)
                await downloadWorkbook(workbook, filename)
                
                // Save preferences after successful export
                saveExportPreferences(moduleName, {
                    selectedColumns: Array.from(selectedColumns),
                    columnOrder: Object.fromEntries(columnOrder),
                    exportOptions: options,
                    defaultMode: mode,
                    defaultFormat: format,
                })
                
                toast.success(`Đã xuất ${rows.length} dòng ra file Excel`)
            } else {
                // Export to PDF
                exportToPDF(headers, rows, {
                    title: moduleName,
                    filename: `${moduleName}_export_${new Date().toISOString().split('T')[0]}.pdf`,
                })
                toast.success(`Đã xuất ${rows.length} dòng ra file PDF`)
            }

            setProgress(100)
            setTimeout(() => {
                setIsExporting(false)
                setProgress(0)
                onOpenChange(false)
            }, 500)
        } catch (error: any) {
            console.error('Export error:', error)
            const errorMessage = error?.message || error?.toString() || 'Lỗi khi xuất dữ liệu'
            toast.error(errorMessage, {
                description: 'Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục',
                duration: 5000,
            })
            setIsExporting(false)
            setProgress(0)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-[1200px] !w-[90vw] max-w-[90vw] !h-[calc(95vh-4rem)] !max-h-[calc(95vh-4rem)] md:!h-[95vh] md:!max-h-[95vh] p-0 !flex !flex-col overflow-hidden !translate-y-[-50%] !grid-cols-none !grid-rows-none !z-[60]">
                <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
                    <DialogTitle>Xuất dữ liệu</DialogTitle>
                    <DialogDescription>
                        Chọn định dạng và dữ liệu cần xuất
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="px-6 py-4 space-y-6">
                            {/* Export Format and Mode - 2 columns grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Export Format */}
                    <div className="space-y-3">
                        <Label>Định dạng</Label>
                        <RadioGroup value={format} onValueChange={(value) => setFormat(value as ExportFormat)}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="excel" id="format-excel" />
                                <Label htmlFor="format-excel" className="flex items-center gap-2 cursor-pointer">
                                    <FileSpreadsheet className="h-4 w-4" />
                                    <span>Excel (.xlsx)</span>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="pdf" id="format-pdf" />
                                <Label htmlFor="format-pdf" className="flex items-center gap-2 cursor-pointer">
                                    <FileText className="h-4 w-4" />
                                    <span>PDF (.pdf)</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Export Mode */}
                    <div className="space-y-3">
                        <Label>Dữ liệu xuất</Label>
                        <RadioGroup value={mode} onValueChange={(value) => setMode(value as ExportMode)}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="all" id="mode-all" />
                                <Label htmlFor="mode-all" className="cursor-pointer">
                                    Tất cả ({totalCount} dòng)
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="filtered" id="mode-filtered" />
                                <Label htmlFor="mode-filtered" className="cursor-pointer">
                                    Đã lọc ({table.getFilteredRowModel().rows.length} dòng)
                                </Label>
                            </div>
                            {selectedRowIds.size > 0 && (
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="selected" id="mode-selected" />
                                    <Label htmlFor="mode-selected" className="cursor-pointer">
                                        Đã chọn ({selectedRowIds.size} dòng)
                                    </Label>
                                </div>
                            )}
                        </RadioGroup>
                                </div>
                    </div>

                    <Separator />

                            {/* Column Selection with Ordering - Wider */}
                            <div className="w-full space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Cột xuất</Label>
                                    <ExportTemplateSelector
                                        moduleName={moduleName}
                                        selectedColumns={selectedColumns}
                                        columnOrder={columnOrder}
                                        exportOptions={options}
                                        defaultMode={mode}
                                        defaultFormat={format}
                                        onLoadTemplate={(config) => {
                                            setSelectedColumns(new Set(config.selectedColumns))
                                            setColumnOrder(new Map(Object.entries(config.columnOrder)))
                                            setOptions(config.exportOptions)
                                            if (config.defaultMode) setMode(config.defaultMode)
                                            if (config.defaultFormat) setFormat(config.defaultFormat)
                                        }}
                                    />
                                </div>
                                <ColumnOrderSelector
                                    columns={availableColumns}
                                    selectedColumns={selectedColumns}
                                    onColumnToggle={handleColumnToggle}
                                    onColumnReorder={handleColumnReorder}
                                    onSelectAll={handleSelectAllColumns}
                                    onDeselectAll={handleDeselectAllColumns}
                                />
                            </div>

                            <Separator />

                            {/* Export Options */}
                            <div className="space-y-3">
                                <Label>Tùy chọn xuất</Label>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="export-formatting"
                                            checked={options.professionalFormatting ?? true}
                                            onCheckedChange={(checked) => {
                                                const newOptions = { ...options, professionalFormatting: checked as boolean }
                                                setOptions(newOptions)
                                                onExportOptionsChange?.(newOptions)
                                            }}
                                        />
                                        <Label htmlFor="export-formatting" className="cursor-pointer">
                                            Áp dụng định dạng chuyên nghiệp (màu header, border, font)
                                        </Label>
                        </div>
                                    <div className="flex items-center space-x-2">
                                            <Checkbox
                                            id="export-metadata"
                                            checked={options.includeMetadata ?? true}
                                            onCheckedChange={(checked) => {
                                                const newOptions = { ...options, includeMetadata: checked as boolean }
                                                setOptions(newOptions)
                                                onExportOptionsChange?.(newOptions)
                                            }}
                                        />
                                        <Label htmlFor="export-metadata" className="cursor-pointer">
                                            Bao gồm thông tin xuất (filters, search, ngày xuất)
                                            </Label>
                                        </div>
                                </div>
                    </div>

                    {/* Progress */}
                    {isExporting && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Đang xuất dữ liệu...</span>
                                <span>{progress}%</span>
                            </div>
                            <Progress value={progress} />
                        </div>
                    )}
                        </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t flex-shrink-0 flex flex-row items-center justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isExporting}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleExport}
                        disabled={isExporting || selectedColumns.size === 0}
                    >
                        {isExporting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xuất...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Xuất dữ liệu
                            </>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setShowPreview(true)}
                        disabled={isExporting || selectedColumns.size === 0}
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        Xem trước
                    </Button>
                </DialogFooter>
                
                {/* Export Preview Dialog */}
                {showPreview && (() => {
                    // Prepare export columns based on selected columns and order
                    const exportColumns = availableColumns
                        .filter(col => selectedColumns.has(col.id))
                        .sort((a, b) => a.order - b.order)
                    
                    const previewHeaders = exportColumns.map(col => col.title)
                    const previewColumnIds = exportColumns.map(col => col.id)
                    
                    return (
                        <ExportPreview
                            open={showPreview}
                            onOpenChange={setShowPreview}
                            data={getExportData()}
                            headers={previewHeaders}
                            columnIds={previewColumnIds}
                            getCellValue={getCellValue}
                            moduleName={moduleName}
                            rowCount={rowCount}
                            onExport={handleExport}
                        />
                    )
                })()}
            </DialogContent>
        </Dialog>
    )
}

// Memoize ExportDialog để tránh re-render khi props không thay đổi
export const MemoizedExportDialog = React.memo(ExportDialog) as typeof ExportDialog

