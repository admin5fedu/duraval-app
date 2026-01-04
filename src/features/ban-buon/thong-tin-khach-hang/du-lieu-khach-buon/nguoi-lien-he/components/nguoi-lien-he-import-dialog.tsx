"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertNguoiLienHe } from "../actions/nguoi-lien-he-excel-actions"
import { CreateNguoiLienHeInput } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"
import { useDanhSachKB } from "../../danh-sach-KB/hooks/use-danh-sach-KB"

type UseBatchUpsertNguoiLienHeReturn = ReturnType<typeof useBatchUpsertNguoiLienHe>

interface NguoiLienHeImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mutation?: UseBatchUpsertNguoiLienHeReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
  {
    dbField: "khach_buon_id",
    excelNames: [
      "Khách buôn ID", "Khách Buôn ID", "Khach buon ID", "Khach Buon ID",
      "Khách_buôn_ID", "Khách_Buôn_ID", "Khach_buon_ID", "Khach_Buon_ID",
      "Khách buôn", "Khach buon", "Khách Buôn", "Khach Buon",
      "Customer ID", "customer id", "CustomerId", "customerId",
      "ID Khách buôn", "ID Khach buon",
    ],
    required: true,
    type: "number",
    description: "ID khách buôn (bắt buộc) - có thể dùng tên khách buôn để map",
  },
  {
    dbField: "ten_lien_he",
    excelNames: [
      "Tên liên hệ", "Tên Liên Hệ", "Ten lien he", "Ten Lien He",
      "Tên_liên_hệ", "Tên_Liên_Hệ", "Ten_lien_he", "Ten_Lien_He",
      "Tên", "Ten", "Name", "name", "Họ tên", "Ho ten", "Họ Tên",
    ],
    required: true,
    type: "text",
    description: "Tên liên hệ (bắt buộc)",
  },
  {
    dbField: "vai_tro",
    excelNames: [
      "Vai trò", "Vai Trò", "Vai tro", "Vai Tro",
      "Vai_trò", "Vai_Trò", "Vai_tro", "Vai_Tro",
      "Vai trò", "Vai tro", "Role", "role",
    ],
    required: true,
    type: "text",
    description: "Vai trò (bắt buộc): Chủ, Con, Vợ/chồng, Người thân, Nhân viên, hoặc giá trị khác",
  },
  {
    dbField: "gioi_tinh",
    excelNames: [
      "Giới tính", "Giới Tính", "Gioi tinh", "Gioi Tinh",
      "Giới_tính", "Giới_Tính", "Gioi_tinh", "Gioi_Tinh",
      "Giới tính", "Gioi tinh", "Gender", "gender", "Giới", "Gioi",
    ],
    required: true,
    type: "text",
    description: "Giới tính (bắt buộc): Nam, Nữ, Khác",
  },
  {
    dbField: "so_dien_thoai_1",
    excelNames: [
      "Số điện thoại 1", "Số Điện Thoại 1", "So dien thoai 1", "So Dien Thoai 1",
      "Số_điện_thoại_1", "Số_Điện_Thoại_1", "So_dien_thoai_1", "So_Dien_Thoai_1",
      "SĐT 1", "SDT 1", "Phone 1", "phone 1", "Tel 1", "tel 1",
      "Số điện thoại", "So dien thoai", "Phone", "phone",
    ],
    required: false,
    type: "text",
    description: "Số điện thoại 1 (dùng để check duplicate khi import)",
  },
  {
    dbField: "so_dien_thoai_2",
    excelNames: [
      "Số điện thoại 2", "Số Điện Thoại 2", "So dien thoai 2", "So Dien Thoai 2",
      "Số_điện_thoại_2", "Số_Điện_Thoại_2", "So_dien_thoai_2", "So_Dien_Thoai_2",
      "SĐT 2", "SDT 2", "Phone 2", "phone 2", "Tel 2", "tel 2",
    ],
    required: false,
    type: "text",
    description: "Số điện thoại 2 (không bắt buộc)",
  },
  {
    dbField: "email",
    excelNames: [
      "Email", "email", "E-mail", "e-mail",
    ],
    required: false,
    type: "text",
    description: "Email (không bắt buộc)",
  },
  {
    dbField: "ngay_sinh",
    excelNames: [
      "Ngày sinh", "Ngày Sinh", "Ngay sinh", "Ngay Sinh",
      "Ngày_sinh", "Ngày_Sinh", "Ngay_sinh", "Ngay_Sinh",
      "Ngày", "Ngay", "Date of birth", "date of birth", "DOB", "dob",
    ],
    required: false,
    type: "text",
    description: "Ngày sinh (không bắt buộc, format: YYYY-MM-DD hoặc DD/MM/YYYY)",
  },
  {
    dbField: "tinh_cach",
    excelNames: [
      "Tính cách", "Tính Cách", "Tinh cach", "Tinh Cach",
      "Tính_cách", "Tính_Cách", "Tinh_cach", "Tinh_Cach",
    ],
    required: false,
    type: "text",
    description: "Tính cách (không bắt buộc)",
  },
  {
    dbField: "so_thich",
    excelNames: [
      "Sở thích", "Sở Thích", "So thich", "So Thich",
      "Sở_thích", "Sở_Thích", "So_thich", "So_Thich",
    ],
    required: false,
    type: "text",
    description: "Sở thích (không bắt buộc)",
  },
  {
    dbField: "luu_y_khi_lam_viec",
    excelNames: [
      "Lưu ý khi làm việc", "Lưu Ý Khi Làm Việc", "Luu y khi lam viec", "Luu Y Khi Lam Viec",
      "Lưu_ý_khi_làm_việc", "Lưu_Ý_Khi_Làm_Việc", "Luu_y_khi_lam_viec", "Luu_Y_Khi_Lam_Viec",
      "Lưu ý", "Luu y", "Note", "note",
    ],
    required: false,
    type: "text",
    description: "Lưu ý khi làm việc (không bắt buộc)",
  },
  {
    dbField: "ghi_chu_khac",
    excelNames: [
      "Ghi chú khác", "Ghi Chú Khác", "Ghi chu khac", "Ghi Chu Khac",
      "Ghi_chú_khác", "Ghi_Chú_Khác", "Ghi_chu_khac", "Ghi_Chu_Khac",
      "Ghi chú", "Ghi chu", "Notes", "notes",
    ],
    required: false,
    type: "text",
    description: "Ghi chú khác (không bắt buộc)",
  },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
  {
    header: "Khách buôn ID",
    type: "number",
    required: true,
    description: "ID khách buôn (bắt buộc)",
  },
  {
    header: "Tên liên hệ",
    type: "text",
    required: true,
    description: "Tên liên hệ (bắt buộc)",
  },
  {
    header: "Vai trò",
    type: "text",
    required: true,
    description: "Vai trò (bắt buộc): Chủ, Con, Vợ/chồng, Người thân, Nhân viên, hoặc giá trị khác",
  },
  {
    header: "Giới tính",
    type: "text",
    required: true,
    description: "Giới tính (bắt buộc): Nam, Nữ, Khác",
  },
  {
    header: "Số điện thoại 1",
    type: "text",
    required: false,
    description: "Số điện thoại 1 (dùng để check duplicate)",
  },
  {
    header: "Số điện thoại 2",
    type: "text",
    required: false,
    description: "Số điện thoại 2 (không bắt buộc)",
  },
  {
    header: "Email",
    type: "text",
    required: false,
    description: "Email (không bắt buộc)",
  },
  {
    header: "Ngày sinh",
    type: "text",
    required: false,
    description: "Ngày sinh (không bắt buộc, format: YYYY-MM-DD hoặc DD/MM/YYYY)",
  },
  {
    header: "Tính cách",
    type: "text",
    required: false,
    description: "Tính cách (không bắt buộc)",
  },
  {
    header: "Sở thích",
    type: "text",
    required: false,
    description: "Sở thích (không bắt buộc)",
  },
  {
    header: "Lưu ý khi làm việc",
    type: "text",
    required: false,
    description: "Lưu ý khi làm việc (không bắt buộc)",
  },
  {
    header: "Ghi chú khác",
    type: "text",
    required: false,
    description: "Ghi chú khác (không bắt buộc)",
  },
]

