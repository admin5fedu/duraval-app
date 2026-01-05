"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertKeHoachThiTruong } from "../actions/ke-hoach-thi-truong-excel-actions"
import { CreateKeHoachThiTruongInput } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertKeHoachThiTruongReturn = ReturnType<typeof useBatchUpsertKeHoachThiTruong>

interface KeHoachThiTruongImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mutation?: UseBatchUpsertKeHoachThiTruongReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
  {
    dbField: "ngay",
    excelNames: [
      "Ngày", "Ngay", "Date", "date",
      "Ngày thực hiện", "Ngay thuc hien", "Ngày Thực Hiện",
    ],
    required: true,
    type: "text",
    description: "Ngày (bắt buộc, format: YYYY-MM-DD hoặc DD/MM/YYYY)",
  },
  {
    dbField: "nhan_vien_id",
    excelNames: [
      "Nhân viên ID", "Nhan vien ID", "Nhân Viên ID", "Nhan Vien ID",
      "Nhân_viên_ID", "Nhan_vien_ID", "Nhân_Viên_ID",
      "Nhân viên", "Nhan vien", "Employee ID", "employee id",
    ],
    required: true,
    type: "number",
    description: "ID nhân viên (bắt buộc)",
  },
  {
    dbField: "buoi",
    excelNames: [
      "Buổi", "Buoi", "Buổi làm việc", "Buoi lam viec",
      "Thời gian", "Thoi gian", "Time", "time",
    ],
    required: true,
    type: "text",
    description: "Buổi (bắt buộc): Sáng hoặc Chiều",
  },
  {
    dbField: "hanh_dong",
    excelNames: [
      "Hành động", "Hanh dong", "Hành Động", "Hanh Dong",
      "Hành_động", "Hanh_dong", "Hành_Động",
      "Action", "action", "Hoạt động", "Hoat dong",
    ],
    required: true,
    type: "text",
    description: "Hành động (bắt buộc): Đi thị trường hoặc Làm văn phòng",
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
    description: "ID khách buôn (không bắt buộc, chỉ khi hành động là 'Đi thị trường')",
  },
  {
    dbField: "tsn_tinh_thanh_id",
    excelNames: [
      "Tỉnh thành ID", "Tinh thanh ID", "Tỉnh Thành ID", "Tinh Thanh ID",
      "Tỉnh_thành_ID", "Tinh_thanh_ID",
      "Tỉnh thành", "Tinh thanh", "Province ID", "province id",
    ],
    required: false,
    type: "number",
    description: "ID tỉnh thành (không bắt buộc)",
  },
  {
    dbField: "muc_tieu",
    excelNames: [
      "Mục tiêu", "Muc tieu", "Mục Tiêu", "Muc Tieu",
      "Mục_tiêu", "Muc_tieu", "Mục_Tiêu",
      "Goal", "goal", "Objective", "objective",
    ],
    required: true,
    type: "text",
    description: "Mục tiêu (bắt buộc)",
  },
  {
    dbField: "ghi_chu",
    excelNames: [
      "Ghi chú", "Ghi chu", "Ghi Chú", "Ghi Chu",
      "Ghi_chú", "Ghi_chu",
      "Note", "note", "Notes", "notes", "Comment", "comment",
    ],
    required: false,
    type: "text",
    description: "Ghi chú (không bắt buộc)",
  },
  {
    dbField: "trang_thai",
    excelNames: [
      "Trạng thái", "Trang thai", "Trạng Thái", "Trang Thai",
      "Trạng_thái", "Trang_thai",
      "Status", "status", "State", "state",
    ],
    required: false,
    type: "text",
    description: "Trạng thái (không bắt buộc): Chưa thực hiện, Đã thực hiện, Hủy",
  },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
  {
    header: "Ngày",
    type: "text",
    required: true,
    description: "Ngày (bắt buộc, format: YYYY-MM-DD hoặc DD/MM/YYYY)",
  },
  {
    header: "Nhân viên ID",
    type: "number",
    required: true,
    description: "ID nhân viên (bắt buộc)",
  },
  {
    header: "Buổi",
    type: "text",
    required: true,
    description: "Buổi (bắt buộc): Sáng hoặc Chiều",
  },
  {
    header: "Hành động",
    type: "text",
    required: true,
    description: "Hành động (bắt buộc): Đi thị trường hoặc Làm văn phòng",
  },
  {
    header: "Khách buôn ID",
    type: "number",
    required: false,
    description: "ID khách buôn (không bắt buộc, chỉ khi hành động là 'Đi thị trường')",
  },
  {
    header: "Tỉnh thành ID",
    type: "number",
    required: false,
    description: "ID tỉnh thành (không bắt buộc)",
  },
  {
    header: "Mục tiêu",
    type: "text",
    required: true,
    description: "Mục tiêu (bắt buộc)",
  },
  {
    header: "Ghi chú",
    type: "text",
    required: false,
    description: "Ghi chú (không bắt buộc)",
  },
  {
    header: "Trạng thái",
    type: "text",
    required: false,
    description: "Trạng thái (không bắt buộc): Chưa thực hiện, Đã thực hiện, Hủy",
  },
]

