"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertPhieuDeXuatBanHang } from "../actions/phieu-de-xuat-ban-hang-excel-actions"
import { PhieuDeXuatBanHang } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertPhieuDeXuatBanHangReturn = ReturnType<typeof useBatchUpsertPhieuDeXuatBanHang>

interface PhieuDeXuatBanHangImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mutation?: UseBatchUpsertPhieuDeXuatBanHangReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
  {
    dbField: "ngay",
    excelNames: [
      "Ngày", "Ngay", "Date", "date", "Ngày", "Ngay",
      "NGÀY", "NGAY", "DATE", "DATE"
    ],
    required: false,
    type: "date",
    description: "Ngày (dd/mm/yyyy)",
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
    dbField: "ten_loai_phieu",
    excelNames: [
      "Tên loại phiếu", "Tên Loại Phiếu", "Ten loai phieu", "Ten Loai Phieu",
      "Tên_loại_phiếu", "Tên_Loại_Phiếu", "Ten_loai_phieu", "Ten_Loai_Phieu",
      "Loại phiếu", "Loai phieu", "Type", "type"
    ],
    required: false,
    type: "text",
    description: "Tên loại phiếu",
  },
  {
    dbField: "ten_hang_muc",
    excelNames: [
      "Tên hạng mục", "Tên Hạng Mục", "Ten hang muc", "Ten Hang Muc",
      "Tên_hạng_mục", "Tên_Hạng_Mục", "Ten_hang_muc", "Ten_Hang_Muc",
      "Hạng mục", "Hang muc", "Category", "category"
    ],
    required: false,
    type: "text",
    description: "Tên hạng mục",
  },
  {
    dbField: "so_hoa_don",
    excelNames: [
      "Số hóa đơn", "Số Hóa Đơn", "So hoa don", "So Hoa Don",
      "Số_hóa_đơn", "Số_Hóa_Đơn", "So_hoa_don", "So_Hoa_Don",
      "Hóa đơn", "Hoa don", "Invoice", "invoice", "Bill", "bill"
    ],
    required: false,
    type: "text",
    description: "Số hóa đơn",
  },
  {
    dbField: "tien_don_hang",
    excelNames: [
      "Tiền đơn hàng", "Tiền Đơn Hàng", "Tien don hang", "Tien Don Hang",
      "Tiền_đơn_hàng", "Tiền_Đơn_Hàng", "Tien_don_hang", "Tien_Don_Hang",
      "Tổng tiền", "Tong tien", "Amount", "amount", "Total", "total"
    ],
    required: false,
    type: "number",
    description: "Tiền đơn hàng (VND)",
  },
  {
    dbField: "tong_ck",
    excelNames: [
      "Tổng CK", "Tong CK", "Tổng chiết khấu", "Tong chiet khau",
      "Tổng_CK", "Tong_CK", "Tổng_chiết_khấu", "Tong_chiet_khau",
      "Chiết khấu", "Chiet khau", "Discount", "discount"
    ],
    required: false,
    type: "number",
    description: "Tổng chiết khấu (VND)",
  },
  {
    dbField: "ty_le",
    excelNames: [
      "Tỷ lệ", "Ty le", "Tỷ lệ %", "Ty le %",
      "Tỷ_lệ", "Ty_le", "Rate", "rate", "Percentage", "percentage"
    ],
    required: false,
    type: "number",
    description: "Tỷ lệ (%)",
  },
  {
    dbField: "trang_thai",
    excelNames: [
      "Trạng thái", "Trang thai", "Status", "status",
      "Trạng_thái", "Trang_thai", "STATE", "STATE"
    ],
    required: false,
    type: "text",
    description: "Trạng thái",
  },
  {
    dbField: "mo_ta",
    excelNames: [
      "Mô tả", "Mo ta", "Description", "description",
      "Mô_tả", "Mo_ta", "Note", "note", "Notes", "notes"
    ],
    required: false,
    type: "text",
    description: "Mô tả",
  },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
  {
    header: "Ngày",
    description: "Ngày (dd/mm/yyyy)",
    required: false,
    example: "01/01/2024",
    type: "date",
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
    header: "Tên loại phiếu",
    description: "Tên loại phiếu",
    required: false,
    example: "Phiếu đề xuất",
    type: "text",
  },
  {
    header: "Tên hạng mục",
    description: "Tên hạng mục",
    required: false,
    example: "Hạng mục A",
    type: "text",
  },
  {
    header: "Số hóa đơn",
    description: "Số hóa đơn",
    required: false,
    example: "HD001",
    type: "text",
  },
  {
    header: "Tiền đơn hàng",
    description: "Tiền đơn hàng (VND)",
    required: false,
    example: 10000000,
    type: "number",
  },
  {
    header: "Tổng CK",
    description: "Tổng chiết khấu (VND)",
    required: false,
    example: 500000,
    type: "number",
  },
  {
    header: "Tỷ lệ",
    description: "Tỷ lệ (%)",
    required: false,
    example: 5,
    type: "number",
  },
  {
    header: "Trạng thái",
    description: "Trạng thái",
    required: false,
    example: "Chờ duyệt",
    type: "text",
  },
  {
    header: "Mô tả",
    description: "Mô tả",
    required: false,
    example: "Mô tả về phiếu",
    type: "text",
  },
]

