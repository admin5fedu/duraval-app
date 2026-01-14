"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertCapBac } from "../actions/cap-bac-excel-actions"
import { CapBac } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertCapBacReturn = ReturnType<typeof useBatchUpsertCapBac>

interface CapBacImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertCapBacReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "ten_cap_bac",
        excelNames: [
            "Tên cấp bậc", "Tên Cấp Bậc", "Ten cap bac", "Ten Cap Bac",
            "Tên_CB", "Tên_cb", "Ten_CB", "Ten_cb",
            "Level Name", "LevelName", "level_name", "Name", "name"
        ],
        required: true,
        type: "text",
        description: "Tên cấp bậc (bắt buộc)",
    },
    {
        dbField: "cap_bac",
        excelNames: [
            "Bậc", "bac", "Bac", "BAC",
            "Grade", "grade", "Level", "level", "Rank", "rank"
        ],
        required: true,
        type: "number",
        description: "Bậc (bắt buộc, phải là số nguyên dương)",
    },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
    {
        header: "Tên cấp bậc",
        type: "text",
        required: true,
        description: "Tên cấp bậc (bắt buộc)",
    },
    {
        header: "Bậc",
        type: "number",
        required: true,
        description: "Bậc (bắt buộc, phải là số nguyên dương)",
    },
]

// Validate a single row
function validateRow(
    row: Record<string, any>,
    _rowNumber: number
): string[] {
    const errors: string[] = []

    // Required fields
    if (!row.ten_cap_bac || String(row.ten_cap_bac).trim() === "") {
        errors.push("Tên cấp bậc là bắt buộc")
    }

    if (!row.cap_bac || isNaN(Number(row.cap_bac))) {
        errors.push("Bậc phải là số nguyên dương")
    } else {
        const capBacNumber = Number(row.cap_bac)
        if (capBacNumber < 1 || !Number.isInteger(capBacNumber)) {
            errors.push("Bậc phải là số nguyên dương")
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
        const tenCapBac = row.data.ten_cap_bac

        if (tenCapBac) {
            const key = String(tenCapBac).trim()
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
): Partial<CapBac>[] {
    return rows.map((row) => {
        const mapped: Partial<CapBac> = {}

        // Map required fields
        if (!shouldSkipValue(row.data["ten_cap_bac"], options.skipEmptyCells)) {
            mapped.ten_cap_bac = String(row.data["ten_cap_bac"]).trim()
        }

        if (!shouldSkipValue(row.data["cap_bac"], options.skipEmptyCells)) {
            mapped.cap_bac = Number(row.data["cap_bac"])
        }

        return mapped
    })
}

export function CapBacImportDialog({ open, onOpenChange, mutation }: CapBacImportDialogProps) {
    const defaultMutation = useBatchUpsertCapBac()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update', // Update mode: update if exists, insert if not
    })

    const handleImport = async (rows: Partial<CapBac>[]): Promise<{
        success: boolean
        inserted: number
        updated: number
        failed: number
        errors?: Array<{ rowNumber: number; errors: string[] }>
    }> => {
        try {
            // Convert rows to ExcelRow format for mutation
            const excelRows = rows.map((row) => ({
                ten_cap_bac: row.ten_cap_bac,
                cap_bac: row.cap_bac,
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
    const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<CapBac>[] => {
        return mapExcelToDb(rows, importOptions)
    }

    return (
        <ImportDialog<Partial<CapBac>>
            open={open}
            onOpenChange={onOpenChange}
            onImport={handleImport}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={transformData}
            moduleName="cấp bậc"
            templateColumns={templateColumns}
            columnMappings={columnMappings}
            enableAutoMapping={true}
            importOptions={importOptions}
        />
    )
}

