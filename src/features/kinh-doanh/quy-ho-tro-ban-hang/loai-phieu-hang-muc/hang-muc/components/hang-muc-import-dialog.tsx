"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertHangMuc } from "../actions/hang-muc-excel-actions"
import { HangMuc } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertHangMucReturn = ReturnType<typeof useBatchUpsertHangMuc>

interface HangMucImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertHangMucReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "ten_hang_muc",
        excelNames: [
            "Tên hạng mục", "Tên Hạng Mục", "Ten hang muc", "Ten Hang Muc",
            "Tên_hạng_mục", "Tên_Hạng_Mục", "Ten_hang_muc", "Ten_Hang_Muc",
            "Hạng mục", "Hạng Mục", "Hang muc", "Hang Muc",
            "Item Name", "ItemName", "item_name", "Name", "name"
        ],
        required: true,
        type: "text",
        description: "Tên hạng mục (bắt buộc)",
    },
    {
        dbField: "loai_phieu_id",
        excelNames: [
            "Loại phiếu ID", "Loại Phiếu ID", "Loai phieu ID", "Loai Phieu ID",
            "Loại_phiếu_ID", "Loại_Phiếu_ID", "Loai_phieu_ID", "Loai_Phieu_ID",
            "Loại phiếu", "Loại Phiếu", "Loai phieu", "Loai Phieu",
            "Type ID", "TypeID", "type_id", "Type", "type"
        ],
        required: false,
        type: "number",
        description: "ID loại phiếu (không bắt buộc)",
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
        header: "Tên hạng mục",
        type: "text",
        required: true,
        description: "Tên hạng mục (bắt buộc)",
    },
    {
        header: "Loại phiếu ID",
        type: "number",
        required: false,
        description: "ID loại phiếu (không bắt buộc)",
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
    if (!row.ten_hang_muc || String(row.ten_hang_muc).trim() === "") {
        errors.push("Tên hạng mục là bắt buộc")
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
        const tenHangMuc = row.data.ten_hang_muc

        if (tenHangMuc) {
            const key = String(tenHangMuc).trim().toLowerCase()
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
): Partial<HangMuc>[] {
    return rows.map((row) => {
        const mapped: Partial<HangMuc> = {}

        // Map required fields
        if (!shouldSkipValue(row.data["ten_hang_muc"], options.skipEmptyCells)) {
            mapped.ten_hang_muc = String(row.data["ten_hang_muc"]).trim()
        }

        // Map optional fields
        if (!shouldSkipValue(row.data["loai_phieu_id"], options.skipEmptyCells)) {
            const loaiPhieuId = row.data["loai_phieu_id"]
            mapped.loai_phieu_id = loaiPhieuId ? Number(loaiPhieuId) : null
        }

        if (!shouldSkipValue(row.data["mo_ta"], options.skipEmptyCells)) {
            mapped.mo_ta = String(row.data["mo_ta"]).trim()
        }

        return mapped
    })
}

export function HangMucImportDialog({ open, onOpenChange, mutation }: HangMucImportDialogProps) {
    const defaultMutation = useBatchUpsertHangMuc()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions, _setImportOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update', // Update mode: update if exists, insert if not
    })

    const handleImport = async (rows: Partial<HangMuc>[]): Promise<{
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
    const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<HangMuc>[] => {
        return mapExcelToDb(rows, importOptions)
    }

    return (
        <ImportDialog<Partial<HangMuc>>
            open={open}
            onOpenChange={onOpenChange}
            onImport={handleImport}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={transformData}
            moduleName="hạng mục"
            templateColumns={templateColumns}
            columnMappings={columnMappings}
            enableAutoMapping={true}
            importOptions={importOptions}
        />
    )
}

