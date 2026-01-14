"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertPhongBan } from "../actions/phong-ban-excel-actions"
import { PhongBan } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertPhongBanReturn = ReturnType<typeof useBatchUpsertPhongBan>

interface PhongBanImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertPhongBanReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "tt",
        excelNames: [
            "Số thứ tự", "Số Thứ Tự", "So thu tu", "So Thu Tu",
            "STT", "stt", "TT", "tt", "Thứ tự", "Thu tu",
            "Order", "order", "Index", "index", "No", "no"
        ],
        required: true,
        type: "number",
        description: "Số thứ tự (bắt buộc)",
    },
    {
        dbField: "ma_phong_ban",
        excelNames: [
            "Mã phòng ban", "Mã Phòng Ban", "Ma phong ban", "Ma Phong Ban",
            "Mã_PB", "Mã_pb", "Ma_PB", "Ma_pb",
            "Department Code", "DepartmentCode", "dept_code", "Code", "code"
        ],
        required: true,
        type: "text",
        description: "Mã phòng ban (bắt buộc)",
    },
    {
        dbField: "ten_phong_ban",
        excelNames: [
            "Tên phòng ban", "Tên Phòng Ban", "Ten phong ban", "Ten Phong Ban",
            "Tên_PB", "Tên_pb", "Ten_PB", "Ten_pb",
            "Department Name", "DepartmentName", "dept_name", "Name", "name"
        ],
        required: true,
        type: "text",
        description: "Tên phòng ban (bắt buộc)",
    },
    {
        dbField: "cap_do",
        excelNames: [
            "Cấp độ", "Cấp Độ", "Cap do", "Cap Do",
            "Cấp_độ", "Cấp_Độ", "Cap_do", "Cap_Do",
            "Level", "level", "Grade", "grade"
        ],
        required: true,
        type: "text",
        description: "Cấp độ (bắt buộc)",
    },
    {
        dbField: "truc_thuoc_ma",
        excelNames: [
            "Trực thuộc mã", "Trực Thuộc Mã", "Truc thuoc ma", "Truc Thuộc Ma",
            "Mã_Trực_Thuộc", "Ma_Truc_Thuoc",
            "Parent Code", "ParentCode", "parent_code", "Parent", "parent"
        ],
        required: false,
        type: "text",
        description: "Mã trực thuộc (không bắt buộc)",
    },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
    {
        header: "Số thứ tự",
        type: "number",
        required: true,
        description: "Số thứ tự (bắt buộc)",
    },
    {
        header: "Mã phòng ban",
        type: "text",
        required: true,
        description: "Mã phòng ban (bắt buộc)",
    },
    {
        header: "Tên phòng ban",
        type: "text",
        required: true,
        description: "Tên phòng ban (bắt buộc)",
    },
    {
        header: "Cấp độ",
        type: "text",
        required: true,
        description: "Cấp độ (bắt buộc)",
    },
    {
        header: "Mã trực thuộc",
        type: "text",
        required: false,
        description: "Mã trực thuộc (không bắt buộc)",
    },
]

// Validate a single row
function validateRow(
    row: Record<string, any>,
    _rowNumber: number
): string[] {
    const errors: string[] = []

    // Required fields
    if (!row.tt || isNaN(Number(row.tt))) {
        errors.push("Thứ tự là bắt buộc và phải là số")
    }

    if (!row.ma_phong_ban || String(row.ma_phong_ban).trim() === "") {
        errors.push("Mã phòng ban là bắt buộc")
    }

    if (!row.ten_phong_ban || String(row.ten_phong_ban).trim() === "") {
        errors.push("Tên phòng ban là bắt buộc")
    }

    if (!row.cap_do || String(row.cap_do).trim() === "") {
        errors.push("Cấp độ là bắt buộc")
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
        const maPhongBan = row.data.ma_phong_ban

        if (maPhongBan) {
            const key = String(maPhongBan).trim()
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
): Partial<PhongBan>[] {
    return rows.map((row) => {
        const mapped: Partial<PhongBan> = {}

        // Map required fields
        if (!shouldSkipValue(row.data["tt"], options.skipEmptyCells)) {
            mapped.tt = Number(row.data["tt"])
        }

        // Map required fields
        if (!shouldSkipValue(row.data["ma_phong_ban"], options.skipEmptyCells)) {
            mapped.ma_phong_ban = String(row.data["ma_phong_ban"]).trim()
        }

        if (!shouldSkipValue(row.data["ten_phong_ban"], options.skipEmptyCells)) {
            mapped.ten_phong_ban = String(row.data["ten_phong_ban"]).trim()
        }

        if (!shouldSkipValue(row.data["cap_do"], options.skipEmptyCells)) {
            mapped.cap_do = String(row.data["cap_do"]).trim()
        }

        // Map optional fields
        if (!shouldSkipValue(row.data["truc_thuoc_ma"], options.skipEmptyCells)) {
            mapped.truc_thuoc_ma = String(row.data["truc_thuoc_ma"]).trim()
        }

        return mapped
    })
}

export function PhongBanImportDialog({ open, onOpenChange, mutation }: PhongBanImportDialogProps) {
    const defaultMutation = useBatchUpsertPhongBan()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions, _setImportOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update', // Update mode: update if exists, insert if not
    })

    const handleImport = async (rows: Partial<PhongBan>[]): Promise<{
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
    const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<PhongBan>[] => {
        return mapExcelToDb(rows, importOptions)
    }

    return (
        <ImportDialog<Partial<PhongBan>>
            open={open}
            onOpenChange={onOpenChange}
            onImport={handleImport}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={transformData}
            moduleName="phòng ban"

            templateColumns={templateColumns}
            columnMappings={columnMappings}
            enableAutoMapping={true}
            importOptions={importOptions}

        />
    )
}

