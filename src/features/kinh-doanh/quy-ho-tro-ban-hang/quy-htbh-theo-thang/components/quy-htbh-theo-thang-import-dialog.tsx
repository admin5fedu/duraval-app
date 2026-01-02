"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertQuyHTBHTheoThang } from "../actions/quy-htbh-theo-thang-excel-actions"
import { QuyHTBHTheoThang } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertQuyHTBHTheoThangReturn = ReturnType<typeof useBatchUpsertQuyHTBHTheoThang>

interface QuyHTBHTheoThangImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mutation?: UseBatchUpsertQuyHTBHTheoThangReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
  {
    dbField: "nam",
    excelNames: [
      "Năm", "Nam", "Year", "year", "Năm", "Nam",
      "Năm", "Nam", "YEAR", "YEAR"
    ],
    required: false,
    type: "number",
    description: "Năm (số nguyên, từ 2000-2100)",
  },
  {
    dbField: "thang",
    excelNames: [
      "Tháng", "Thang", "Month", "month", "Tháng", "Thang",
      "THÁNG", "THANG", "MONTH", "MONTH"
    ],
    required: false,
    type: "number",
    description: "Tháng (1-12)",
  },
  {
    dbField: "ten_nhan_vien",
    excelNames: [
      "Tên nhân viên", "Tên Nhân Viên", "Ten nhan vien", "Ten Nhan Vien",
      "Tên_nhân_viên", "Tên_Nhân_Viên", "Ten_nhan_vien", "Ten_Nhan_Vien",
      "Nhân viên", "Nhan vien", "Employee Name", "employee_name", "Name", "name"
    ],
    required: false,
    type: "text",
    description: "Tên nhân viên",
  },
  {
    dbField: "ma_phong",
    excelNames: [
      "Mã phòng", "Mã Phòng", "Ma phong", "Ma Phong",
      "Mã_phòng", "Mã_Phòng", "Ma_phong", "Ma_Phong",
      "Phòng", "Phong", "Department Code", "department_code", "Dept Code", "dept_code"
    ],
    required: false,
    type: "text",
    description: "Mã phòng",
  },
  {
    dbField: "ma_nhom",
    excelNames: [
      "Mã nhóm", "Mã Nhóm", "Ma nhom", "Ma Nhom",
      "Mã_nhóm", "Mã_Nhóm", "Ma_nhom", "Ma_Nhom",
      "Nhóm", "Nhom", "Group Code", "group_code"
    ],
    required: false,
    type: "text",
    description: "Mã nhóm",
  },
  {
    dbField: "quy",
    excelNames: [
      "Quỹ", "Quy", "Fund", "fund", "Quỹ", "Quy",
      "QUỸ", "QUY", "FUND", "FUND"
    ],
    required: false,
    type: "text",
    description: "Tên quỹ",
  },
  {
    dbField: "so_tien_quy",
    excelNames: [
      "Số tiền quỹ", "Số Tiền Quỹ", "So tien quy", "So Tien Quy",
      "Số_tiền_quỹ", "Số_Tiền_Quỹ", "So_tien_quy", "So_Tien_Quy",
      "Số tiền", "So tien", "Amount", "amount", "Fund Amount", "fund_amount"
    ],
    required: false,
    type: "number",
    description: "Số tiền quỹ (VND)",
  },
  {
    dbField: "da_dung",
    excelNames: [
      "Đã dùng", "Đã Dùng", "Da dung", "Da Dung",
      "Đã_dùng", "Đã_Dùng", "Da_dung", "Da_Dung",
      "Used", "used", "Spent", "spent", "Đã sử dụng", "Da su dung"
    ],
    required: false,
    type: "number",
    description: "Số tiền đã dùng (VND)",
  },
  {
    dbField: "ghi_chu",
    excelNames: [
      "Ghi chú", "Ghi Chú", "Ghi chu", "Ghi Chu",
      "Ghi_chú", "Ghi_Chú", "Ghi_chu", "Ghi_Chu",
      "Note", "note", "Notes", "notes", "Comment", "comment"
    ],
    required: false,
    type: "text",
    description: "Ghi chú",
  },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
  {
    header: "Năm",
    description: "Năm (số nguyên, từ 2000-2100)",
    required: false,
    example: 2024,
    type: "number",
  },
  {
    header: "Tháng",
    description: "Tháng (1-12)",
    required: false,
    example: 1,
    type: "number",
  },
  {
    header: "Tên nhân viên",
    description: "Tên nhân viên",
    required: false,
    example: "Nguyễn Văn A",
    type: "text",
  },
  {
    header: "Mã phòng",
    description: "Mã phòng",
    required: false,
    example: "PH001",
    type: "text",
  },
  {
    header: "Mã nhóm",
    description: "Mã nhóm",
    required: false,
    example: "NH001",
    type: "text",
  },
  {
    header: "Quỹ",
    description: "Tên quỹ",
    required: false,
    example: "Quỹ hỗ trợ bán hàng",
    type: "text",
  },
  {
    header: "Số tiền quỹ",
    description: "Số tiền quỹ (VND)",
    required: false,
    example: 10000000,
    type: "number",
  },
  {
    header: "Đã dùng",
    description: "Số tiền đã dùng (VND)",
    required: false,
    example: 5000000,
    type: "number",
  },
  {
    header: "Ghi chú",
    description: "Ghi chú",
    required: false,
    example: "Ghi chú về quỹ",
    type: "text",
  },
]

