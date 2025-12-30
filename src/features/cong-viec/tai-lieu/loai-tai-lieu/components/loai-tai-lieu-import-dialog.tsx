"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertLoaiTaiLieu } from "../actions/loai-tai-lieu-excel-actions"
import { LoaiTaiLieu } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertLoaiTaiLieuReturn = ReturnType<typeof useBatchUpsertLoaiTaiLieu>

interface LoaiTaiLieuImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertLoaiTaiLieuReturn
}

// Template columns for export
const templateColumns: TemplateColumn[] = [
    {
        header: "Hạng mục",
        type: "text",
        required: true,
        description: "Hạng mục tài liệu (bắt buộc): Biểu mẫu & Kế hoạch hoặc Văn bản hệ thống",
    },
    {
        header: "Loại",
        type: "text",
        required: true,
        description: "Loại tài liệu (bắt buộc)",
    },
    {
        header: "Mô tả",
        type: "text",
        required: false,
        description: "Mô tả loại tài liệu (không bắt buộc)",
    },
]

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "hang_muc",
        excelNames: [
            "Hạng mục", "Hạng Mục", "Hang muc", "Hang Muc",
            "Hạng_mục", "Hạng_Mục", "Hang_muc", "Hang_Muc",
            "Category", "category", "Cat", "cat"
        ],
        required: true,
        type: "text",
        description: "Hạng mục tài liệu (bắt buộc): Biểu mẫu & Kế hoạch hoặc Văn bản hệ thống",
    },
    {
        dbField: "loai",
        excelNames: [
            "Loại", "Loai",
            "Loại tài liệu", "Loai tai lieu",
            "Type", "type", "Kind", "kind"
        ],
        required: true,
        type: "text",
        description: "Loại tài liệu (bắt buộc)",
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
        description: "Mô tả loại tài liệu (không bắt buộc)",
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
        if (hangMuc !== "Biểu mẫu & Kế hoạch" && hangMuc !== "Văn bản hệ thống") {
            errors.push("Hạng mục phải là 'Biểu mẫu & Kế hoạch' hoặc 'Văn bản hệ thống'")
        }
    }

    if (!row.loai || String(row.loai).trim() === "") {
        errors.push("Loại là bắt buộc")
    }

    return errors
}

// Check for duplicates within the import data (using hang_muc + loai combination)
function checkDuplicates(
    rows: Array<{ rowNumber: number; data: Record<string, any> }>
): Map<string, number[]> {
    const duplicates = new Map<string, number[]>()

    rows.forEach((row, index) => {
        const hangMuc = row.data.hang_muc || ""
        const loai = row.data.loai || ""
        const key = `${String(hangMuc).trim().toLowerCase()}_${String(loai).trim().toLowerCase()}`

        if (key !== "_") { // Only check if at least one field has value
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
): Partial<LoaiTaiLieu>[] {
    return rows.map((row) => {
        const mapped: Partial<LoaiTaiLieu> = {}

        // Map optional fields
        if (!shouldSkipValue(row.data["hang_muc"], options.skipEmptyCells)) {
            mapped.hang_muc = String(row.data["hang_muc"]).trim()
        }

        if (!shouldSkipValue(row.data["loai"], options.skipEmptyCells)) {
            mapped.loai = String(row.data["loai"]).trim()
        }

        if (!shouldSkipValue(row.data["mo_ta"], options.skipEmptyCells)) {
            mapped.mo_ta = String(row.data["mo_ta"]).trim()
        }

        return mapped
    })
}

export function LoaiTaiLieuImportDialog({ open, onOpenChange, mutation }: LoaiTaiLieuImportDialogProps) {
    const defaultMutation = useBatchUpsertLoaiTaiLieu()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update', // Update mode: update if exists (hang_muc + loai), insert if not
    })

    const handleImport = async (rows: Partial<LoaiTaiLieu>[]): Promise<{
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
    const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<LoaiTaiLieu>[] => {
        return mapExcelToDb(rows, importOptions)
    }

    return (
        <ImportDialog<Partial<LoaiTaiLieu>>
            open={open}
            onOpenChange={onOpenChange}
            onImport={handleImport}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={transformData}
            moduleName="loại tài liệu"
            templateColumns={templateColumns}
            columnMappings={columnMappings}
            enableAutoMapping={true}
            importOptions={importOptions}
        />
    )
}

