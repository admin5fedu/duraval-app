"use client"

import * as React from "react"
import { FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, Upload, Download, FileX, FileCheck, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { parseExcelFile } from "@/lib/excel/exceljs-utils"
import { generateImportTemplate, exportImportErrors, type TemplateColumn } from "@/lib/excel/template-utils"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { mediumTextClass, smallTextClass, bodyTextClass } from "@/shared/utils/text-styles"
import { dialogContentSpacingClass, dialogPaddingClass, standardPaddingClass } from "@/shared/utils/spacing-styles"
import { autoMapColumns, type ColumnMapping, validateMapping } from "@/shared/utils/excel-column-mapper"
import { filterEmptyRows, cleanDataset } from "@/shared/utils/excel-data-cleaner"
import { parseDate } from "@/shared/utils/excel-date-parser"
import { 
  loadImportPreferences, 
  saveImportPreferences,
} from "@/shared/utils/import-preferences-manager"

interface ImportRow {
  rowNumber: number
  data: Record<string, any>
  errors: string[]
}

interface ParseResult {
  rows: ImportRow[]
  headers: string[]
  totalRows: number
}

export interface ImportOptions {
  skipEmptyCells: boolean // Bỏ qua ô trống khi update (giữ nguyên giá trị cũ)
  upsertMode: 'update' | 'skip' | 'error' // Update nếu trùng, Bỏ qua, hoặc Báo lỗi
  defaultValues?: Record<string, any> // Giá trị mặc định cho dòng mới
  dateFormat?: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd' | 'auto'
}

interface ImportDialogProps<TData> {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (rows: TData[]) => Promise<{
    success: boolean
    inserted: number
    updated: number
    failed: number
    errors?: Array<{ rowNumber: number; errors: string[] }>
  }>
  validateRow?: (row: Record<string, any>, rowNumber: number) => string[]
  checkDuplicates?: (rows: ImportRow[]) => Map<string, number[]>
  transformData?: (rows: ImportRow[]) => TData[]
  moduleName?: string
  expectedHeaders?: string[]
  templateColumns?: TemplateColumn[]
  // Auto-mapping
  columnMappings?: ColumnMapping[]
  enableAutoMapping?: boolean
  onMappingChange?: (mapping: Record<string, string>) => void
  // Options
  importOptions?: ImportOptions
  onOptionsChange?: (options: ImportOptions) => void
}

export function ImportDialog<TData extends Record<string, any>>({
  open,
  onOpenChange,
  onImport,
  validateRow,
  checkDuplicates,
  transformData,
  moduleName = "data",
  expectedHeaders,
  templateColumns,
  columnMappings,
  enableAutoMapping = true,
  onMappingChange,
  importOptions = {
    skipEmptyCells: true,
    upsertMode: 'update',
    dateFormat: 'dd/mm/yyyy',
  },
  onOptionsChange,
}: ImportDialogProps<TData>) {
  const [file, setFile] = React.useState<File | null>(null)
  const [parseResult, setParseResult] = React.useState<ParseResult | null>(null)
  const [isParsing, setIsParsing] = React.useState(false)
  const [isImporting, setIsImporting] = React.useState(false)
  const [importProgress, setImportProgress] = React.useState(0)
  const [importResult, setImportResult] = React.useState<{
    success: boolean
    inserted: number
    updated: number
    failed: number
    total: number
    errors: Array<{ rowNumber: number; errors: string[] }>
  } | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [isGeneratingTemplate, setIsGeneratingTemplate] = React.useState(false)
  const [isExportingErrors, setIsExportingErrors] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const [columnMapping, setColumnMapping] = React.useState<Record<string, string>>({})
  const [mappingValidation, setMappingValidation] = React.useState<{
    valid: boolean
    missingRequired: string[]
    unmapped: string[]
    lowConfidence: Array<{ excelColumn: string; dbField: string; confidence: number }>
  } | null>(null)
  const [options, setOptions] = React.useState<ImportOptions>(importOptions)

  const handleDownloadTemplate = async () => {
    if (!templateColumns || templateColumns.length === 0) {
      toast.error('Không có thông tin template để tải xuống')
      return
    }

    setIsGeneratingTemplate(true)
    try {
      await generateImportTemplate(templateColumns, moduleName)
      toast.success('Đã tải xuống template Excel')
    } catch (error) {
      console.error('Error generating template:', error)
      toast.error(error instanceof Error ? error.message : 'Lỗi khi tạo template')
    } finally {
      setIsGeneratingTemplate(false)
    }
  }

  const handleExportErrors = async () => {
    if (!importResult?.errors || importResult.errors.length === 0) {
      toast.error('Không có lỗi để xuất')
      return
    }

    setIsExportingErrors(true)
    try {
      await exportImportErrors(importResult.errors, `${moduleName}_import_errors`)
      toast.success('Đã xuất file lỗi ra Excel')
    } catch (error) {
      console.error('Error exporting errors:', error)
      toast.error(error instanceof Error ? error.message : 'Lỗi khi xuất file lỗi')
    } finally {
      setIsExportingErrors(false)
    }
  }

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile)
    setParseResult(null)
    setError(null)
    setImportResult(null)
    setIsParsing(true)

    try {
      const result = await parseExcelFile(selectedFile)

      // Clean data: filter empty rows
      const { cleaned: cleanedData, emptyRowsRemoved } = cleanDataset(result.sheetData)
      
      if (cleanedData.length < 2) {
        throw new Error('File Excel không có dữ liệu hợp lệ (sau khi loại bỏ dòng trống)')
      }

      // Get headers (first row)
      const headers = cleanedData[0] || []
      const dataRows = cleanedData.slice(1)

      // Auto-map columns if enabled and mappings provided
      let mapping: Record<string, string> = {}
      let mappingResult: {
        mapping: Record<string, string>
        unmapped: string[]
        lowConfidence: Array<{ excelColumn: string; dbField: string; confidence: number }>
      } | null = null

      if (enableAutoMapping && columnMappings && columnMappings.length > 0) {
        mappingResult = autoMapColumns(headers, columnMappings)
        mapping = mappingResult.mapping
        
        // Validate mapping
        const validation = validateMapping(mapping, columnMappings)
        setMappingValidation({
          ...validation,
          unmapped: mappingResult.unmapped,
          lowConfidence: mappingResult.lowConfidence,
        })
        
        setColumnMapping(mapping)
        if (onMappingChange) {
          onMappingChange(mapping)
        }

        // Warn if missing required fields
        if (!validation.valid) {
          toast.warning(
            `Thiếu các cột bắt buộc: ${validation.missingRequired.join(', ')}. Vui lòng kiểm tra mapping.`
          )
        }
      } else {
        // Use headers as-is (original behavior)
        headers.forEach(header => {
          if (header) {
            mapping[header] = header
          }
        })
        setColumnMapping(mapping)
      }

      // Parse rows
      const rows: ImportRow[] = []
      for (let i = 0; i < dataRows.length; i++) {
        const rowData = dataRows[i]
        const data: Record<string, any> = {}
        const errors: string[] = []

        // Map row data using column mapping
        headers.forEach((header, index) => {
          if (header) {
            const dbField = mapping[header] || header
            let value = rowData[index] ?? null
            
            // Clean cell value
            if (value !== null && value !== undefined) {
              if (typeof value === 'string') {
                value = value.trim()
                if (value === '' || value === '-' || value === 'N/A') {
                  value = null
                }
              }
            }
            
            data[dbField] = value
          }
        })

        // Validate row if validator provided
        if (validateRow) {
          const rowErrors = validateRow(data, i + 2) // +2 because we skipped header and 0-indexed
          errors.push(...rowErrors)
        }

        rows.push({
          rowNumber: i + 2, // +2 because header is row 1, and we're 0-indexed
          data,
          errors,
        })
      }

      // Check duplicates if checker provided
      if (checkDuplicates) {
        const duplicates = checkDuplicates(rows)
        if (duplicates.size > 0) {
          const duplicateErrors: string[] = []
          duplicates.forEach((indices, key) => {
            const rowNumbers = indices.map((i) => rows[i].rowNumber).join(", ")
            duplicateErrors.push(`Trùng lặp "${key}" ở các dòng: ${rowNumbers}`)
          })
          setError(`Có dữ liệu trùng lặp trong file:\n${duplicateErrors.join("\n")}`)
          setParseResult(null)
          return
        }
      }

      setParseResult({
        rows,
        headers,
        totalRows: rows.length,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi đọc file Excel")
      setParseResult(null)
    } finally {
      setIsParsing(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    await processFile(selectedFile)
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const excelFile = files.find(
      (f) =>
        f.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        f.type === 'application/vnd.ms-excel' ||
        f.name.match(/\.(xlsx|xls)$/i)
    )

    if (excelFile) {
      await processFile(excelFile)
    } else {
      toast.error('Vui lòng chọn file Excel (.xlsx, .xls)')
    }
  }

  const handleImport = async () => {
    if (!file || !parseResult) return

    setIsImporting(true)
    setImportProgress(0)
    setError(null)

    try {
      // Get valid rows
      const validRows = parseResult.rows.filter((r) => r.errors.length === 0)
      // Transform data if transform function provided, otherwise use data as-is
      const dataToImport = transformData 
        ? transformData(validRows)
        : validRows.map((r) => r.data as TData)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setImportProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const result = await onImport(dataToImport)
      
      // Save preferences after successful import
      if (result.success || result.inserted > 0 || result.updated > 0) {
        handleSavePreferences()
      }

      clearInterval(progressInterval)
      setImportProgress(100)

      setImportResult({
        success: result.success,
        inserted: result.inserted || 0,
        updated: result.updated || 0,
        failed: result.failed || 0,
        total: dataToImport.length,
        errors: result.errors || [],
      })

      if (result.success && result.failed === 0) {
        toast.success(
          `Nhập thành công ${result.inserted} bản ghi, cập nhật ${result.updated} bản ghi`
        )
        setTimeout(() => {
          onOpenChange(false)
          resetDialog()
        }, 2000)
      } else if (result.failed > 0) {
        toast.warning(
          `Nhập thành công ${result.inserted} bản ghi, ${result.failed} bản ghi lỗi`
        )
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Lỗi khi nhập dữ liệu"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsImporting(false)
    }
  }

  const resetDialog = () => {
    setFile(null)
    setParseResult(null)
    setError(null)
    setImportResult(null)
    setImportProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClose = () => {
    if (!isImporting) {
      onOpenChange(false)
      resetDialog()
    }
  }

  const validRows = parseResult?.rows.filter((r) => r.errors.length === 0) || []
  const invalidRows = parseResult?.rows.filter((r) => r.errors.length > 0) || []

  // Load preferences when dialog opens
  React.useEffect(() => {
    if (open) {
      const savedPrefs = loadImportPreferences(moduleName)
      if (savedPrefs) {
        setOptions(savedPrefs.importOptions)
        if (savedPrefs.columnMapping && Object.keys(savedPrefs.columnMapping).length > 0) {
          setColumnMapping(savedPrefs.columnMapping)
        }
      }
    }
  }, [open, moduleName])

  // Save preferences after successful import
  const handleSavePreferences = React.useCallback(() => {
    saveImportPreferences(moduleName, {
      importOptions: options,
      columnMapping: columnMapping,
    })
  }, [moduleName, options, columnMapping])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="!max-w-[1200px] !w-[90vw] max-w-[90vw] max-h-[95vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle>Nhập Dữ Liệu Từ Excel</DialogTitle>
          <DialogDescription>
            Tải lên file Excel (.xlsx) để nhập hoặc cập nhật dữ liệu hàng loạt
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden min-h-0">
          <ScrollArea className="h-full">
            <div className={cn(dialogContentSpacingClass(), "px-6 py-4")}>
          {/* Download Template Section */}
          {!file && !parseResult && !isParsing && !importResult && templateColumns && templateColumns.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border mb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                <div>
                  <p className={cn(mediumTextClass(), "font-medium")}>Chưa có file mẫu?</p>
                  <p className={cn(smallTextClass(), "text-muted-foreground")}>
                    Tải template Excel để đảm bảo định dạng đúng
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                disabled={isGeneratingTemplate}
              >
                {isGeneratingTemplate ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Tải Template
                  </>
                )}
              </Button>
            </div>
            )}

          {/* File Selection with Drag & Drop */}
          {!parseResult && !isParsing && !importResult && (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-4"
              >
                <FileSpreadsheet
                  className={cn(
                    "h-12 w-12 transition-colors",
                    isDragging ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <div>
                  <p className={mediumTextClass()}>
                    {file ? (
                      <span className="flex items-center gap-2">
                        <span>{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={(e) => {
                            e.stopPropagation()
                            setFile(null)
                            if (fileInputRef.current) {
                              fileInputRef.current.value = ''
                            }
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </span>
                    ) : isDragging ? (
                      "Thả file vào đây"
                    ) : (
                      "Kéo thả file Excel vào đây hoặc click để chọn"
                    )}
                  </p>
                  <p className={cn(smallTextClass(), "text-muted-foreground mt-1")}>
                    Hỗ trợ định dạng .xlsx, .xls (Tối đa 10MB)
                  </p>
                </div>
                {!file && (
                  <Button type="button" variant="outline" asChild>
                    <span>Chọn File</span>
                  </Button>
                )}
              </label>
            </div>
          )}

          {/* Parsing State */}
          {isParsing && (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className={mediumTextClass()}>Đang đọc file Excel...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className={cn("rounded-lg border border-destructive/50 bg-destructive/10", standardPaddingClass())}>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className={cn(mediumTextClass(), "text-destructive")}>Lỗi</p>
                  <p className={cn(bodyTextClass(), "text-destructive/80 whitespace-pre-line")}>
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mapping Validation Warning */}
          {mappingValidation && !mappingValidation.valid && (
            <div className="flex items-start gap-2 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg mb-4">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className={cn(mediumTextClass(), "text-yellow-900 dark:text-yellow-300 font-medium mb-1")}>
                  Cảnh báo: Mapping không đầy đủ
                </p>
                {mappingValidation.missingRequired.length > 0 && (
                  <p className={cn(smallTextClass(), "text-yellow-800 dark:text-yellow-400")}>
                    Thiếu các cột bắt buộc: <strong>{mappingValidation.missingRequired.join(', ')}</strong>
                  </p>
                )}
                {mappingValidation.unmapped.length > 0 && (
                  <p className={cn(smallTextClass(), "text-yellow-800 dark:text-yellow-400 mt-1")}>
                    Các cột chưa được map: {mappingValidation.unmapped.join(', ')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Low Confidence Mappings */}
          {mappingValidation && mappingValidation.lowConfidence.length > 0 && (
            <div className="flex items-start gap-2 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg mb-4">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className={cn(mediumTextClass(), "text-blue-900 dark:text-blue-300 font-medium mb-1")}>
                  Mapping có độ tin cậy thấp
                </p>
                <div className="space-y-1">
                  {mappingValidation.lowConfidence.slice(0, 5).map((item, idx) => (
                    <p key={idx} className={cn(smallTextClass(), "text-blue-800 dark:text-blue-400")}>
                      "{item.excelColumn}" → "{item.dbField}" ({(item.confidence * 100).toFixed(0)}%)
                    </p>
                  ))}
                  {mappingValidation.lowConfidence.length > 5 && (
                    <p className={cn(smallTextClass(), "text-blue-800 dark:text-blue-400")}>
                      ... và {mappingValidation.lowConfidence.length - 5} mapping khác
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Parse Result */}
          {parseResult && !importResult && (
            <div className={dialogContentSpacingClass()}>
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <p className={cn(smallTextClass(), "text-muted-foreground mb-1")}>Tổng số dòng</p>
                  <p className="text-2xl font-bold">{parseResult.totalRows}</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                  <p className={cn(smallTextClass(), "text-green-700 dark:text-green-400 mb-1")}>Hợp lệ</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {validRows.length}
                  </p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                  <p className={cn(smallTextClass(), "text-red-700 dark:text-red-400 mb-1")}>Lỗi</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                    {invalidRows.length}
                  </p>
                </div>
              </div>

              {/* Warning if has errors */}
              {invalidRows.length > 0 && (
                <div className="flex items-start gap-2 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg mb-4">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className={cn(mediumTextClass(), "text-yellow-900 dark:text-yellow-300 font-medium")}>
                      Lưu ý
                    </p>
                    <p className={cn(smallTextClass(), "text-yellow-800 dark:text-yellow-400 mt-1")}>
                      Chỉ các dòng hợp lệ sẽ được nhập vào hệ thống. Vui lòng kiểm tra và sửa các lỗi trước khi tiếp tục.
                    </p>
                  </div>
                </div>
              )}

              {/* Invalid Rows Details */}
              {invalidRows.length > 0 && (
                <div className={cn("rounded-lg border border-destructive/50 bg-destructive/10", standardPaddingClass())}>
                  <div className="flex items-center justify-between mb-3">
                    <p className={cn(mediumTextClass(), "text-destructive font-medium")}>
                      Chi tiết lỗi ({invalidRows.length} dòng):
                    </p>
                  </div>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {invalidRows.map((row) => (
                        <div key={row.rowNumber} className={smallTextClass()}>
                          <span className="font-medium text-destructive">Dòng {row.rowNumber}:</span>{" "}
                          <span className="text-destructive/80">{row.errors.join(", ")}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className={dialogContentSpacingClass()}>
              <div className={cn(
                "flex items-start gap-3 p-4 rounded-lg border mb-4",
                importResult.success && importResult.failed === 0
                  ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                  : "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900"
              )}>
                {importResult.success && importResult.failed === 0 ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
                )}
                <div className="flex-1">
                  <p className={cn(
                    mediumTextClass(),
                    "font-medium",
                    importResult.success && importResult.failed === 0
                      ? "text-green-900 dark:text-green-300"
                      : "text-yellow-900 dark:text-yellow-300"
                  )}>
                    {importResult.success && importResult.failed === 0
                      ? "Nhập dữ liệu thành công!"
                      : "Nhập dữ liệu hoàn tất với một số lỗi"}
                  </p>
                  <p className={cn(
                    smallTextClass(),
                    "mt-1",
                    importResult.success && importResult.failed === 0
                      ? "text-green-800 dark:text-green-400"
                      : "text-yellow-800 dark:text-yellow-400"
                  )}>
                    Thành công: {importResult.inserted} bản ghi | 
                    {importResult.updated > 0 && ` Cập nhật: ${importResult.updated} bản ghi |`}
                    {importResult.failed > 0 && ` Thất bại: ${importResult.failed} bản ghi`}
                  </p>
                </div>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <div className={cn("rounded-lg border border-destructive/50 bg-destructive/10", standardPaddingClass())}>
                  <div className="flex items-center justify-between mb-3">
                    <p className={cn(mediumTextClass(), "text-destructive font-medium")}>
                      Chi tiết lỗi ({importResult.errors.length}):
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportErrors}
                      disabled={isExportingErrors}
                    >
                      {isExportingErrors ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang xuất...
                        </>
                      ) : (
                        <>
                          <FileX className="mr-2 h-4 w-4" />
                          Xuất lỗi ra Excel
                        </>
                      )}
                    </Button>
                  </div>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {importResult.errors.map((err, idx) => (
                      <div key={idx} className={smallTextClass()}>
                          <span className="font-medium text-destructive">Dòng {err.rowNumber}:</span>{" "}
                          <span className="text-destructive/80">{err.errors.join(", ")}</span>
                      </div>
                    ))}
                    </div>
                  </ScrollArea>
                  {importResult.errors.length > 20 && (
                    <p className={cn(smallTextClass(), "text-muted-foreground mt-2 text-center")}>
                      ... và {importResult.errors.length - 20} lỗi khác (xuất file để xem đầy đủ)
                      </p>
                    )}
                </div>
              )}
            </div>
          )}

          {/* Progress */}
          {(isImporting || importProgress > 0) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Đang nhập dữ liệu...</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} />
            </div>
          )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={handleClose} disabled={isImporting}>
            {importResult ? "Đóng" : "Hủy"}
          </Button>
          {parseResult && !importResult && (
            <Button
              onClick={handleImport}
              disabled={isImporting || validRows.length === 0}
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang nhập...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Nhập dữ liệu ({validRows.length} dòng)
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

