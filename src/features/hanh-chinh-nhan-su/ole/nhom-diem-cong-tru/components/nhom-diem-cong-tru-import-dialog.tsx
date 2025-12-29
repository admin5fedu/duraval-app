"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertNhomDiemCongTru } from "../actions/nhom-diem-cong-tru-excel-actions"
import { NhomDiemCongTru } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertNhomDiemCongTruReturn = ReturnType<typeof useBatchUpsertNhomDiemCongTru>

interface NhomDiemCongTruImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertNhomDiemCongTruReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "hang_muc",
        excelNames: [
            "Hạng mục", "Hạng Mục", "Hang muc", "Hang Muc",
            "Hạng_mục", "Hang_muc",
            "Category", "category", "Type", "type"
        ],
        required: true,
        type: "text",
        description: "Hạng mục (bắt buộc)",
    },
    {
        dbField: "nhom",
        excelNames: [
            "Nhóm", "Nhom",
            "Group", "group", "Team", "team"
        ],
        required: true,
        type: "text",
        description: "Nhóm (bắt buộc)",
    },
    {
        dbField: "min",
        excelNames: [
            "Min", "min", "Minimum", "minimum",
            "Tối thiểu", "Tối Thiểu", "Toi thieu", "Toi Thieu"
        ],
        required: true,
        type: "number",
        description: "Giá trị tối thiểu (bắt buộc, số)",
    },
    {
        dbField: "max",
        excelNames: [
            "Max", "max", "Maximum", "maximum",
            "Tối đa", "Tối Đa", "Toi da", "Toi Da"
        ],
        required: true,
        type: "number",
        description: "Giá trị tối đa (bắt buộc, số)",
    },
    {
        dbField: "mo_ta",
        excelNames: [
            "Mô tả", "Mô Tả", "Mo ta", "Mo Ta",
            "Mô_tả", "Mo_ta",
            "Description", "description", "Desc", "desc", "Note", "note"
        ],
        required: false,
        type: "text",
        description: "Mô tả (tùy chọn)",
    },
    {
        dbField: "pb_ap_dung_ib",
        excelNames: [
            "Phòng ban áp dụng", "Phòng Ban Áp Dụng", "Phong ban ap dung", "Phong Ban Ap Dung",
            "Phòng_ban", "Phong_ban",
            "Department", "department", "Dept", "dept", "PB", "pb"
        ],
        required: false,
        type: "text",
        description: "Phòng ban áp dụng (tùy chọn, có thể là số hoặc danh sách số cách nhau bằng dấu phẩy)",
    },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
    {
        header: "Hạng mục",
        type: "text",
        required: true,
        description: "Hạng mục (bắt buộc)",
    },
    {
        header: "Nhóm",
        type: "text",
        required: true,
        description: "Nhóm (bắt buộc)",
    },
    {
        header: "Min",
        type: "number",
        required: true,
        description: "Giá trị tối thiểu (bắt buộc, số)",
    },
    {
        header: "Max",
        type: "number",
        required: true,
        description: "Giá trị tối đa (bắt buộc, số)",
    },
    {
        header: "Mô tả",
        type: "text",
        required: false,
        description: "Mô tả (tùy chọn)",
    },
    {
        header: "Phòng ban áp dụng",
        type: "text",
        required: false,
        description: "Phòng ban áp dụng (tùy chọn, có thể là số hoặc danh sách số cách nhau bằng dấu phẩy)",
    },
]

