"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertHinhAnhKhachBuon } from "../actions/hinh-anh-khach-buon-excel-actions"
import { CreateHinhAnhKhachBuonInput } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"
import { useDanhSachKB } from "@/features/ban-buon/thong-tin-khach-hang/du-lieu-khach-buon/danh-sach-KB/hooks/use-danh-sach-KB"

type UseBatchUpsertHinhAnhKhachBuonReturn = ReturnType<typeof useBatchUpsertHinhAnhKhachBuon>

interface HinhAnhKhachBuonImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mutation?: UseBatchUpsertHinhAnhKhachBuonReturn
}

const columnMappings: ColumnMapping[] = [
  { dbField: "khach_buon_id", excelNames: ["Khách buôn ID", "Khách buôn", "Tên khách buôn", "Mã khách buôn"], required: true, type: "number", description: "ID hoặc Tên khách buôn (bắt buộc)" },
  { dbField: "hang_muc", excelNames: ["Hạng mục", "Hạng Mục"], required: true, type: "text", description: "Hạng mục (bắt buộc): Sản phẩm hoặc Khác" },
  { dbField: "hinh_anh", excelNames: ["Hình ảnh", "Hình Ảnh", "Image", "URL"], required: true, type: "text", description: "URL hình ảnh (bắt buộc)" },
  { dbField: "mo_ta", excelNames: ["Mô tả", "Mô Tả", "Description"], required: false, type: "text", description: "Mô tả (không bắt buộc)" },
  { dbField: "ghi_chu", excelNames: ["Ghi chú", "Ghi Chú", "Notes"], required: false, type: "text", description: "Ghi chú (không bắt buộc)" },
]

const templateColumns: TemplateColumn[] = [
  { header: "Khách buôn ID", type: "number", required: true, description: "ID khách buôn (bắt buộc)" },
  { header: "Hạng mục", type: "text", required: true, description: "Hạng mục (bắt buộc): Sản phẩm hoặc Khác" },
  { header: "Hình ảnh", type: "text", required: true, description: "URL hình ảnh (bắt buộc)" },
  { header: "Mô tả", type: "text", required: false, description: "Mô tả" },
  { header: "Ghi chú", type: "text", required: false, description: "Ghi chú" },
]

function validateRow(
  row: Record<string, any>,
  _rowNumber: number,
  khachBuonMap?: Map<string, number>
): string[] {
  const errors: string[] = []

  const khachBuonValue = row["khach_buon_id"]
  if (!khachBuonValue || String(khachBuonValue).trim() === "") {
    errors.push("Khách buôn là bắt buộc")
  } else if (khachBuonMap) {
    const khachBuonStr = String(khachBuonValue).trim()
    const khachBuonId = khachBuonMap.get(khachBuonStr.toLowerCase())
    if (!khachBuonId) {
      const numId = parseFloat(khachBuonStr)
      if (isNaN(numId)) {
        errors.push(`Không tìm thấy khách buôn: "${khachBuonStr}"`)
      }
    }
  }

  if (!row["hang_muc"] || String(row["hang_muc"]).trim() === "") {
    errors.push("Hạng mục là bắt buộc")
  } else {
    const hangMuc = String(row["hang_muc"]).trim()
    if (hangMuc !== "Sản phẩm" && hangMuc !== "Khác") {
      errors.push(`Hạng mục phải là "Sản phẩm" hoặc "Khác", nhận được: "${hangMuc}"`)
    }
  }

  if (!row["hinh_anh"] || String(row["hinh_anh"]).trim() === "") {
    errors.push("Hình ảnh là bắt buộc")
  }

  return errors
}

function checkDuplicates(
  _rows: Array<{ rowNumber: number; data: Record<string, any> }>
): Map<string, number[]> {
  // No duplicate checking for hình ảnh khách buôn as there's no unique field
  return new Map<string, number[]>()
}

function mapExcelToDb(
  rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>,
  options: ImportOptions,
  khachBuonMap?: Map<string, number>
): Partial<CreateHinhAnhKhachBuonInput>[] {
  return rows.map((row) => {
    const mapped: Partial<CreateHinhAnhKhachBuonInput> = {}

    // Resolve khach_buon_id
    const khachBuonValue = row.data["khach_buon_id"]
    if (!shouldSkipValue(khachBuonValue, options.skipEmptyCells)) {
      const khachBuonStr = String(khachBuonValue).trim()
      let resolvedId: number | null = null
      if (khachBuonMap) {
        resolvedId = khachBuonMap.get(khachBuonStr.toLowerCase()) || null
      }
      if (resolvedId === null) {
        const numId = parseFloat(khachBuonStr)
        resolvedId = isNaN(numId) ? null : numId
      }
      mapped.khach_buon_id = resolvedId ?? undefined
    }

    if (!shouldSkipValue(row.data["hang_muc"], options.skipEmptyCells)) { 
      mapped.hang_muc = String(row.data["hang_muc"]).trim() 
    }
    if (!shouldSkipValue(row.data["hinh_anh"], options.skipEmptyCells)) { 
      mapped.hinh_anh = String(row.data["hinh_anh"]).trim() 
    }
    if (!shouldSkipValue(row.data["mo_ta"], options.skipEmptyCells)) { 
      mapped.mo_ta = String(row.data["mo_ta"]).trim() 
    }
    if (!shouldSkipValue(row.data["ghi_chu"], options.skipEmptyCells)) { 
      mapped.ghi_chu = String(row.data["ghi_chu"]).trim() 
    }

    return mapped
  })
}

export function HinhAnhKhachBuonImportDialog({ open, onOpenChange, mutation }: HinhAnhKhachBuonImportDialogProps) {
  const defaultMutation = useBatchUpsertHinhAnhKhachBuon()
  const batchUpsertMutation = mutation || defaultMutation

  const { data: khachBuonList } = useDanhSachKB(undefined)

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
    upsertMode: 'error',
  })

  const handleImport = async (rows: Partial<CreateHinhAnhKhachBuonInput>[]): Promise<{
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
          rowNumber: err.row + 1,
          errors: [err.error],
        })),
      }
    } catch (error) {
      throw error
    }
  }

  const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<CreateHinhAnhKhachBuonInput>[] => {
    return mapExcelToDb(rows, importOptions, khachBuonMap)
  }

  const validateRowWithMap = (row: Record<string, any>, rowNumber: number): string[] => {
    return validateRow(row, rowNumber, khachBuonMap)
  }

  return (
    <ImportDialog<Partial<CreateHinhAnhKhachBuonInput>>
      open={open}
      onOpenChange={onOpenChange}
      onImport={handleImport}
      validateRow={validateRowWithMap}
      checkDuplicates={checkDuplicates}
      transformData={transformData}
      moduleName="hình ảnh khách buôn"
      templateColumns={templateColumns}
      columnMappings={columnMappings}
      enableAutoMapping={true}
      importOptions={importOptions}
    />
  )
}

