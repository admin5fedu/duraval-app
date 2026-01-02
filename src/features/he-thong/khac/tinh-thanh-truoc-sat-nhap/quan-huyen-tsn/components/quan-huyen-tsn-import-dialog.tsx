"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertQuanHuyenTSN } from "../actions/quan-huyen-tsn-excel-actions"
import { QuanHuyenTSN } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertQuanHuyenTSNReturn = ReturnType<typeof useBatchUpsertQuanHuyenTSN>

interface QuanHuyenTSNImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertQuanHuyenTSNReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "ma_tinh_thanh",
        excelNames: [
            "Mã tỉnh thành", "Mã Tỉnh Thành", "Ma tinh thanh", "Ma Tinh Thanh",
            "Mã_tỉnh_thành", "Mã_Tỉnh_Thành", "Ma_tinh_thanh", "Ma_Tinh_Thanh",
            "Mã Tỉnh", "Ma Tinh", "Tỉnh thành", "Tinh thanh"
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
            "Tên Tỉnh", "Ten Tinh", "Tên", "Ten", "Name", "name"
        ],
        required: true,
        type: "text",
        description: "Tên tỉnh thành (bắt buộc)",
    },
    {
        dbField: "ma_quan_huyen",
        excelNames: [
            "Mã quận huyện", "Mã Quận Huyện", "Ma quan huyen", "Ma Quan Huyen",
            "Mã_quận_huyện", "Mã_Quận_Huyện", "Ma_quan_huyen", "Ma_Quan_Huyen",
            "Mã", "Ma", "Code", "code"
        ],
        required: true,
        type: "text",
        description: "Mã quận huyện (bắt buộc)",
    },
    {
        dbField: "ten_quan_huyen",
        excelNames: [
            "Tên quận huyện", "Tên Quận Huyện", "Ten quan huyen", "Ten Quan Huyen",
            "Tên_quận_huyện", "Tên_Quận_Huyện", "Ten_quan_huyen", "Ten_Quan_Huyen",
            "Tên", "Ten", "Name", "name", "Quận huyện", "Quan huyen"
        ],
        required: true,
        type: "text",
        description: "Tên quận huyện (bắt buộc)",
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
        header: "Mã quận huyện",
        type: "text",
        required: true,
        description: "Mã quận huyện (bắt buộc)",
    },
    {
        header: "Tên quận huyện",
        type: "text",
        required: true,
        description: "Tên quận huyện (bắt buộc)",
    },
]

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

    if (!row.ma_quan_huyen || String(row.ma_quan_huyen).trim() === "") {
        errors.push("Mã quận huyện là bắt buộc")
    }

    if (!row.ten_quan_huyen || String(row.ten_quan_huyen).trim() === "") {
        errors.push("Tên quận huyện là bắt buộc")
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
        const maQuanHuyen = row.data.ma_quan_huyen

        if (maQuanHuyen) {
            const key = String(maQuanHuyen).trim().toLowerCase()
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
): Partial<QuanHuyenTSN>[] {
    return rows.map((row) => {
        const mapped: Partial<QuanHuyenTSN> = {}

        // Map required fields
        if (!shouldSkipValue(row.data["ma_tinh_thanh"], options.skipEmptyCells)) {
            mapped.ma_tinh_thanh = String(row.data["ma_tinh_thanh"]).trim()
        }

        if (!shouldSkipValue(row.data["ten_tinh_thanh"], options.skipEmptyCells)) {
            mapped.ten_tinh_thanh = String(row.data["ten_tinh_thanh"]).trim()
        }

        if (!shouldSkipValue(row.data["ma_quan_huyen"], options.skipEmptyCells)) {
            mapped.ma_quan_huyen = String(row.data["ma_quan_huyen"]).trim()
        }

        if (!shouldSkipValue(row.data["ten_quan_huyen"], options.skipEmptyCells)) {
            mapped.ten_quan_huyen = String(row.data["ten_quan_huyen"]).trim()
        }

        return mapped
    })
}

export function QuanHuyenTSNImportDialog({ open, onOpenChange, mutation }: QuanHuyenTSNImportDialogProps) {
    const defaultMutation = useBatchUpsertQuanHuyenTSN()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions, _setImportOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update', // Update mode: update if exists, insert if not
    })

    const handleImport = async (rows: Partial<QuanHuyenTSN>[]): Promise<{
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
            moduleName="quận huyện TSN"
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

