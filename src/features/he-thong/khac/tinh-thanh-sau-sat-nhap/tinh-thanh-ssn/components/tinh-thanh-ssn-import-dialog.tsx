"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertTinhThanhSSN } from "../actions/tinh-thanh-ssn-excel-actions"
import { TinhThanhSSN } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertTinhThanhSSNReturn = ReturnType<typeof useBatchUpsertTinhThanhSSN>

interface TinhThanhSSNImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertTinhThanhSSNReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "ma_tinh_thanh",
        excelNames: [
            "Mã tỉnh thành", "Mã Tỉnh Thành", "Ma tinh thanh", "Ma Tinh Thanh",
            "Mã_tỉnh_thành", "Mã_Tỉnh_Thành", "Ma_tinh_thanh", "Ma_Tinh_Thanh",
            "Mã", "Ma", "Code", "code", "Mã Tỉnh", "Ma Tinh"
        ],
        required: true,
        type: "text",
        description: "Mã tỉnh thành (bắt buộc)",
    },
    {
        dbField: "ten_tinh_thanh",
        excelNames: [
            "Tên tỉnh thành", "Tên Tỉnh Thành", "Ten tinh thanh", "Ten Tinh Thanh",
            "Tên_tỉnh_thành", "Tên_Tỉnh_Thành", "Ten_tinh_thanh", "Ten_Tinh_Thanh",
            "Tên", "Ten", "Name", "name", "Tỉnh thành", "Tinh thanh"
        ],
        required: true,
        type: "text",
        description: "Tên tỉnh thành (bắt buộc)",
    },
    {
        dbField: "mien",
        excelNames: [
            "Miền", "Mien", "Region", "region", "Miền Bắc/Trung/Nam",
            "Miền Bắc", "Miền Trung", "Miền Nam", "Bắc", "Trung", "Nam"
        ],
        required: true,
        type: "text",
        description: "Miền (bắt buộc): Miền Bắc, Miền Trung, Miền Nam (hoặc Bắc, Trung, Nam)",
    },
    {
        dbField: "vung",
        excelNames: [
            "Vùng", "Vung", "Area", "area", "Zone", "zone"
        ],
        required: true,
        type: "text",
        description: "Vùng (bắt buộc)",
    },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
    {
        header: "Mã tỉnh thành",
        type: "text",
        required: true,
        description: "Mã tỉnh thành (bắt buộc)",
    },
    {
        header: "Tên tỉnh thành",
        type: "text",
        required: true,
        description: "Tên tỉnh thành (bắt buộc)",
    },
    {
        header: "Miền",
        type: "text",
        required: true,
        description: "Miền (bắt buộc): Miền Bắc, Miền Trung, Miền Nam (hoặc Bắc, Trung, Nam)",
    },
    {
        header: "Vùng",
        type: "text",
        required: true,
        description: "Vùng (bắt buộc)",
    },
]

// Normalize mien value: convert "Bắc"/"Trung"/"Nam" to "Miền Bắc"/"Miền Trung"/"Miền Nam"
function normalizeMien(value: string): string {
    const normalized = String(value).trim()
    const mienMap: Record<string, string> = {
        "Bắc": "Miền Bắc",
        "Trung": "Miền Trung",
        "Nam": "Miền Nam",
        "Miền Bắc": "Miền Bắc",
        "Miền Trung": "Miền Trung",
        "Miền Nam": "Miền Nam",
    }
    return mienMap[normalized] || normalized
}

// Validate a single row
function validateRow(
    row: Record<string, any>,
    _rowNumber: number
): string[] {
    const errors: string[] = []

    // Required fields
    if (!row.ma_tinh_thanh || String(row.ma_tinh_thanh).trim() === "") {
        errors.push("Mã tỉnh thành là bắt buộc")
    }

    if (!row.ten_tinh_thanh || String(row.ten_tinh_thanh).trim() === "") {
        errors.push("Tên tỉnh thành là bắt buộc")
    }

    if (!row.mien || String(row.mien).trim() === "") {
        errors.push("Miền là bắt buộc")
    } else {
        const normalizedMien = normalizeMien(row.mien)
        if (!["Miền Bắc", "Miền Trung", "Miền Nam"].includes(normalizedMien)) {
            errors.push("Miền phải là: Miền Bắc, Miền Trung hoặc Miền Nam (hoặc Bắc, Trung, Nam)")
        }
    }

    if (!row.vung || String(row.vung).trim() === "") {
        errors.push("Vùng là bắt buộc")
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
        const maTinhThanh = row.data.ma_tinh_thanh

        if (maTinhThanh) {
            const key = String(maTinhThanh).trim().toLowerCase()
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
): Partial<TinhThanhSSN>[] {
    return rows.map((row) => {
        const mapped: Partial<TinhThanhSSN> = {}

        // Map required fields
        if (!shouldSkipValue(row.data["ma_tinh_thanh"], options.skipEmptyCells)) {
            mapped.ma_tinh_thanh = String(row.data["ma_tinh_thanh"]).trim()
        }

        if (!shouldSkipValue(row.data["ten_tinh_thanh"], options.skipEmptyCells)) {
            mapped.ten_tinh_thanh = String(row.data["ten_tinh_thanh"]).trim()
        }

        // Map required fields with normalization
        if (!shouldSkipValue(row.data["mien"], options.skipEmptyCells)) {
            const normalized = normalizeMien(row.data["mien"])
            if (normalized) {
                mapped.mien = normalized as "Miền Bắc" | "Miền Trung" | "Miền Nam"
            }
        }

        if (!shouldSkipValue(row.data["vung"], options.skipEmptyCells)) {
            const vungValue = String(row.data["vung"]).trim()
            if (vungValue) {
                mapped.vung = vungValue as "Đồng bằng sông Hồng" | "Trung du và miền núi phía Bắc" | "Bắc Trung Bộ" | "Duyên hải Nam Trung Bộ" | "Tây Nguyên" | "Đông Nam Bộ" | "Đồng bằng sông Cửu Long"
            }
        }

        return mapped
    })
}

export function TinhThanhSSNImportDialog({ open, onOpenChange, mutation }: TinhThanhSSNImportDialogProps) {
    const defaultMutation = useBatchUpsertTinhThanhSSN()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions, _setImportOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update', // Update mode: update if exists, insert if not
    })

    const handleImport = async (rows: Partial<TinhThanhSSN>[]): Promise<{
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
            return {
                success: false,
                inserted: 0,
                updated: 0,
                failed: rows.length,
                errors: rows.map((_, index) => ({
                    rowNumber: index + 1,
                    errors: [error instanceof Error ? error.message : "Lỗi không xác định"],
                })),
            }
        }
    }

    return (
        <ImportDialog
            open={open}
            onOpenChange={onOpenChange}
            moduleName="tỉnh thành SSN"
            columnMappings={columnMappings}
            templateColumns={templateColumns}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={(rows) => {
                const options: ImportOptions = {
                    skipEmptyCells: true,
                    upsertMode: 'update',
                    dateFormat: 'dd/mm/yyyy',
                }
                return mapExcelToDb(rows, options)
            }}
            onImport={handleImport}
            importOptions={importOptions}
        />
    )
}