// Validate a single row
function validateRow(
    row: Record<string, any>
): string[] {
    const errors: string[] = []

    // Required fields
    if (!row.hang_muc || String(row.hang_muc).trim() === "") {
        errors.push("Hạng mục là bắt buộc")
    } else {
        const hangMuc = String(row.hang_muc).trim()
        if (hangMuc !== "Cộng" && hangMuc !== "Trừ") {
            errors.push("Hạng mục phải là 'Cộng' hoặc 'Trừ'")
        }
    }

    if (!row.nhom || String(row.nhom).trim() === "") {
        errors.push("Nhóm là bắt buộc")
    }

    if (row.min === undefined || row.min === null || row.min === "") {
        errors.push("Min là bắt buộc")
    } else {
        const minNum = Number(row.min)
        if (isNaN(minNum)) {
            errors.push("Min phải là số")
        }
    }

    if (row.max === undefined || row.max === null || row.max === "") {
        errors.push("Max là bắt buộc")
    } else {
        const maxNum = Number(row.max)
        if (isNaN(maxNum)) {
            errors.push("Max phải là số")
        }
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
        const hangMuc = row.data.hang_muc
        const nhom = row.data.nhom

        if (hangMuc && nhom) {
            const key = `${String(hangMuc).trim()}|${String(nhom).trim()}`
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
): Partial<NhomDiemCongTru>[] {
    return rows.map((row) => {
        const mapped: Partial<NhomDiemCongTru> = {}

        // Map required fields
        if (!shouldSkipValue(row.data["hang_muc"], options.skipEmptyCells)) {
            const hangMuc = String(row.data["hang_muc"]).trim()
            // Normalize to "Cộng" or "Trừ"
            if (hangMuc === "Cộng" || hangMuc === "Trừ") {
                mapped.hang_muc = hangMuc
            } else {
                // Try to normalize common variations
                const normalized = hangMuc.toLowerCase()
                if (normalized === "cong" || normalized === "cộng" || normalized === "+") {
                    mapped.hang_muc = "Cộng"
                } else if (normalized === "tru" || normalized === "trừ" || normalized === "-") {
                    mapped.hang_muc = "Trừ"
                } else {
                    // Keep original for validation, but TypeScript needs explicit type
                    mapped.hang_muc = hangMuc as "Cộng" | "Trừ"
                }
            }
        }

        if (!shouldSkipValue(row.data["nhom"], options.skipEmptyCells)) {
            mapped.nhom = String(row.data["nhom"]).trim()
        }

        if (!shouldSkipValue(row.data["min"], options.skipEmptyCells)) {
            mapped.min = Number(row.data["min"])
        }

        if (!shouldSkipValue(row.data["max"], options.skipEmptyCells)) {
            mapped.max = Number(row.data["max"])
        }

        // Map optional fields
        if (!shouldSkipValue(row.data["mo_ta"], options.skipEmptyCells)) {
            mapped.mo_ta = String(row.data["mo_ta"]).trim() || null
        }

        // Map pb_ap_dung_ib - handle array, comma-separated string, or single number
        if (!shouldSkipValue(row.data["pb_ap_dung_ib"], options.skipEmptyCells)) {
            const pbValue = row.data["pb_ap_dung_ib"]
            if (Array.isArray(pbValue)) {
                mapped.pb_ap_dung_ib = pbValue.filter(id => id != null).map(id => Number(id)).filter(id => !isNaN(id))
            } else if (typeof pbValue === "string") {
                const ids = pbValue.split(",").map(s => s.trim()).filter(s => s)
                const numIds = ids.map(id => Number(id)).filter(id => !isNaN(id))
                mapped.pb_ap_dung_ib = numIds.length > 0 ? numIds : null
            } else if (pbValue != null) {
                const id = Number(pbValue)
                if (!isNaN(id)) {
                    mapped.pb_ap_dung_ib = [id]
                }
            }
        }

        return mapped
    })
}

export function NhomDiemCongTruImportDialog({ open, onOpenChange, mutation }: NhomDiemCongTruImportDialogProps) {
    const defaultMutation = useBatchUpsertNhomDiemCongTru()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update', // Update mode: update if exists, insert if not
    })

    const handleImport = async (rows: Partial<NhomDiemCongTru>[]): Promise<{
        success: boolean
        inserted: number
        updated: number
        failed: number
        errors?: Array<{ rowNumber: number; errors: string[] }>
    }> => {
        try {
            // Convert rows to ExcelRow format for mutation
            const excelRows = rows.map((row) => ({
                hang_muc: row.hang_muc,
                nhom: row.nhom,
                min: row.min,
                max: row.max,
                mo_ta: row.mo_ta,
                pb_ap_dung_ib: row.pb_ap_dung_ib,
            }))
            const result = await batchUpsertMutation.mutateAsync(excelRows)
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
    const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<NhomDiemCongTru>[] => {
        return mapExcelToDb(rows, importOptions)
    }

    return (
        <ImportDialog<Partial<NhomDiemCongTru>>
            open={open}
            onOpenChange={onOpenChange}
            onImport={handleImport}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={transformData}
            moduleName="nhóm điểm cộng trừ"
            
            templateColumns={templateColumns}
            columnMappings={columnMappings}
            enableAutoMapping={true}
            importOptions={importOptions}
            
        />
    )
}

