"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertMucDangKy } from "../actions/muc-dang-ky-excel-actions"
import { MucDangKy } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertMucDangKyReturn = ReturnType<typeof useBatchUpsertMucDangKy>

interface MucDangKyImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mutation?: UseBatchUpsertMucDangKyReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
  {
    dbField: "ma_hang",
    excelNames: [
      "Mã hạng", "Mã Hạng", "Ma hang", "Ma Hang",
      "Mã_hạng", "Mã_Hạng", "Ma_hang", "Ma_Hang",
      "Mã", "Ma", "Code", "code"
    ],
    required: false,
    type: "text",
    description: "Mã hạng (không bắt buộc)",
  },
  {
    dbField: "ten_hang",
    excelNames: [
      "Tên hạng", "Tên Hạng", "Ten hang", "Ten Hang",
      "Tên_hạng", "Tên_Hạng", "Ten_hang", "Ten_Hang",
      "Hạng", "Hang", "Name", "name", "Tên", "Ten", "Title", "title"
    ],
    required: true,
    type: "text",
    description: "Tên hạng (bắt buộc)",
  },
  {
    dbField: "doanh_so_min_quy",
    excelNames: [
      "Doanh số min (quý)", "Doanh Số Min (Quý)", "Doanh so min (quy)", "Doanh So Min (Quy)",
      "Doanh_số_min_(quý)", "Doanh_Số_Min_(Quý)", "Doanh_so_min_(quy)", "Doanh_So_Min_(Quy)",
      "Min quý", "Min Quy", "Min quy", "DoanhSoMinQuy"
    ],
    required: false,
    type: "number",
    description: "Doanh số min (quý) - không bắt buộc",
  },
  {
    dbField: "doanh_so_max_quy",
    excelNames: [
      "Doanh số max (quý)", "Doanh Số Max (Quý)", "Doanh so max (quy)", "Doanh So Max (Quy)",
      "Doanh_số_max_(quý)", "Doanh_Số_Max_(Quý)", "Doanh_so_max_(quy)", "Doanh_So_Max_(Quy)",
      "Max quý", "Max Quy", "Max quy", "DoanhSoMaxQuy"
    ],
    required: false,
    type: "number",
    description: "Doanh số max (quý) - không bắt buộc",
  },
  {
    dbField: "doanh_so_min_nam",
    excelNames: [
      "Doanh số min (năm)", "Doanh Số Min (Năm)", "Doanh so min (nam)", "Doanh So Min (Nam)",
      "Doanh_số_min_(năm)", "Doanh_Số_Min_(Năm)", "Doanh_so_min_(nam)", "Doanh_So_Min_(Nam)",
      "Min năm", "Min Nam", "Min nam", "DoanhSoMinNam"
    ],
    required: false,
    type: "number",
    description: "Doanh số min (năm) - không bắt buộc",
  },
  {
    dbField: "doanh_so_max_nam",
    excelNames: [
      "Doanh số max (năm)", "Doanh Số Max (Năm)", "Doanh so max (nam)", "Doanh So Max (Nam)",
      "Doanh_số_max_(năm)", "Doanh_Số_Max_(Năm)", "Doanh_so_max_(nam)", "Doanh_So_Max_(Nam)",
      "Max năm", "Max Nam", "Max nam", "DoanhSoMaxNam"
    ],
    required: false,
    type: "number",
    description: "Doanh số max (năm) - không bắt buộc",
  },
  {
    dbField: "ghi_chu",
    excelNames: [
      "Ghi chú", "Ghi Chú", "Ghi chu", "Ghi Chu",
      "Ghi_chú", "Ghi_Chú", "Ghi_chu", "Ghi_Chu",
      "Description", "description", "Desc", "desc", "Note", "note"
    ],
    required: false,
    type: "text",
    description: "Ghi chú (không bắt buộc)",
  },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
  {
    header: "Mã hạng",
    type: "text",
    required: false,
    description: "Mã hạng (không bắt buộc)",
  },
  {
    header: "Tên hạng",
    type: "text",
    required: true,
    description: "Tên hạng (bắt buộc)",
  },
  {
    header: "Doanh số min (quý)",
    type: "number",
    required: false,
    description: "Doanh số min (quý) - không bắt buộc",
  },
  {
    header: "Doanh số max (quý)",
    type: "number",
    required: false,
    description: "Doanh số max (quý) - không bắt buộc",
  },
  {
    header: "Doanh số min (năm)",
    type: "number",
    required: false,
    description: "Doanh số min (năm) - không bắt buộc",
  },
  {
    header: "Doanh số max (năm)",
    type: "number",
    required: false,
    description: "Doanh số max (năm) - không bắt buộc",
  },
  {
    header: "Ghi chú",
    type: "text",
    required: false,
    description: "Ghi chú (không bắt buộc)",
  },
]

