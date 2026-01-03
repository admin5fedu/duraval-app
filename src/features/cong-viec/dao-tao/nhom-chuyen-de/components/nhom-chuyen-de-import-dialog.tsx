"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertNhomChuyenDe } from "../actions/nhom-chuyen-de-excel-actions"
import { NhomChuyenDe } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertNhomChuyenDeReturn = ReturnType<typeof useBatchUpsertNhomChuyenDe>

interface NhomChuyenDeImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertNhomChuyenDeReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "ten_nhom",
        excelNames: [
            "Tên nhóm", "Tên Nhóm", "Ten nhom", "Ten Nhom",
            "Tên_nhóm", "Tên_Nhóm", "Ten_nhom", "Ten_Nhom",
            "Tên", "Ten", "Name", "name", "Nhóm", "Nhom"
        ],
        required: true,
        type: "text",
        description: "Tên nhóm chuyên đề (bắt buộc)",
    },
    {
        dbField: "mo_ta",
        excelNames: [
            "Mô tả", "Mô Tả", "Mo ta", "Mo Ta",
            "Mô_tả", "Mô_Tả", "Mo_ta", "Mo_Ta",
            "Mô tả", "Description", "description", "Mô tả", "Mo ta"
        ],
        required: false,
        type: "text",
        description: "Mô tả nhóm chuyên đề (tùy chọn)",
    },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
    {
        header: "Tên nhóm",
        type: "text",
        required: true,
        description: "Tên nhóm chuyên đề (bắt buộc)",
    },
    {
        header: "Mô tả",
        type: "text",
        required: false,
        description: "Mô tả nhóm chuyên đề (tùy chọn)",
    },
]

// Validate a single row
function validateRow(
    row: Record<string, any>,
    _rowNumber: number
): string[] {
    const errors: string[] = []

    // Required fields
    if (!row.ten_nhom || String(row.ten_nhom).trim() === "") {
        errors.push("Tên nhóm là bắt buộc")
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
        const tenNhom = row.data.ten_nhom

        if (tenNhom) {
            const key = String(tenNhom).trim().toLowerCase()
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
): Partial<NhomChuyenDe>[] {
    return rows.map((row) => {
        const mapped: Partial<NhomChuyenDe> = {}

        // Map required fields
        if (!shouldSkipValue(row.data["ten_nhom"], options.skipEmptyCells)) {
            mapped.ten_nhom = String(row.data["ten_nhom"]).trim()
        }

        // Map optional fields
        if (!shouldSkipValue(row.data["mo_ta"], options.skipEmptyCells)) {
            const moTaValue = String(row.data["mo_ta"]).trim()
            if (moTaValue) {
                mapped.mo_ta = moTaValue
            }
        }

        return mapped
    })
}

export function NhomChuyenDeImportDialog({ open, onOpenChange, mutation }: NhomChuyenDeImportDialogProps) {
    const defaultMutation = useBatchUpsertNhomChuyenDe()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions, _setImportOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update', // Update mode: update if exists, insert if not
    })

    const handleImport = async (rows: Partial<NhomChuyenDe>[]): Promise<{
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
            moduleName="nhóm chuyên đề"
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

