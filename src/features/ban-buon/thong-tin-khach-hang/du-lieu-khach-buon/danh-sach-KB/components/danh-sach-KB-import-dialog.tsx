"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertDanhSachKB } from "../actions/danh-sach-KB-excel-actions"
import { DanhSachKB } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertDanhSachKBReturn = ReturnType<typeof useBatchUpsertDanhSachKB>

interface DanhSachKBImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mutation?: UseBatchUpsertDanhSachKBReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
  {
    dbField: "ma_so",
    excelNames: [
      "Mã số", "Mã Số", "Ma so", "Ma So",
      "Mã_số", "Mã_Số", "Ma_so", "Ma_So",
      "Mã", "Ma", "Code", "code"
    ],
    required: false,
    type: "text",
    description: "Mã số (không bắt buộc)",
  },
  {
    dbField: "ten_khach_buon",
    excelNames: [
      "Tên khách buôn", "Tên Khách Buôn", "Ten khach buon", "Ten Khach Buon",
      "Tên_khách_buôn", "Tên_Khách_Buôn", "Ten_khach_buon", "Ten_Khach_Buon",
      "Tên", "Ten", "Name", "name", "Khách buôn", "Khach buon"
    ],
    required: true,
    type: "text",
    description: "Tên khách buôn (bắt buộc)",
  },
  {
    dbField: "so_dien_thoai_1",
    excelNames: [
      "Số điện thoại 1", "Số Điện Thoại 1", "So dien thoai 1", "So Dien Thoai 1",
      "Số_điện_thoại_1", "Số_Điện_Thoại_1", "So_dien_thoai_1", "So_Dien_Thoai_1",
      "SĐT 1", "SDT 1", "Phone 1", "phone 1", "Tel 1", "tel 1"
    ],
    required: true,
    type: "text",
    description: "Số điện thoại 1 (bắt buộc)",
  },
  {
    dbField: "so_dien_thoai_2",
    excelNames: [
      "Số điện thoại 2", "Số Điện Thoại 2", "So dien thoai 2", "So Dien Thoai 2",
      "Số_điện_thoại_2", "Số_Điện_Thoại_2", "So_dien_thoai_2", "So_Dien_Thoai_2",
      "SĐT 2", "SDT 2", "Phone 2", "phone 2", "Tel 2", "tel 2"
    ],
    required: false,
    type: "text",
    description: "Số điện thoại 2 (không bắt buộc)",
  },
  {
    dbField: "loai_khach",
    excelNames: [
      "Loại khách", "Loại Khách", "Loai khach", "Loai Khach",
      "Loại_khách", "Loại_Khách", "Loai_khach", "Loai_Khach",
      "Loại", "Loai"
    ],
    required: false,
    type: "text",
    description: "Loại khách (không bắt buộc)",
  },
  {
    dbField: "nguon",
    excelNames: [
      "Nguồn", "Nguon", "Source", "source"
    ],
    required: false,
    type: "text",
    description: "Nguồn (không bắt buộc)",
  },
  {
    dbField: "nam_thanh_lap",
    excelNames: [
      "Năm thành lập", "Năm Thành Lập", "Nam thanh lap", "Nam Thanh Lap",
      "Năm_thành_lập", "Năm_Thành_Lập", "Nam_thanh_lap", "Nam_Thanh_Lap",
      "Năm", "Nam", "Year", "year"
    ],
    required: false,
    type: "number",
    description: "Năm thành lập (không bắt buộc)",
  },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
  {
    header: "Mã số",
    type: "text",
    required: false,
    description: "Mã số (không bắt buộc)",
  },
  {
    header: "Tên khách buôn",
    type: "text",
    required: true,
    description: "Tên khách buôn (bắt buộc)",
  },
  {
    header: "Số điện thoại 1",
    type: "text",
    required: true,
    description: "Số điện thoại 1 (bắt buộc)",
  },
  {
    header: "Số điện thoại 2",
    type: "text",
    required: false,
    description: "Số điện thoại 2 (không bắt buộc)",
  },
  {
    header: "Loại khách",
    type: "text",
    required: false,
    description: "Loại khách (không bắt buộc)",
  },
  {
    header: "Nguồn",
    type: "text",
    required: false,
    description: "Nguồn (không bắt buộc)",
  },
  {
    header: "Năm thành lập",
    type: "number",
    required: false,
    description: "Năm thành lập (không bắt buộc)",
  },
]

