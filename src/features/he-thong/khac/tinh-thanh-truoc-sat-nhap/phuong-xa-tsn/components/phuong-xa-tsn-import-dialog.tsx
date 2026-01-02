"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertPhuongXaTSN } from "../actions/phuong-xa-tsn-excel-actions"
import { PhuongXaTSN } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertPhuongXaTSNReturn = ReturnType<typeof useBatchUpsertPhuongXaTSN>

interface PhuongXaTSNImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertPhuongXaTSNReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "ma_quan_huyen",
        excelNames: [
            "Mã quận huyện", "Mã Quận Huyện", "Ma quan huyen", "Ma Quan Huyen",
            "Mã_quận_huyện", "Mã_Quận_Huyện", "Ma_quan_huyen", "Ma_Quan_Huyen",
            "Mã QH", "Ma QH", "Quận huyện", "Quan huyen"
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
            "Tên QH", "Ten QH", "Tên", "Ten", "Name", "name"
        ],
        required: true,
        type: "text",
        description: "Tên quận huyện (bắt buộc)",
    },
    {
        dbField: "ma_phuong_xa",
        excelNames: [
            "Mã phường xã", "Mã Phường Xã", "Ma phuong xa", "Ma Phuong Xa",
            "Mã_phường_xã", "Mã_Phường_Xã", "Ma_phuong_xa", "Ma_Phuong_Xa",
            "Mã", "Ma", "Code", "code"
        ],
        required: true,
        type: "text",
        description: "Mã phường xã (bắt buộc)",
    },
    {
        dbField: "ten_phuong_xa",
        excelNames: [
            "Tên phường xã", "Tên Phường Xã", "Ten phuong xa", "Ten Phuong Xa",
            "Tên_phường_xã", "Tên_Phường_Xã", "Ten_phuong_xa", "Ten_Phuong_Xa",
            "Tên", "Ten", "Name", "name", "Phường xã", "Phuong xa"
        ],
        required: true,
        type: "text",
        description: "Tên phường xã (bắt buộc)",
    },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
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
    {
        header: "Mã phường xã",
        type: "text",
        required: true,
        description: "Mã phường xã (bắt buộc)",
    },
    {
        header: "Tên phường xã",
        type: "text",
        required: true,
        description: "Tên phường xã (bắt buộc)",
    },
]

// Validate a single row
function validateRow(
    row: Record<string, any>,
    _rowNumber: number
): string[] {
    const errors: string[] = []

    // Required fields
    if (!row.ma_quan_huyen || String(row.ma_quan_huyen).trim() === "") {
        errors.push("Mã quận huyện là bắt buộc")
    }

    if (!row.ten_quan_huyen || String(row.ten_quan_huyen).trim() === "") {
        errors.push("Tên quận huyện là bắt buộc")
    }

    if (!row.ma_phuong_xa || String(row.ma_phuong_xa).trim() === "") {
        errors.push("Mã phường xã là bắt buộc")
    }

    if (!row.ten_phuong_xa || String(row.ten_phuong_xa).trim() === "") {
        errors.push("Tên phường xã là bắt buộc")
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
        const maPhuongXa = row.data.ma_phuong_xa

        if (maPhuongXa) {
            const key = String(maPhuongXa).trim().toLowerCase()
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
): Partial<PhuongXaTSN>[] {
    return rows.map((row) => {
        const mapped: Partial<PhuongXaTSN> = {}

        // Map required fields
        if (!shouldSkipValue(row.data["ma_quan_huyen"], options.skipEmptyCells)) {
            mapped.ma_quan_huyen = String(row.data["ma_quan_huyen"]).trim()
        }

        if (!shouldSkipValue(row.data["ten_quan_huyen"], options.skipEmptyCells)) {
            mapped.ten_quan_huyen = String(row.data["ten_quan_huyen"]).trim()
        }

        if (!shouldSkipValue(row.data["ma_phuong_xa"], options.skipEmptyCells)) {
            mapped.ma_phuong_xa = String(row.data["ma_phuong_xa"]).trim()
        }

        if (!shouldSkipValue(row.data["ten_phuong_xa"], options.skipEmptyCells)) {
            mapped.ten_phuong_xa = String(row.data["ten_phuong_xa"]).trim()
        }

        return mapped
    })
}

export function PhuongXaTSNImportDialog({ open, onOpenChange, mutation }: PhuongXaTSNImportDialogProps) {
    const defaultMutation = useBatchUpsertPhuongXaTSN()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions, _setImportOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update', // Update mode: update if exists, insert if not
    })

    const handleImport = async (rows: Partial<PhuongXaTSN>[]): Promise<{
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
            moduleName="phường xã TSN"
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

