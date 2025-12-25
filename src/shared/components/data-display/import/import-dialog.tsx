"use client"

import * as React from "react"
import { FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, Upload, Download, FileX } from "lucide-react"
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
import { parseExcelFile } from "@/lib/excel/exceljs-utils"
import { generateImportTemplate, exportImportErrors, type TemplateColumn } from "@/lib/excel/template-utils"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { mediumTextClass, smallTextClass, bodyTextClass } from "@/shared/utils/text-styles"
import { dialogContentSpacingClass, dialogPaddingClass, standardPaddingClass } from "@/shared/utils/spacing-styles"

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
  moduleName?: string
  expectedHeaders?: string[]
  templateColumns?: TemplateColumn[]
}

export function ImportDialog<TData extends Record<string, any>>({
  open,
  onOpenChange,
  onImport,
  validateRow,
  checkDuplicates,
  moduleName = "data",
  expectedHeaders,
  templateColumns,
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setParseResult(null)
    setError(null)
    setImportResult(null)
    setIsParsing(true)

    try {
      const result = await parseExcelFile(selectedFile)

      // Convert to ImportRow format
      const rows: ImportRow[] = []
      const headers = result.sheetData[0] || []

      // Validate headers if expectedHeaders provided
      if (expectedHeaders && expectedHeaders.length > 0) {
        const missingHeaders = expectedHeaders.filter(
          (h) => !headers.includes(h)
        )
        if (missingHeaders.length > 0) {
          throw new Error(
            `Thiếu các cột bắt buộc: ${missingHeaders.join(", ")}`
          )
        }
      }

      // Parse rows (skip header row)
      for (let i = 1; i < result.sheetData.length; i++) {
        const rowData = result.sheetData[i]
        const data: Record<string, any> = {}
        const errors: string[] = []

        // Map row data to object
        headers.forEach((header, index) => {
          if (header) {
            data[header] = rowData[index] ?? null
          }
        })

        // Validate row if validator provided
        if (validateRow) {
          const rowErrors = validateRow(data, i + 1)
          errors.push(...rowErrors)
        }

        rows.push({
          rowNumber: i + 1,
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

  const handleImport = async () => {
    if (!file || !parseResult) return

    setIsImporting(true)
    setImportProgress(0)
    setError(null)

    try {
      // Get valid rows
      const validRows = parseResult.rows.filter((r) => r.errors.length === 0)
      const dataToImport = validRows.map((r) => r.data as TData)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setImportProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const result = await onImport(dataToImport)

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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nhập Dữ Liệu Từ Excel</DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>Tải lên file Excel (.xlsx) để nhập hoặc cập nhật dữ liệu hàng loạt</span>
            {templateColumns && templateColumns.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                disabled={isGeneratingTemplate}
                className="ml-4"
              >
                {isGeneratingTemplate ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Tải template
                  </>
                )}
              </Button>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className={cn(dialogContentSpacingClass(), "py-4")}>
          {/* File Selection */}
          {!parseResult && !isParsing && !importResult && (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
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
                <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
                <div>
                  <p className={mediumTextClass()}>
                    {file ? file.name : "Chọn file Excel"}
                  </p>
                  <p className={cn(smallTextClass(), "text-muted-foreground mt-1")}>
                    Hỗ trợ định dạng .xlsx, .xls (tối đa 10MB)
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

          {/* Parse Result */}
          {parseResult && !importResult && (
            <div className={dialogContentSpacingClass()}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={mediumTextClass()}>
                    Đã đọc {parseResult.totalRows} dòng
                  </p>
                  <p className={cn(smallTextClass(), "text-muted-foreground")}>
                    {validRows.length} dòng hợp lệ, {invalidRows.length} dòng có lỗi
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={validRows.length > 0 ? "default" : "destructive"}>
                    {validRows.length} hợp lệ
                  </Badge>
                  {invalidRows.length > 0 && (
                    <Badge variant="destructive">{invalidRows.length} lỗi</Badge>
                  )}
                </div>
              </div>

              {/* Invalid Rows */}
              {invalidRows.length > 0 && (
                <div className={cn("rounded-lg border border-destructive/50 bg-destructive/10 max-h-48 overflow-y-auto", standardPaddingClass())}>
                  <p className={cn(mediumTextClass(), "text-destructive mb-2")}>
                    Các dòng có lỗi:
                  </p>
                  <div className="space-y-1">
                    {invalidRows.slice(0, 10).map((row) => (
                      <div key={row.rowNumber} className={smallTextClass()}>
                        <span className="font-medium">Dòng {row.rowNumber}:</span>{" "}
                        {row.errors.join(", ")}
                      </div>
                    ))}
                    {invalidRows.length > 10 && (
                      <p className={cn(smallTextClass(), "text-muted-foreground")}>
                        ... và {invalidRows.length - 10} dòng khác
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className={dialogContentSpacingClass()}>
              <div className="flex items-center gap-3">
                {importResult.success && importResult.failed === 0 ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-warning" />
                )}
                <div>
                  <p className={mediumTextClass()}>
                    {importResult.success && importResult.failed === 0
                      ? "Nhập dữ liệu thành công"
                      : "Nhập dữ liệu hoàn tất với một số lỗi"}
                  </p>
                  <p className={cn(smallTextClass(), "text-muted-foreground")}>
                    Đã thêm: {importResult.inserted}, Đã cập nhật:{" "}
                    {importResult.updated}, Lỗi: {importResult.failed}
                  </p>
                </div>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <div className={cn("rounded-lg border border-destructive/50 bg-destructive/10", standardPaddingClass())}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={cn(mediumTextClass(), "text-destructive")}>
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
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {importResult.errors.slice(0, 10).map((err, idx) => (
                      <div key={idx} className={smallTextClass()}>
                        <span className="font-medium">Dòng {err.rowNumber}:</span>{" "}
                        {err.errors.join(", ")}
                      </div>
                    ))}
                    {importResult.errors.length > 10 && (
                      <p className={cn(smallTextClass(), "text-muted-foreground mt-2")}>
                        ... và {importResult.errors.length - 10} lỗi khác (xuất file để xem đầy đủ)
                      </p>
                    )}
                  </div>
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

        <DialogFooter>
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

