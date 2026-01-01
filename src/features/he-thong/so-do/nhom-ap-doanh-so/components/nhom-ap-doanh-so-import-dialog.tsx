"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertNhomApDoanhSo } from "../actions/nhom-ap-doanh-so-excel-actions"
import { NhomApDoanhSo } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertNhomApDoanhSoReturn = ReturnType<typeof useBatchUpsertNhomApDoanhSo>

interface NhomApDoanhSoImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertNhomApDoanhSoReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "ma_nhom_ap",
        excelNames: [
            "Mã nhóm áp", "Mã Nhóm Áp", "Ma nhom ap", "Ma Nhom Ap",
            "Mã_NA", "Mã_na", "Ma_NA", "Ma_na",
            "Group Code", "GroupCode", "group_code", "Code", "code"
        ],
        required: true,
        type: "text",
        description: "Mã nhóm áp (bắt buộc)",
    },
    {
        dbField: "ten_nhom_ap",
        excelNames: [
            "Tên nhóm áp", "Tên Nhóm Áp", "Ten nhom ap", "Ten Nhom Ap",
            "Tên_NA", "Tên_na", "Ten_NA", "Ten_na",
            "Group Name", "GroupName", "group_name", "Name", "name"
        ],
        required: true,
        type: "text",
        description: "Tên nhóm áp (bắt buộc)",
    },
    {
        dbField: "mo_ta",
        excelNames: [
            "Mô tả", "Mô Tả", "Mo ta", "Mo Ta",
            "Description", "description", "desc", "Desc"
        ],
        required: false,
        type: "text",
        description: "Mô tả (không bắt buộc)",
    },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
    {
        header: "Mã nhóm áp",
        type: "text",
        required: true,
        description: "Mã nhóm áp (bắt buộc)",
    },
    {
        header: "Tên nhóm áp",
        type: "text",
        required: true,
        description: "Tên nhóm áp (bắt buộc)",
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
    if (!row.ma_nhom_ap || String(row.ma_nhom_ap).trim() === "") {
        errors.push("Mã nhóm áp là bắt buộc")
    }

    if (!row.ten_nhom_ap || String(row.ten_nhom_ap).trim() === "") {
        errors.push("Tên nhóm áp là bắt buộc")
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
        const maNhomAp = row.data.ma_nhom_ap

        if (maNhomAp) {
            const key = String(maNhomAp).trim()
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
): Partial<NhomApDoanhSo>[] {
    return rows.map((row) => {
        const mapped: Partial<NhomApDoanhSo> = {}

        // Map required fields
        if (!shouldSkipValue(row.data["ma_nhom_ap"], options.skipEmptyCells)) {
            mapped.ma_nhom_ap = String(row.data["ma_nhom_ap"]).trim()
        }

        if (!shouldSkipValue(row.data["ten_nhom_ap"], options.skipEmptyCells)) {
            mapped.ten_nhom_ap = String(row.data["ten_nhom_ap"]).trim()
        }

        // Map optional fields
        if (!shouldSkipValue(row.data["mo_ta"], options.skipEmptyCells)) {
            mapped.mo_ta = String(row.data["mo_ta"]).trim()
        }

        return mapped
    })
}

export function NhomApDoanhSoImportDialog({ open, onOpenChange, mutation }: NhomApDoanhSoImportDialogProps) {
    const defaultMutation = useBatchUpsertNhomApDoanhSo()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions, _setImportOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update', // Update mode: update if exists, insert if not
    })

    const handleImport = async (rows: Partial<NhomApDoanhSo>[]): Promise<{
        success: boolean
        inserted: number
        updated: number
        failed: number
        errors?: Array<{ rowNumber: number; errors: string[] }>
    }> => {
        try {
            // Convert rows to ExcelRow format for mutation
            const excelRows = rows.map((row) => ({
                ma_nhom_ap: row.ma_nhom_ap,
                ten_nhom_ap: row.ten_nhom_ap,
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
    const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<NhomApDoanhSo>[] => {
        return mapExcelToDb(rows, importOptions)
    }

    return (
        <ImportDialog<Partial<NhomApDoanhSo>>
            open={open}
            onOpenChange={onOpenChange}
            onImport={handleImport}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={transformData}
            moduleName="nhóm áp doanh số"
            
            templateColumns={templateColumns}
            columnMappings={columnMappings}
            enableAutoMapping={true}
            importOptions={importOptions}
            
        />
    )
}

