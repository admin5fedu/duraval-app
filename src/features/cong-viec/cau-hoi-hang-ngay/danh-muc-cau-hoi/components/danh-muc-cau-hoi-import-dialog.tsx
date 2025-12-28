"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertDanhMucCauHoi } from "../actions/danh-muc-cau-hoi-excel-actions"
import { DanhMucCauHoi } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertDanhMucCauHoiReturn = ReturnType<typeof useBatchUpsertDanhMucCauHoi>

interface DanhMucCauHoiImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertDanhMucCauHoiReturn
}

// Template columns for export
const templateColumns: TemplateColumn[] = [
    {
        name: "ten_nhom",
        label: "Tên nhóm",
        type: "string",
        required: true,
        description: "Tên nhóm câu hỏi (bắt buộc)",
    },
    {
        name: "mo_ta",
        label: "Mô tả",
        type: "string",
        required: false,
        description: "Mô tả nhóm câu hỏi (không bắt buộc)",
    },
]

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "ten_nhom",
        excelNames: [
            "Tên nhóm", "Tên Nhóm", "Ten nhom", "Ten Nhom",
            "Tên_nhóm", "Tên_Nhóm", "Ten_nhom", "Ten_Nhom",
            "Tên nhóm câu hỏi", "Tên Nhóm Câu Hỏi", "Ten nhom cau hoi", "Ten Nhom Cau Hoi",
            "Group Name", "GroupName", "group_name", "Name", "name", "Title", "title"
        ],
        required: true,
        type: "string",
        description: "Tên nhóm câu hỏi (bắt buộc)",
    },
    {
        dbField: "mo_ta",
        excelNames: [
            "Mô tả", "Mô Tả", "Mo ta", "Mo Ta",
            "Mô_tả", "Mô_Tả", "Mo_ta", "Mo_Ta",
            "Mô tả nhóm", "Mô Tả Nhóm", "Mo ta nhom", "Mo Ta Nhom",
            "Description", "description", "Desc", "desc", "Note", "note"
        ],
        required: false,
        type: "string",
        description: "Mô tả nhóm câu hỏi (không bắt buộc)",
    },
]

// Validate a single row
function validateRow(
    row: Record<string, any>,
    rowNumber: number
): string[] {
    const errors: string[] = []

    // Required fields
    if (!row.ten_nhom || String(row.ten_nhom).trim() === "") {
        errors.push("Tên nhóm là bắt buộc")
    }

    return errors
}

// Check for duplicates within the import data (ten_nhom)
function checkDuplicates(
    rows: Array<{ rowNumber: number; data: Record<string, any> }>
): Map<string, number[]> {
    const duplicates = new Map<string, number[]>()

    rows.forEach((row, index) => {
        const tenNhom = row.data.ten_nhom

        if (tenNhom) {
            const key = String(tenNhom).trim().toLowerCase()
            if (!duplicates.has(key)) {
                duplicates.set(key, [])
            }
            duplicates.get(key)!.push(index)
        }
    })

    // Only keep keys with more than one occurrence
    const result = new Map<string, number[]>()
    duplicates.forEach((indices, key) => {
        if (indices.length > 1) {
            result.set(key, indices)
        }
    })

    return result
}

// Map Excel columns to database fields
function mapExcelToDb(
    rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>,
    options: ImportOptions
): Partial<DanhMucCauHoi>[] {
    return rows.map((row) => {
        const mapped: Partial<DanhMucCauHoi> = {}

        // Map required fields
        if (row.data["ten_nhom"] !== undefined && row.data["ten_nhom"] !== null && row.data["ten_nhom"] !== "") {
            mapped.ten_nhom = String(row.data["ten_nhom"]).trim()
        }

        // Map optional fields
        if (!shouldSkipValue(row.data["mo_ta"], options.skipEmptyCells)) {
            mapped.mo_ta = String(row.data["mo_ta"]).trim()
        }

        return mapped
    })
}

export function DanhMucCauHoiImportDialog({ open, onOpenChange, mutation }: DanhMucCauHoiImportDialogProps) {
    const defaultMutation = useBatchUpsertDanhMucCauHoi()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions, setImportOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'upsert', // Upsert mode: update if exists (ten_nhom), insert if not
    })

    const handleImport = async (rows: Partial<DanhMucCauHoi>[]): Promise<{
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
    const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<DanhMucCauHoi>[] => {
        return mapExcelToDb(rows, importOptions)
    }

    return (
        <ImportDialog<Partial<DanhMucCauHoi>>
            open={open}
            onOpenChange={onOpenChange}
            onImport={handleImport}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={transformData}
            moduleName="danh mục câu hỏi"
            expectedHeaders={["ten_nhom"]} // Use db field names after mapping
            templateColumns={templateColumns}
            columnMappings={columnMappings}
            enableAutoMapping={true}
            importOptions={importOptions}
            onOptionsChange={setImportOptions}
        />
    )
}