// Validate a single row
function validateRow(
  row: Record<string, any>,
  _rowNumber: number
): string[] {
  const errors: string[] = []

  // Required fields
  if (!row.ten_khach_buon || String(row.ten_khach_buon).trim() === "") {
    errors.push("Tên khách buôn là bắt buộc")
  }

  if (!row.so_dien_thoai_1 || String(row.so_dien_thoai_1).trim() === "") {
    errors.push("Số điện thoại 1 là bắt buộc")
  }

  return errors
}

// Check for duplicates within the import data (based on so_dien_thoai_1)
function checkDuplicates(
  rows: Array<{ rowNumber: number; data: Record<string, any> }>
): Map<string, number[]> {
  const duplicates = new Map<string, number[]>()
  const keyMap = new Map<string, number[]>()

  rows.forEach((row, index) => {
    const soDienThoai1 = row.data.so_dien_thoai_1

    if (soDienThoai1) {
      const key = String(soDienThoai1).trim().toLowerCase()
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
): Partial<DanhSachKB>[] {
  return rows.map((row) => {
    const mapped: Partial<DanhSachKB> = {}

    if (!shouldSkipValue(row.data["ma_so"], options.skipEmptyCells)) {
      mapped.ma_so = String(row.data["ma_so"]).trim()
    }

    if (!shouldSkipValue(row.data["ten_khach_buon"], options.skipEmptyCells)) {
      mapped.ten_khach_buon = String(row.data["ten_khach_buon"]).trim()
    }

    if (!shouldSkipValue(row.data["so_dien_thoai_1"], options.skipEmptyCells)) {
      mapped.so_dien_thoai_1 = String(row.data["so_dien_thoai_1"]).trim()
    }

    if (!shouldSkipValue(row.data["so_dien_thoai_2"], options.skipEmptyCells)) {
      mapped.so_dien_thoai_2 = String(row.data["so_dien_thoai_2"]).trim()
    }

    if (!shouldSkipValue(row.data["loai_khach"], options.skipEmptyCells)) {
      mapped.loai_khach = String(row.data["loai_khach"]).trim()
    }

    if (!shouldSkipValue(row.data["nguon"], options.skipEmptyCells)) {
      mapped.nguon = String(row.data["nguon"]).trim()
    }

    if (!shouldSkipValue(row.data["nam_thanh_lap"], options.skipEmptyCells)) {
      const value = row.data["nam_thanh_lap"]
      if (value !== null && value !== undefined && value !== "") {
        const numValue = typeof value === 'number' ? value : parseInt(String(value), 10)
        if (!isNaN(numValue)) {
          mapped.nam_thanh_lap = numValue
        }
      }
    }

    return mapped
  })
}

export function DanhSachKBImportDialog({ open, onOpenChange, mutation }: DanhSachKBImportDialogProps) {
  const defaultMutation = useBatchUpsertDanhSachKB()
  const batchUpsertMutation = mutation || defaultMutation
  const [importOptions, _setImportOptions] = React.useState<ImportOptions>({
    skipEmptyCells: true,
    upsertMode: 'update', // Update mode: update if exists, insert if not
  })

  const handleImport = async (rows: Partial<DanhSachKB>[]): Promise<{
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
  const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<DanhSachKB>[] => {
    return mapExcelToDb(rows, importOptions)
  }

  return (
    <ImportDialog<Partial<DanhSachKB>>
      open={open}
      onOpenChange={onOpenChange}
      onImport={handleImport}
      validateRow={validateRow}
      checkDuplicates={checkDuplicates}
      transformData={transformData}
      moduleName="khách buôn"
      templateColumns={templateColumns}
      columnMappings={columnMappings}
      enableAutoMapping={true}
      importOptions={importOptions}
    />
  )
}