// Validate a single row
function validateRow(
  row: Record<string, any>,
  _rowNumber: number
): string[] {
  const errors: string[] = []

  // Required fields
  if (!row.ten_hang || String(row.ten_hang).trim() === "") {
    errors.push("Tên hạng là bắt buộc")
  }

  return errors
}

// Check for duplicates within the import data
function checkDuplicates(
  rows: Array<{ rowNumber: number; data: Record<string, any> }>
): Map<string, number[]> {
  const duplicates = new Map<string, number[]>()
  const keyMap = new Map<string, number[]>()

  rows.forEach((row, index) => {
    const tenHang = row.data.ten_hang

    if (tenHang) {
      const key = String(tenHang).trim().toLowerCase()
      if (!keyMap.has(key)) {
        keyMap.set(key, [])
      }
      keyMap.get(key)!.push(index)
    }
  })

  keyMap.forEach((indices, key) => {
    if (indices.length > 1) {
      duplicates.set(key, indices)
    }
  })

  return duplicates
}

// Map Excel columns to database fields
function mapExcelToDb(
  rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>,
  options: ImportOptions
): Partial<MucDangKy>[] {
  return rows.map((row) => {
    const mapped: Partial<MucDangKy> = {}

    if (!shouldSkipValue(row.data["ma_hang"], options.skipEmptyCells)) {
      mapped.ma_hang = String(row.data["ma_hang"]).trim()
    }

    if (!shouldSkipValue(row.data["ten_hang"], options.skipEmptyCells)) {
      mapped.ten_hang = String(row.data["ten_hang"]).trim()
    }

    if (!shouldSkipValue(row.data["doanh_so_min_quy"], options.skipEmptyCells)) {
      const value = row.data["doanh_so_min_quy"]
      if (value !== null && value !== undefined && value !== "") {
        const numValue = typeof value === 'number' ? value : parseFloat(String(value))
        if (!isNaN(numValue)) {
          mapped.doanh_so_min_quy = numValue
        }
      }
    }

    if (!shouldSkipValue(row.data["doanh_so_max_quy"], options.skipEmptyCells)) {
      const value = row.data["doanh_so_max_quy"]
      if (value !== null && value !== undefined && value !== "") {
        const numValue = typeof value === 'number' ? value : parseFloat(String(value))
        if (!isNaN(numValue)) {
          mapped.doanh_so_max_quy = numValue
        }
      }
    }

    if (!shouldSkipValue(row.data["doanh_so_min_nam"], options.skipEmptyCells)) {
      const value = row.data["doanh_so_min_nam"]
      if (value !== null && value !== undefined && value !== "") {
        const numValue = typeof value === 'number' ? value : parseFloat(String(value))
        if (!isNaN(numValue)) {
          mapped.doanh_so_min_nam = numValue
        }
      }
    }

    if (!shouldSkipValue(row.data["doanh_so_max_nam"], options.skipEmptyCells)) {
      const value = row.data["doanh_so_max_nam"]
      if (value !== null && value !== undefined && value !== "") {
        const numValue = typeof value === 'number' ? value : parseFloat(String(value))
        if (!isNaN(numValue)) {
          mapped.doanh_so_max_nam = numValue
        }
      }
    }

    if (!shouldSkipValue(row.data["ghi_chu"], options.skipEmptyCells)) {
      mapped.ghi_chu = String(row.data["ghi_chu"]).trim()
    }

    return mapped
  })
}

export function MucDangKyImportDialog({ open, onOpenChange, mutation }: MucDangKyImportDialogProps) {
  const defaultMutation = useBatchUpsertMucDangKy()
  const batchUpsertMutation = mutation || defaultMutation
  const [importOptions, _setImportOptions] = React.useState<ImportOptions>({
    skipEmptyCells: true,
    upsertMode: 'update', // Update mode: update if exists, insert if not
  })

  const handleImport = async (rows: Partial<MucDangKy>[]): Promise<{
    success: boolean
    inserted: number
    updated: number
    failed: number
    errors?: Array<{ rowNumber: number; errors: string[] }>
  }> => {
    try {
      const result = await batchUpsertMutation.mutateAsync(rows)
      return {
        success: result.errors.length === 0,
        inserted: result.inserted,
        updated: result.updated,
        failed: result.errors.length,
        errors: result.errors.map((err) => ({
          rowNumber: err.row + 1, // Convert 0-based to 1-based
          errors: [err.error],
        })),
      }
    } catch (error) {
      throw error
    }
  }

  // Transform Excel data to database format
  const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<MucDangKy>[] => {
    return mapExcelToDb(rows, importOptions)
  }

  return (
    <ImportDialog<Partial<MucDangKy>>
      open={open}
      onOpenChange={onOpenChange}
      onImport={handleImport}
      validateRow={validateRow}
      checkDuplicates={checkDuplicates}
      transformData={transformData}
      moduleName="mức đăng ký"
      templateColumns={templateColumns}
      columnMappings={columnMappings}
      enableAutoMapping={true}
      importOptions={importOptions}
    />
  )
}