// Validate a single row
function validateRow(
  row: Record<string, any>,
  _rowNumber: number,
  khachBuonMap?: Map<string, number>
): string[] {
  const errors: string[] = []

  // Validate khach_buon_id
  const khachBuonValue = row["khach_buon_id"]
  if (!khachBuonValue || String(khachBuonValue).trim() === "") {
    errors.push("Khách buôn là bắt buộc")
  } else if (khachBuonMap) {
    // Try to resolve khach_buon_id from name if it's not a number
    const khachBuonStr = String(khachBuonValue).trim()
    const khachBuonId = khachBuonMap.get(khachBuonStr.toLowerCase())
    if (!khachBuonId) {
      // Try parsing as number
      const numId = parseFloat(khachBuonStr)
      if (isNaN(numId)) {
        errors.push(`Không tìm thấy khách buôn: "${khachBuonStr}"`)
      }
    }
  }

  // Required fields
  if (!row["ten_lien_he"] || String(row["ten_lien_he"]).trim() === "") {
    errors.push("Tên liên hệ là bắt buộc")
  }

  if (!row["vai_tro"] || String(row["vai_tro"]).trim() === "") {
    errors.push("Vai trò là bắt buộc")
  }

  if (!row["gioi_tinh"] || String(row["gioi_tinh"]).trim() === "") {
    errors.push("Giới tính là bắt buộc")
  }

  // Validate email format if provided
  if (row["email"] && String(row["email"]).trim() !== "") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(String(row["email"]).trim())) {
      errors.push("Email không hợp lệ")
    }
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
  options: ImportOptions,
  khachBuonMap?: Map<string, number>
): Partial<CreateNguoiLienHeInput>[] {
  return rows.map((row) => {
    const mapped: Partial<CreateNguoiLienHeInput> = {}

    // Map khach_buon_id - try to resolve from name if provided
    const khachBuonValue = row.data["khach_buon_id"]
    if (khachBuonValue) {
      const khachBuonStr = String(khachBuonValue).trim()
      if (khachBuonMap) {
        const khachBuonId = khachBuonMap.get(khachBuonStr.toLowerCase())
        if (khachBuonId) {
          mapped.khach_buon_id = khachBuonId
        } else {
          // Try parsing as number
          const numId = parseFloat(khachBuonStr)
          if (!isNaN(numId)) {
            mapped.khach_buon_id = numId
          }
        }
      } else {
        const numId = parseFloat(khachBuonStr)
        if (!isNaN(numId)) {
          mapped.khach_buon_id = numId
        }
      }
    }

    if (!shouldSkipValue(row.data["ten_lien_he"], options.skipEmptyCells)) {
      mapped.ten_lien_he = String(row.data["ten_lien_he"]).trim()
    }

    if (!shouldSkipValue(row.data["vai_tro"], options.skipEmptyCells)) {
      mapped.vai_tro = String(row.data["vai_tro"]).trim()
    }

    if (!shouldSkipValue(row.data["gioi_tinh"], options.skipEmptyCells)) {
      mapped.gioi_tinh = String(row.data["gioi_tinh"]).trim()
    }

    if (!shouldSkipValue(row.data["so_dien_thoai_1"], options.skipEmptyCells)) {
      mapped.so_dien_thoai_1 = String(row.data["so_dien_thoai_1"]).trim()
    }

    if (!shouldSkipValue(row.data["so_dien_thoai_2"], options.skipEmptyCells)) {
      mapped.so_dien_thoai_2 = String(row.data["so_dien_thoai_2"]).trim()
    }

    if (!shouldSkipValue(row.data["email"], options.skipEmptyCells)) {
      mapped.email = String(row.data["email"]).trim()
    }

    if (!shouldSkipValue(row.data["ngay_sinh"], options.skipEmptyCells)) {
      mapped.ngay_sinh = String(row.data["ngay_sinh"]).trim()
    }

    if (!shouldSkipValue(row.data["tinh_cach"], options.skipEmptyCells)) {
      mapped.tinh_cach = String(row.data["tinh_cach"]).trim()
    }

    if (!shouldSkipValue(row.data["so_thich"], options.skipEmptyCells)) {
      mapped.so_thich = String(row.data["so_thich"]).trim()
    }

    if (!shouldSkipValue(row.data["luu_y_khi_lam_viec"], options.skipEmptyCells)) {
      mapped.luu_y_khi_lam_viec = String(row.data["luu_y_khi_lam_viec"]).trim()
    }

    if (!shouldSkipValue(row.data["ghi_chu_khac"], options.skipEmptyCells)) {
      mapped.ghi_chu_khac = String(row.data["ghi_chu_khac"]).trim()
    }

    return mapped
  })
}

