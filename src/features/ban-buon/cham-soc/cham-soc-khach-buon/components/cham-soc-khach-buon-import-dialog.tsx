"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertChamSocKhachBuon } from "../actions/cham-soc-khach-buon-excel-actions"
import { CreateChamSocKhachBuonInput } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertChamSocKhachBuonReturn = ReturnType<typeof useBatchUpsertChamSocKhachBuon>

interface ChamSocKhachBuonImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mutation?: UseBatchUpsertChamSocKhachBuonReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
  {
    dbField: "ngay",
    excelNames: ["Ngày", "Ngay", "Date", "date"],
    required: false,
    type: "text",
    description: "Ngày (format: YYYY-MM-DD hoặc DD/MM/YYYY)",
  },
  {
    dbField: "nhan_vien_id",
    excelNames: [
      "Nhân viên ID", "Nhan vien ID", "Nhân Viên ID", "Nhan Vien ID",
      "Nhân_viên_ID", "Nhan_vien_ID", "Nhân_Viên_ID",
      "Nhân viên", "Nhan vien", "Employee ID", "employee id",
    ],
    required: false,
    type: "number",
    description: "ID nhân viên",
  },
  {
    dbField: "khach_buon_id",
    excelNames: [
      "Khách buôn ID", "Khach buon ID", "Khách Buôn ID", "Khach Buon ID",
      "Khách_buôn_ID", "Khach_buon_ID",
      "Khách buôn", "Khach buon", "Customer ID", "customer id",
    ],
    required: false,
    type: "number",
    description: "ID khách buôn",
  },
  {
    dbField: "hinh_thuc",
    excelNames: ["Hình thức", "Hinh thuc", "Hình Thức", "Hinh Thuc", "Form", "form"],
    required: false,
    type: "text",
    description: "Hình thức chăm sóc",
  },
  {
    dbField: "muc_tieu",
    excelNames: [
      "Mục tiêu", "Muc tieu", "Mục Tiêu", "Muc Tieu",
      "Mục_tiêu", "Muc_tieu", "Mục_Tiêu",
      "Goal", "goal", "Objective", "objective",
    ],
    required: false,
    type: "text",
    description: "Mục tiêu",
  },
  {
    dbField: "ket_qua",
    excelNames: ["Kết quả", "Ket qua", "Kết Quả", "Ket Qua", "Result", "result"],
    required: false,
    type: "text",
    description: "Kết quả",
  },
  {
    dbField: "hanh_dong_tiep_theo",
    excelNames: [
      "Hành động tiếp theo", "Hanh dong tiep theo", "Hành Động Tiếp Theo",
      "Next action", "next action", "Action next",
    ],
    required: false,
    type: "text",
    description: "Hành động tiếp theo",
  },
  {
    dbField: "hen_cs_lai",
    excelNames: ["Hẹn CS lại", "Hen cs lai", "Hẹn CS Lại", "Next appointment", "next appointment"],
    required: false,
    type: "text",
    description: "Hẹn chăm sóc lại (format: YYYY-MM-DD)",
  },
  {
    dbField: "gps",
    excelNames: ["GPS", "gps", "Location", "location", "Tọa độ", "Toa do"],
    required: false,
    type: "text",
    description: "GPS coordinates",
  },
  {
    dbField: "hinh_anh",
    excelNames: ["Hình ảnh", "Hinh anh", "Hình Ảnh", "Image", "image", "Photo", "photo"],
    required: false,
    type: "text",
    description: "URL hình ảnh",
  },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
  {
    header: "Ngày",
    type: "text",
    required: false,
    description: "Ngày (format: YYYY-MM-DD hoặc DD/MM/YYYY)",
  },
  {
    header: "Nhân viên ID",
    type: "number",
    required: false,
    description: "ID nhân viên",
  },
  {
    header: "Khách buôn ID",
    type: "number",
    required: false,
    description: "ID khách buôn",
  },
  {
    header: "Hình thức",
    type: "text",
    required: false,
    description: "Hình thức chăm sóc",
  },
  {
    header: "Mục tiêu",
    type: "text",
    required: false,
    description: "Mục tiêu",
  },
  {
    header: "Kết quả",
    type: "text",
    required: false,
    description: "Kết quả",
  },
  {
    header: "Hành động tiếp theo",
    type: "text",
    required: false,
    description: "Hành động tiếp theo",
  },
  {
    header: "Hẹn CS lại",
    type: "text",
    required: false,
    description: "Hẹn chăm sóc lại (format: YYYY-MM-DD)",
  },
  {
    header: "GPS",
    type: "text",
    required: false,
    description: "GPS coordinates",
  },
  {
    header: "Hình ảnh",
    type: "text",
    required: false,
    description: "URL hình ảnh",
  },
]