// Validate a single row
function validateRow(
  row: Record<string, any>,
  _rowNumber: number
): string[] {
  const errors: string[] = []

  // Required fields
  if (!row.ngay || String(row.ngay).trim() === "") {
    errors.push("Ngày là bắt buộc")
  }

  if (!row.nhan_vien_id || String(row.nhan_vien_id).trim() === "") {
    errors.push("Nhân viên ID là bắt buộc")
  } else {
    const nhanVienId = parseFloat(String(row.nhan_vien_id))
    if (isNaN(nhanVienId)) {
      errors.push("Nhân viên ID phải là số")
    }
  }

  if (!row.buoi || String(row.buoi).trim() === "") {
    errors.push("Buổi là bắt buộc")
  } else {
    const buoi = String(row.buoi).trim()
    if (buoi !== "Sáng" && buoi !== "Chiều") {
      errors.push("Buổi phải là 'Sáng' hoặc 'Chiều'")
    }
  }

  if (!row.hanh_dong || String(row.hanh_dong).trim() === "") {
    errors.push("Hành động là bắt buộc")
  } else {
    const hanhDong = String(row.hanh_dong).trim()
    if (hanhDong !== "Đi thị trường" && hanhDong !== "Làm văn phòng") {
      errors.push("Hành động phải là 'Đi thị trường' hoặc 'Làm văn phòng'")
    }
  }

  if (!row.muc_tieu || String(row.muc_tieu).trim() === "") {
    errors.push("Mục tiêu là bắt buộc")
  }

  // Validate khach_buon_id if provided
  if (row.khach_buon_id && String(row.khach_buon_id).trim() !== "") {
    const khachBuonId = parseFloat(String(row.khach_buon_id))
    if (isNaN(khachBuonId)) {
      errors.push("Khách buôn ID phải là số")
    }
  }

  // Validate tsn_tinh_thanh_id if provided
  if (row.tsn_tinh_thanh_id && String(row.tsn_tinh_thanh_id).trim() !== "") {
    const tsnTinhThanhId = parseFloat(String(row.tsn_tinh_thanh_id))
    if (isNaN(tsnTinhThanhId)) {
      errors.push("Tỉnh thành ID phải là số")
    }
  }

  return errors
}

// Check for duplicates within the import data (no duplicate checking for kế hoạch thị trường)
function checkDuplicates(
  _rows: Array<{ rowNumber: number; data: Record<string, any> }>
): Map<string, number[]> {
  return new Map()
}

// Map Excel columns to database fields
function mapExcelToDb(
  rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>,
  options: ImportOptions
): Partial<CreateKeHoachThiTruongInput>[] {
  return rows.map((row) => {
    const mapped: Partial<CreateKeHoachThiTruongInput> = {}

    if (!shouldSkipValue(row.data["ngay"], options.skipEmptyCells)) {
      mapped.ngay = String(row.data["ngay"]).trim()
    }

    if (!shouldSkipValue(row.data["nhan_vien_id"], options.skipEmptyCells)) {
      const value = row.data["nhan_vien_id"]
      const numValue = typeof value === 'number' ? value : parseFloat(String(value))
      if (!isNaN(numValue)) {
        mapped.nhan_vien_id = numValue
      }
    }

    if (!shouldSkipValue(row.data["buoi"], options.skipEmptyCells)) {
      mapped.buoi = String(row.data["buoi"]).trim()
    }

    if (!shouldSkipValue(row.data["hanh_dong"], options.skipEmptyCells)) {
      mapped.hanh_dong = String(row.data["hanh_dong"]).trim()
    }

    if (!shouldSkipValue(row.data["khach_buon_id"], options.skipEmptyCells)) {
      const value = row.data["khach_buon_id"]
      const numValue = typeof value === 'number' ? value : parseFloat(String(value))
      if (!isNaN(numValue)) {
        mapped.khach_buon_id = numValue
      }
    }

    if (!shouldSkipValue(row.data["tsn_tinh_thanh_id"], options.skipEmptyCells)) {
      const value = row.data["tsn_tinh_thanh_id"]
      const numValue = typeof value === 'number' ? value : parseFloat(String(value))
      if (!isNaN(numValue)) {
        mapped.tsn_tinh_thanh_id = numValue
      }
    }

    if (!shouldSkipValue(row.data["muc_tieu"], options.skipEmptyCells)) {
      mapped.muc_tieu = String(row.data["muc_tieu"]).trim()
    }

    if (!shouldSkipValue(row.data["ghi_chu"], options.skipEmptyCells)) {
      mapped.ghi_chu = String(row.data["ghi_chu"]).trim()
    }

    if (!shouldSkipValue(row.data["trang_thai"], options.skipEmptyCells)) {
      mapped.trang_thai = String(row.data["trang_thai"]).trim()
    }

    return mapped
  })
}

export function KeHoachThiTruongImportDialog({ open, onOpenChange, mutation }: KeHoachThiTruongImportDialogProps) {
  const defaultMutation = useBatchUpsertKeHoachThiTruong()
  const batchUpsertMutation = mutation || defaultMutation
  const [importOptions, _setImportOptions] = React.useState<ImportOptions>({
    skipEmptyCells: true,
    upsertMode: 'error', // Error mode: show error if record exists
  })

  const handleImport = async (rows: Partial<CreateKeHoachThiTruongInput>[]): Promise<{
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
  const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<CreateKeHoachThiTruongInput>[] => {
    return mapExcelToDb(rows, importOptions)
  }

  // Validate row
  const validateRowWithMap = (row: Record<string, any>, rowNumber: number): string[] => {
    return validateRow(row, rowNumber)
  }

  return (
    <ImportDialog<Partial<CreateKeHoachThiTruongInput>>
      open={open}
      onOpenChange={onOpenChange}
      onImport={handleImport}
      validateRow={validateRowWithMap}
      checkDuplicates={checkDuplicates}
      transformData={transformData}
      moduleName="kế hoạch thị trường"
      templateColumns={templateColumns}
      columnMappings={columnMappings}
    />
  )
}

