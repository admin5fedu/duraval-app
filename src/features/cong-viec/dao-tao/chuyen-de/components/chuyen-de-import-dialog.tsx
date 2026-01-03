"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertChuyenDe } from "../actions/chuyen-de-excel-actions"
import { ChuyenDe } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertChuyenDeReturn = ReturnType<typeof useBatchUpsertChuyenDe>

interface ChuyenDeImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertChuyenDeReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "ten_nhom_chuyen_de",
        excelNames: [
            "Nhóm chuyên đề", "Nhóm Chuyên Đề", "Nhom chuyen de", "Nhom Chuyen De",
            "Nhóm_chuyên_đề", "Nhóm_Chuyên_Đề", "Nhom_chuyen_de", "Nhom_Chuyen_De",
            "Nhóm", "Nhom", "Group", "group"
        ],
        required: true,
        type: "text",
        description: "Tên nhóm chuyên đề (bắt buộc) - dùng để tìm nhom_chuyen_de_id",
    },
    {
        dbField: "ten_chuyen_de",
        excelNames: [
            "Tên chuyên đề", "Tên Chuyên Đề", "Ten chuyen de", "Ten Chuyen De",
            "Tên_chuyên_đề", "Tên_Chuyên_Đề", "Ten_chuyen_de", "Ten_Chuyen_De",
            "Tên", "Ten", "Name", "name", "Chuyên đề", "Chuyen de"
        ],
        required: true,
        type: "text",
        description: "Tên chuyên đề (bắt buộc)",
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
        description: "Mô tả chuyên đề (tùy chọn)",
    },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
    {
        header: "Nhóm chuyên đề",
        type: "text",
        required: true,
        description: "Tên nhóm chuyên đề (bắt buộc) - phải tồn tại trong hệ thống",
    },
    {
        header: "Tên chuyên đề",
        type: "text",
        required: true,
        description: "Tên chuyên đề (bắt buộc)",
    },
    {
        header: "Mô tả",
        type: "text",
        required: false,
        description: "Mô tả chuyên đề (tùy chọn)",
    },
]

// Validate a single row
function validateRow(
    row: Record<string, any>,
    _rowNumber: number
): string[] {
    const errors: string[] = []

    // Required fields
    if (!row.ten_nhom_chuyen_de || String(row.ten_nhom_chuyen_de).trim() === "") {
        errors.push("Nhóm chuyên đề là bắt buộc")
    }

    if (!row.ten_chuyen_de || String(row.ten_chuyen_de).trim() === "") {
        errors.push("Tên chuyên đề là bắt buộc")
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
        const tenChuyenDe = row.data.ten_chuyen_de
        const tenNhomChuyenDe = row.data.ten_nhom_chuyen_de

        if (tenChuyenDe && tenNhomChuyenDe) {
            const key = `${String(tenChuyenDe).trim().toLowerCase()}|${String(tenNhomChuyenDe).trim().toLowerCase()}`
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
): Partial<ChuyenDe>[] {
    return rows.map((row) => {
        const mapped: Partial<ChuyenDe> = {}

        // Map ten_nhom_chuyen_de (will be resolved to nhom_chuyen_de_id in the action)
        if (!shouldSkipValue(row.data["ten_nhom_chuyen_de"], options.skipEmptyCells)) {
            mapped.ten_nhom_chuyen_de = String(row.data["ten_nhom_chuyen_de"]).trim()
        }

        // Map required fields
        if (!shouldSkipValue(row.data["ten_chuyen_de"], options.skipEmptyCells)) {
            mapped.ten_chuyen_de = String(row.data["ten_chuyen_de"]).trim()
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

export function ChuyenDeImportDialog({ open, onOpenChange, mutation }: ChuyenDeImportDialogProps) {
    const defaultMutation = useBatchUpsertChuyenDe()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions, _setImportOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update', // Update mode: update if exists, insert if not
    })

    const handleImport = async (rows: Partial<ChuyenDe>[]): Promise<{
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
            moduleName="chuyên đề"
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