// Validate a row of data
function validateRow(row: Record<string, any>, _rowNumber: number): string[] {
  const errors: string[] = []

  // Validate tiền đơn hàng
  if (row["tien_don_hang"] !== null && row["tien_don_hang"] !== undefined && row["tien_don_hang"] !== "") {
    const tienDonHang = typeof row["tien_don_hang"] === 'string' 
      ? parseFloat(row["tien_don_hang"].replace(/[,\s]/g, '')) 
      : Number(row["tien_don_hang"])
    if (isNaN(tienDonHang) || tienDonHang < 0) {
      errors.push("Tiền đơn hàng phải >= 0")
    }
  }

  // Validate tổng CK
  if (row["tong_ck"] !== null && row["tong_ck"] !== undefined && row["tong_ck"] !== "") {
    const tongCk = typeof row["tong_ck"] === 'string' 
      ? parseFloat(row["tong_ck"].replace(/[,\s]/g, '')) 
      : Number(row["tong_ck"])
    if (isNaN(tongCk) || tongCk < 0) {
      errors.push("Tổng chiết khấu phải >= 0")
    }
  }

  // Validate tỷ lệ
  if (row["ty_le"] !== null && row["ty_le"] !== undefined && row["ty_le"] !== "") {
    const tyLe = typeof row["ty_le"] === 'string' 
      ? parseFloat(row["ty_le"].replace(/[,\s]/g, '')) 
      : Number(row["ty_le"])
    if (isNaN(tyLe) || tyLe < 0 || tyLe > 100) {
      errors.push("Tỷ lệ phải từ 0 đến 100")
    }
  }

  return errors
}

// Check for duplicates in the file
function checkDuplicates(_rows: Array<{ rowNumber: number; data: Record<string, any> }>): Map<string, number[]> {
  const duplicates = new Map<string, number[]>()
  // Có thể check duplicate theo id nếu có
  // Tạm thời không check duplicate
  return duplicates
}

