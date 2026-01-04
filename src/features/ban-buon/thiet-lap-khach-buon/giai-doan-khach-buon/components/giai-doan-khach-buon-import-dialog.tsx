"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertGiaiDoanKhachBuon } from "../actions/giai-doan-khach-buon-excel-actions"
import { GiaiDoanKhachBuon } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertGiaiDoanKhachBuonReturn = ReturnType<typeof useBatchUpsertGiaiDoanKhachBuon>

interface GiaiDoanKhachBuonImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertGiaiDoanKhachBuonReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "ma_giai_doan",
        excelNames: [
            "Mã giai đoạn", "Mã Giai Đoạn", "Ma giai doan", "Ma Giai Doan",
            "Mã_giai_đoạn", "Mã_Giai_Đoạn", "Ma_giai_doan", "Ma_Giai_Doan",
            "Mã", "Ma", "Code", "code", "Mã GD", "Ma GD"
        ],
        required: true,
        type: "text",
        description: "Mã giai đoạn (bắt buộc)",
    },
    {
        dbField: "ten_giai_doan",
        excelNames: [
            "Tên giai đoạn", "Tên Giai Đoạn", "Ten giai doan", "Ten Giai Doan",
            "Tên_giai_đoạn", "Tên_Giai_Đoạn", "Ten_giai_doan", "Ten_Giai_Doan",
            "Giai đoạn", "Giai Đoạn", "Giai doan", "Giai Doan",
            "Name", "name", "Tên", "Ten", "Title", "title"
        ],
        required: true,
        type: "text",
        description: "Tên giai đoạn (bắt buộc)",
    },
    {
        dbField: "tt",
        excelNames: [
            "Thứ tự", "Thứ Tự", "Thu tu", "Thu Tu",
            "Thứ_tự", "Thứ_Tự", "Thu_tu", "Thu_Tu",
            "Order", "order", "Sort", "sort", "TT", "tt", "Stt", "STT"
        ],
        required: true,
        type: "number",
        description: "Thứ tự (bắt buộc)",
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
        header: "Mã giai đoạn",
        type: "text",
        required: true,
        description: "Mã giai đoạn (bắt buộc)",
    },
    {
        header: "Tên giai đoạn",
        type: "text",
        required: true,
        description: "Tên giai đoạn (bắt buộc)",
    },
    {
        header: "Thứ tự",
        type: "number",
        required: true,
        description: "Thứ tự (bắt buộc)",
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
    if (!row.ma_giai_doan || String(row.ma_giai_doan).trim() === "") {
        errors.push("Mã giai đoạn là bắt buộc")
    }
    
    if (!row.ten_giai_doan || String(row.ten_giai_doan).trim() === "") {
        errors.push("Tên giai đoạn là bắt buộc")
    }
    
    if (row.tt === null || row.tt === undefined || row.tt === "") {
        errors.push("Thứ tự là bắt buộc")
    } else {
        const ttValue = typeof row.tt === 'number' ? row.tt : parseFloat(String(row.tt))
        if (isNaN(ttValue) || ttValue < 1) {
            errors.push("Thứ tự phải là số lớn hơn 0")
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
        const tenGiaiDoan = row.data.ten_giai_doan

        if (tenGiaiDoan) {
            const key = String(tenGiaiDoan).trim().toLowerCase()
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
): Partial<GiaiDoanKhachBuon>[] {
    return rows.map((row) => {
        const mapped: Partial<GiaiDoanKhachBuon> = {}

        // Map required fields
        if (!shouldSkipValue(row.data["ma_giai_doan"], options.skipEmptyCells)) {
            mapped.ma_giai_doan = String(row.data["ma_giai_doan"]).trim()
        }

        // Map required fields
        if (!shouldSkipValue(row.data["ten_giai_doan"], options.skipEmptyCells)) {
            mapped.ten_giai_doan = String(row.data["ten_giai_doan"]).trim()
        }

        // Map required fields
        if (!shouldSkipValue(row.data["tt"], options.skipEmptyCells)) {
            const ttValue = row.data["tt"]
            if (ttValue !== null && ttValue !== undefined && ttValue !== "") {
                const numValue = typeof ttValue === 'number' ? ttValue : parseFloat(String(ttValue))
                if (!isNaN(numValue)) {
                    mapped.tt = numValue
                }
            }
        }

        if (!shouldSkipValue(row.data["mo_ta"], options.skipEmptyCells)) {
            mapped.mo_ta = String(row.data["mo_ta"]).trim()
        }

        return mapped
    })
}

export function GiaiDoanKhachBuonImportDialog({ open, onOpenChange, mutation }: GiaiDoanKhachBuonImportDialogProps) {
    const defaultMutation = useBatchUpsertGiaiDoanKhachBuon()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions, _setImportOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update', // Update mode: update if exists, insert if not
    })

    const handleImport = async (rows: Partial<GiaiDoanKhachBuon>[]): Promise<{
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
    const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<GiaiDoanKhachBuon>[] => {
        return mapExcelToDb(rows, importOptions)
    }

    return (
        <ImportDialog<Partial<GiaiDoanKhachBuon>>
            open={open}
            onOpenChange={onOpenChange}
            onImport={handleImport}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={transformData}
            moduleName="giai đoạn khách buôn"
            templateColumns={templateColumns}
            columnMappings={columnMappings}
            enableAutoMapping={true}
            importOptions={importOptions}
        />
    )
}

