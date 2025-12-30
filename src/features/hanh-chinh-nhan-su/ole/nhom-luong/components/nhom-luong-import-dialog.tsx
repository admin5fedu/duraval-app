"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertNhomLuong } from "../actions/nhom-luong-excel-actions"
import type { NhomLuong } from "../types"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertNhomLuongReturn = ReturnType<typeof useBatchUpsertNhomLuong>

interface NhomLuongImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertNhomLuongReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "ten_nhom",
        excelNames: [
            "Tên nhóm", "Tên Nhóm", "Ten nhom", "Ten Nhom",
            "Tên_nhóm", "Ten_nhom",
            "Name", "name", "Group Name", "group name", "Title", "title"
        ],
        required: true,
        type: "text",
        description: "Tên nhóm (bắt buộc)",
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
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
    {
        header: "Tên nhóm",
        type: "text",
        required: true,
        description: "Tên nhóm (bắt buộc)",
    },
    {
        header: "Mô tả",
        type: "text",
        required: false,
        description: "Mô tả (tùy chọn)",
    },
]

// Validate a single row
function validateRow(
    row: Record<string, any>
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
            const key = String(tenNhom).trim()
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
): Partial<NhomLuong>[] {
    return rows.map((row) => {
        const mapped: Partial<NhomLuong> = {}

        // Map required fields
        if (!shouldSkipValue(row.data["ten_nhom"], options.skipEmptyCells)) {
            mapped.ten_nhom = String(row.data["ten_nhom"]).trim()
        }

        // Map optional fields
        if (!shouldSkipValue(row.data["mo_ta"], options.skipEmptyCells)) {
            mapped.mo_ta = String(row.data["mo_ta"]).trim() || null
        }

        return mapped
    })
}

export function NhomLuongImportDialog({ open, onOpenChange, mutation }: NhomLuongImportDialogProps) {
    const defaultMutation = useBatchUpsertNhomLuong()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update', // Update mode: update if exists, insert if not
    })

    const handleImport = async (rows: Partial<NhomLuong>[]): Promise<{
        success: boolean
        inserted: number
        updated: number
        failed: number
        errors?: Array<{ rowNumber: number; errors: string[] }>
    }> => {
        try {
            // Convert rows to ExcelRow format for mutation
            const excelRows = rows.map((row) => ({
                ten_nhom: row.ten_nhom,
                mo_ta: row.mo_ta,
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
    const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<NhomLuong>[] => {
        return mapExcelToDb(rows, importOptions)
    }

    return (
        <ImportDialog<Partial<NhomLuong>>
            open={open}
            onOpenChange={onOpenChange}
            onImport={handleImport}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={transformData}
            moduleName="nhóm lương"
            
            templateColumns={templateColumns}
            columnMappings={columnMappings}
            enableAutoMapping={true}
            importOptions={importOptions}
            
        />
    )
}

