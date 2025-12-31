"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertLoaiDoanhThu } from "../actions/loai-doanh-thu-excel-actions"
import { LoaiDoanhThu } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertLoaiDoanhThuReturn = ReturnType<typeof useBatchUpsertLoaiDoanhThu>

interface LoaiDoanhThuImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertLoaiDoanhThuReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "ten_doanh_thu",
        excelNames: [
            "Tên doanh thu", "Tên Doanh Thu", "Ten doanh thu", "Ten Doanh Thu",
            "Tên_doanh_thu", "Tên_Doanh_Thu", "Ten_doanh_thu", "Ten_Doanh_Thu",
            "Doanh thu", "Doanh Thu", "Doanh thu", "Doanh Thu",
            "Revenue Type", "RevenueType", "revenue_type", "Name", "name"
        ],
        required: true,
        type: "text",
        description: "Tên doanh thu (bắt buộc)",
    },
    {
        dbField: "mo_ta",
        excelNames: [
            "Mô tả", "Mô Tả", "Mo ta", "Mo Ta",
            "Mô_tả", "Mô_Tả", "Mo_ta", "Mo_Ta",
            "Description", "description", "Desc", "desc", "Note", "note"
        ],
        required: false,
        type: "text",
        description: "Mô tả (không bắt buộc)",
    },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
    {
        header: "Tên doanh thu",
        type: "text",
        required: true,
        description: "Tên doanh thu (bắt buộc)",
    },
    {
        header: "Mô tả",
        type: "text",
        required: false,
        description: "Mô tả (không bắt buộc)",
    },
]

// Validate a single row
function validateRow(
    row: Record<string, any>,
    _rowNumber: number
): string[] {
    const errors: string[] = []

    // Required fields
    if (!row.ten_doanh_thu || String(row.ten_doanh_thu).trim() === "") {
        errors.push("Tên doanh thu là bắt buộc")
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
        const tenDoanhThu = row.data.ten_doanh_thu

        if (tenDoanhThu) {
            const key = String(tenDoanhThu).trim().toLowerCase()
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
): Partial<LoaiDoanhThu>[] {
    return rows.map((row) => {
        const mapped: Partial<LoaiDoanhThu> = {}

        // Map required fields
        if (!shouldSkipValue(row.data["ten_doanh_thu"], options.skipEmptyCells)) {
            mapped.ten_doanh_thu = String(row.data["ten_doanh_thu"]).trim()
        }

        // Map optional fields
        if (!shouldSkipValue(row.data["mo_ta"], options.skipEmptyCells)) {
            mapped.mo_ta = String(row.data["mo_ta"]).trim()
        }

        return mapped
    })
}

export function LoaiDoanhThuImportDialog({ open, onOpenChange, mutation }: LoaiDoanhThuImportDialogProps) {
    const defaultMutation = useBatchUpsertLoaiDoanhThu()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions, _setImportOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update', // Update mode: update if exists, insert if not
    })

    const handleImport = async (rows: Partial<LoaiDoanhThu>[]): Promise<{
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
    const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<LoaiDoanhThu>[] => {
        return mapExcelToDb(rows, importOptions)
    }

    return (
        <ImportDialog<Partial<LoaiDoanhThu>>
            open={open}
            onOpenChange={onOpenChange}
            onImport={handleImport}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={transformData}
            moduleName="loại doanh thu"
            templateColumns={templateColumns}
            columnMappings={columnMappings}
            enableAutoMapping={true}
            importOptions={importOptions}
        />
    )
}