export function NguoiLienHeImportDialog({ open, onOpenChange, mutation }: NguoiLienHeImportDialogProps) {
  const defaultMutation = useBatchUpsertNguoiLienHe()
  const batchUpsertMutation = mutation || defaultMutation
  
  // Fetch khách buôn list to map name to ID
  const { data: khachBuonList } = useDanhSachKB(undefined)
  
  // Create map: lowercase name -> id
  const khachBuonMap = React.useMemo(() => {
    if (!khachBuonList) return undefined
    const map = new Map<string, number>()
    khachBuonList.forEach((kb) => {
      if (kb.ten_khach_buon) {
        map.set(kb.ten_khach_buon.toLowerCase(), kb.id!)
      }
      if (kb.ma_so) {
        map.set(kb.ma_so.toLowerCase(), kb.id!)
      }
    })
    return map
  }, [khachBuonList])

  const [importOptions, _setImportOptions] = React.useState<ImportOptions>({
    skipEmptyCells: true,
    upsertMode: 'update', // Update mode: update if exists, insert if not
  })

  const handleImport = async (rows: Partial<CreateNguoiLienHeInput>[]): Promise<{
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
  const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<CreateNguoiLienHeInput>[] => {
    return mapExcelToDb(rows, importOptions, khachBuonMap)
  }

  // Validate row with khachBuonMap
  const validateRowWithMap = (row: Record<string, any>, rowNumber: number): string[] => {
    return validateRow(row, rowNumber, khachBuonMap)
  }

  return (
    <ImportDialog<Partial<CreateNguoiLienHeInput>>
      open={open}
      onOpenChange={onOpenChange}
      onImport={handleImport}
      validateRow={validateRowWithMap}
      checkDuplicates={checkDuplicates}
      transformData={transformData}
      moduleName="người liên hệ"
      templateColumns={templateColumns}
      columnMappings={columnMappings}
      enableAutoMapping={true}
      importOptions={importOptions}
    />
  )
}