// Validate a single row
function validateRow(_row: Record<string, any>, _rowNumber: number): string[] {
  const errors: string[] = []
  // No required fields for chăm sóc khách buôn, but we can add validation here if needed
  return errors
}

// Check for duplicates within the import data
function checkDuplicates(_rows: Array<{ rowNumber: number; data: Record<string, any> }>): Map<string, number[]> {
  return new Map()
}

// Map Excel columns to database fields
function mapExcelToDb(
  rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>,
  options: ImportOptions
): Partial<CreateChamSocKhachBuonInput>[] {
  return rows.map((row) => {
    const mapped: Partial<CreateChamSocKhachBuonInput> = {}

    if (!shouldSkipValue(row.data["ngay"], options.skipEmptyCells)) {
      mapped.ngay = String(row.data["ngay"]).trim() || null
    }

    if (!shouldSkipValue(row.data["nhan_vien_id"], options.skipEmptyCells)) {
      const value = row.data["nhan_vien_id"]
      const numValue = typeof value === 'number' ? value : parseFloat(String(value))
      if (!isNaN(numValue)) {
        mapped.nhan_vien_id = numValue
      }
    }

    if (!shouldSkipValue(row.data["khach_buon_id"], options.skipEmptyCells)) {
      const value = row.data["khach_buon_id"]
      const numValue = typeof value === 'number' ? value : parseFloat(String(value))
      if (!isNaN(numValue)) {
        mapped.khach_buon_id = numValue
      }
    }

    if (!shouldSkipValue(row.data["hinh_thuc"], options.skipEmptyCells)) {
      mapped.hinh_thuc = String(row.data["hinh_thuc"]).trim() || ""
    }

    if (!shouldSkipValue(row.data["muc_tieu"], options.skipEmptyCells)) {
      mapped.muc_tieu = String(row.data["muc_tieu"]).trim() || ""
    }

    if (!shouldSkipValue(row.data["ket_qua"], options.skipEmptyCells)) {
      mapped.ket_qua = String(row.data["ket_qua"]).trim() || ""
    }

    if (!shouldSkipValue(row.data["hanh_dong_tiep_theo"], options.skipEmptyCells)) {
      mapped.hanh_dong_tiep_theo = String(row.data["hanh_dong_tiep_theo"]).trim() || null
    }

    if (!shouldSkipValue(row.data["hen_cs_lai"], options.skipEmptyCells)) {
      mapped.hen_cs_lai = String(row.data["hen_cs_lai"]).trim() || null
    }

    if (!shouldSkipValue(row.data["gps"], options.skipEmptyCells)) {
      mapped.gps = String(row.data["gps"]).trim() || null
    }

    if (!shouldSkipValue(row.data["hinh_anh"], options.skipEmptyCells)) {
      mapped.hinh_anh = String(row.data["hinh_anh"]).trim() || null
    }

    return mapped
  })
}

export function ChamSocKhachBuonImportDialog({ open, onOpenChange, mutation }: ChamSocKhachBuonImportDialogProps) {
  const defaultMutation = useBatchUpsertChamSocKhachBuon()
  const batchUpsertMutation = mutation || defaultMutation
  const [importOptions, _setImportOptions] = React.useState<ImportOptions>({
    skipEmptyCells: true,
    upsertMode: 'error', // Error mode: always insert new records (no update)
  })

  const handleImport = async (rows: Partial<CreateChamSocKhachBuonInput>[]): Promise<{
    success: boolean
    inserted: number
    updated: number
    failed: number
    errors?: Array<{ rowNumber: number; errors: string[] }>
  }> => {
    try {
      const result = await batchUpsertMutation.mutateAsync(rows as any)
      return {
        success: result.errors.length === 0,
        inserted: result.inserted,
        updated: result.updated,
        failed: result.errors.length,
        errors: result.errors.map((err) => ({
          rowNumber: err.row,
          errors: [err.error],
        })),
      }
    } catch (error) {
      throw error
    }
  }

  // Transform Excel data to database format
  const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<CreateChamSocKhachBuonInput>[] => {
    return mapExcelToDb(rows, importOptions)
  }

  // Validate row
  const validateRowWithMap = (row: Record<string, any>, rowNumber: number): string[] => {
    return validateRow(row, rowNumber)
  }

  return (
    <ImportDialog<Partial<CreateChamSocKhachBuonInput>>
      open={open}
      onOpenChange={onOpenChange}
      onImport={handleImport}
      validateRow={validateRowWithMap}
      checkDuplicates={checkDuplicates}
      transformData={transformData}
      moduleName="chăm sóc khách buôn"
      templateColumns={templateColumns}
      columnMappings={columnMappings}
    />
  )
}