// Map Excel columns to database fields
function mapExcelToDb(
  rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>,
  options: ImportOptions
): Partial<PhieuDeXuatBanHang>[] {
  return rows.map((row) => {
    const mapped: Partial<PhieuDeXuatBanHang> = {}

    // Map date
    if (row.data["ngay"] !== undefined && row.data["ngay"] !== null && row.data["ngay"] !== "") {
      const dateValue = row.data["ngay"]
      if (typeof dateValue === 'string') {
        mapped.ngay = dateValue
      } else if (dateValue instanceof Date) {
        mapped.ngay = dateValue.toISOString().split('T')[0]
      }
    }

    // Map text fields
    if (!shouldSkipValue(row.data["ten_nhan_vien"], options.skipEmptyCells)) {
      mapped.ten_nhan_vien = String(row.data["ten_nhan_vien"]).trim()
    }
    if (!shouldSkipValue(row.data["ma_phong"], options.skipEmptyCells)) {
      mapped.ma_phong = String(row.data["ma_phong"]).trim()
    }
    if (!shouldSkipValue(row.data["ma_nhom"], options.skipEmptyCells)) {
      mapped.ma_nhom = String(row.data["ma_nhom"]).trim()
    }
    if (!shouldSkipValue(row.data["ten_loai_phieu"], options.skipEmptyCells)) {
      mapped.ten_loai_phieu = String(row.data["ten_loai_phieu"]).trim()
    }
    if (!shouldSkipValue(row.data["ten_hang_muc"], options.skipEmptyCells)) {
      mapped.ten_hang_muc = String(row.data["ten_hang_muc"]).trim()
    }
    if (!shouldSkipValue(row.data["so_hoa_don"], options.skipEmptyCells)) {
      mapped.so_hoa_don = String(row.data["so_hoa_don"]).trim()
    }
    if (!shouldSkipValue(row.data["trang_thai"], options.skipEmptyCells)) {
      mapped.trang_thai = String(row.data["trang_thai"]).trim()
    }
    if (!shouldSkipValue(row.data["mo_ta"], options.skipEmptyCells)) {
      mapped.mo_ta = String(row.data["mo_ta"]).trim()
    }

    // Parse numbers (remove commas)
    if (row.data["tien_don_hang"] !== undefined && row.data["tien_don_hang"] !== null && row.data["tien_don_hang"] !== "") {
      const value = typeof row.data["tien_don_hang"] === 'string' 
        ? parseFloat(row.data["tien_don_hang"].replace(/[,\s]/g, '')) 
        : Number(row.data["tien_don_hang"])
      if (!isNaN(value)) {
        mapped.tien_don_hang = value
      }
    }
    if (row.data["tong_ck"] !== undefined && row.data["tong_ck"] !== null && row.data["tong_ck"] !== "") {
      const value = typeof row.data["tong_ck"] === 'string' 
        ? parseFloat(row.data["tong_ck"].replace(/[,\s]/g, '')) 
        : Number(row.data["tong_ck"])
      if (!isNaN(value)) {
        mapped.tong_ck = value
      }
    }
    if (row.data["ty_le"] !== undefined && row.data["ty_le"] !== null && row.data["ty_le"] !== "") {
      const value = typeof row.data["ty_le"] === 'string' 
        ? parseFloat(row.data["ty_le"].replace(/[,\s]/g, '')) 
        : Number(row.data["ty_le"])
      if (!isNaN(value)) {
        mapped.ty_le = value
      }
    }

    return mapped
  })
}

export function PhieuDeXuatBanHangImportDialog({ open, onOpenChange, mutation }: PhieuDeXuatBanHangImportDialogProps) {
  const defaultMutation = useBatchUpsertPhieuDeXuatBanHang()
  const batchUpsertMutation = mutation || defaultMutation
  const [importOptions, _setImportOptions] = React.useState<ImportOptions>({
    skipEmptyCells: true,
    upsertMode: 'update',
    dateFormat: 'dd/mm/yyyy',
  })

  const handleImport = async (rows: Partial<PhieuDeXuatBanHang>[]): Promise<{
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
  const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<PhieuDeXuatBanHang>[] => {
    return mapExcelToDb(rows, importOptions)
  }

  return (
    <ImportDialog<Partial<PhieuDeXuatBanHang>>
      open={open}
      onOpenChange={onOpenChange}
      onImport={handleImport}
      validateRow={validateRow}
      checkDuplicates={checkDuplicates}
      transformData={transformData}
      moduleName="phiếu đề xuất bán hàng"
      templateColumns={templateColumns}
      columnMappings={columnMappings}
      enableAutoMapping={true}
      importOptions={importOptions}
    />
  )
}