// Validate a row of data
function validateRow(row: Record<string, any>, _rowNumber: number): string[] {
  const errors: string[] = []

  // Validate năm
  if (row["nam"] !== null && row["nam"] !== undefined && row["nam"] !== "") {
    const nam = Number(row["nam"])
    if (isNaN(nam) || nam < 2000 || nam > 2100) {
      errors.push("Năm phải từ 2000 đến 2100")
    }
  }

  // Validate tháng
  if (row["thang"] !== null && row["thang"] !== undefined && row["thang"] !== "") {
    const thang = Number(row["thang"])
    if (isNaN(thang) || thang < 1 || thang > 12) {
      errors.push("Tháng phải từ 1 đến 12")
    }
  }

  // Validate số tiền quỹ
  if (row["so_tien_quy"] !== null && row["so_tien_quy"] !== undefined && row["so_tien_quy"] !== "") {
    const soTienQuy = typeof row["so_tien_quy"] === 'string' 
      ? parseFloat(row["so_tien_quy"].replace(/[,\s]/g, '')) 
      : Number(row["so_tien_quy"])
    if (isNaN(soTienQuy) || soTienQuy < 0) {
      errors.push("Số tiền quỹ phải >= 0")
    }
  }

  // Validate đã dùng
  if (row["da_dung"] !== null && row["da_dung"] !== undefined && row["da_dung"] !== "") {
    const daDung = typeof row["da_dung"] === 'string' 
      ? parseFloat(row["da_dung"].replace(/[,\s]/g, '')) 
      : Number(row["da_dung"])
    if (isNaN(daDung) || daDung < 0) {
      errors.push("Đã dùng phải >= 0")
    }
  }

  return errors
}

// Check for duplicates in the file
function checkDuplicates(_rows: Array<{ rowNumber: number; data: Record<string, any> }>): Map<string, number[]> {
  const duplicates = new Map<string, number[]>()
  // Có thể check duplicate theo id nếu có, hoặc theo năm + tháng + nhân viên
  // Tạm thời không check duplicate vì có thể có nhiều record cùng năm/tháng/nhân viên
  return duplicates
}

// Map Excel columns to database fields
function mapExcelToDb(
  rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>,
  options: ImportOptions
): Partial<QuyHTBHTheoThang>[] {
  return rows.map((row) => {
    const mapped: Partial<QuyHTBHTheoThang> = {}

    // Map fields (data is already mapped to db field names by ImportDialog)
    if (row.data["nam"] !== undefined && row.data["nam"] !== null && row.data["nam"] !== "") {
      mapped.nam = Number(row.data["nam"])
    }
    if (row.data["thang"] !== undefined && row.data["thang"] !== null && row.data["thang"] !== "") {
      mapped.thang = Number(row.data["thang"])
    }

    // Skip empty cells if option enabled
    if (!shouldSkipValue(row.data["ten_nhan_vien"], options.skipEmptyCells)) {
      mapped.ten_nhan_vien = String(row.data["ten_nhan_vien"]).trim()
    }
    if (!shouldSkipValue(row.data["ma_phong"], options.skipEmptyCells)) {
      mapped.ma_phong = String(row.data["ma_phong"]).trim()
    }
    if (!shouldSkipValue(row.data["ma_nhom"], options.skipEmptyCells)) {
      mapped.ma_nhom = String(row.data["ma_nhom"]).trim()
    }
    if (!shouldSkipValue(row.data["quy"], options.skipEmptyCells)) {
      mapped.quy = String(row.data["quy"]).trim()
    }

    // Parse numbers (remove commas)
    if (row.data["so_tien_quy"] !== undefined && row.data["so_tien_quy"] !== null && row.data["so_tien_quy"] !== "") {
      const value = typeof row.data["so_tien_quy"] === 'string' 
        ? parseFloat(row.data["so_tien_quy"].replace(/[,\s]/g, '')) 
        : Number(row.data["so_tien_quy"])
      if (!isNaN(value)) {
        mapped.so_tien_quy = value
      }
    }
    if (row.data["da_dung"] !== undefined && row.data["da_dung"] !== null && row.data["da_dung"] !== "") {
      const value = typeof row.data["da_dung"] === 'string' 
        ? parseFloat(row.data["da_dung"].replace(/[,\s]/g, '')) 
        : Number(row.data["da_dung"])
      if (!isNaN(value)) {
        mapped.da_dung = value
      }
    }

    // Tự động tính còn dư
    if (mapped.so_tien_quy !== undefined && mapped.so_tien_quy !== null && mapped.da_dung !== undefined && mapped.da_dung !== null) {
      mapped.con_du = mapped.so_tien_quy - mapped.da_dung
    }

    if (!shouldSkipValue(row.data["ghi_chu"], options.skipEmptyCells)) {
      mapped.ghi_chu = String(row.data["ghi_chu"]).trim()
    }

    return mapped
  })
}

export function QuyHTBHTheoThangImportDialog({ open, onOpenChange, mutation }: QuyHTBHTheoThangImportDialogProps) {
  const defaultMutation = useBatchUpsertQuyHTBHTheoThang()
  const batchUpsertMutation = mutation || defaultMutation
  const [importOptions, _setImportOptions] = React.useState<ImportOptions>({
    skipEmptyCells: true,
    upsertMode: 'update',
    dateFormat: 'dd/mm/yyyy',
  })

  const handleImport = async (rows: Partial<QuyHTBHTheoThang>[]): Promise<{
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
  const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<QuyHTBHTheoThang>[] => {
    return mapExcelToDb(rows, importOptions)
  }

  return (
    <ImportDialog<Partial<QuyHTBHTheoThang>>
      open={open}
      onOpenChange={onOpenChange}
      onImport={handleImport}
      validateRow={validateRow}
      checkDuplicates={checkDuplicates}
      transformData={transformData}
      moduleName="quỹ HTBH theo tháng"
      templateColumns={templateColumns}
      columnMappings={columnMappings}
      enableAutoMapping={true}
      importOptions={importOptions}
    />
  )
}

