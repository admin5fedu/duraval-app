"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertChiNhanh } from "../actions/chi-nhanh-excel-actions"
import { ChiNhanh } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertChiNhanhReturn = ReturnType<typeof useBatchUpsertChiNhanh>

interface ChiNhanhImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertChiNhanhReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "ma_chi_nhanh",
        excelNames: [
            "Mã chi nhánh", "Mã Chi Nhánh", "Ma chi nhanh", "Ma Chi Nhanh",
            "Mã_CN", "Mã_cn", "Ma_CN", "Ma_cn",
            "Branch Code", "BranchCode", "branch_code", "Code", "code"
        ],
        required: true,
        type: "string",
        description: "Mã chi nhánh (bắt buộc)",
    },
    {
        dbField: "ten_chi_nhanh",
        excelNames: [
            "Tên chi nhánh", "Tên Chi Nhánh", "Ten chi nhanh", "Ten Chi Nhanh",
            "Tên_CN", "Tên_cn", "Ten_CN", "Ten_cn",
            "Branch Name", "BranchName", "branch_name", "Name", "name"
        ],
        required: true,
        type: "string",
        description: "Tên chi nhánh (bắt buộc)",
    },
    {
        dbField: "dia_chi",
        excelNames: [
            "Địa chỉ", "Địa Chỉ", "Dia chi", "Dia Chi",
            "Địa_chỉ", "Địa_Chỉ", "Dia_chi", "Dia_Chi",
            "Address", "address", "Addr", "addr"
        ],
        required: false,
        type: "string",
        description: "Địa chỉ (không bắt buộc)",
    },
    {
        dbField: "dinh_vi",
        excelNames: [
            "Định vị", "Định Vị", "Dinh vi", "Dinh Vi",
            "Định_vị", "Định_Vị", "Dinh_vi", "Dinh_Vi",
            "Location", "location", "Map", "map", "GPS", "gps"
        ],
        required: false,
        type: "string",
        description: "Định vị (link bản đồ, không bắt buộc)",
    },
    {
        dbField: "hinh_anh",
        excelNames: [
            "Hình ảnh", "Hình Ảnh", "Hinh anh", "Hinh Anh",
            "Hình_ảnh", "Hình_Ảnh", "Hinh_anh", "Hinh_Anh",
            "Image", "image", "Photo", "photo", "Picture", "picture"
        ],
        required: false,
        type: "string",
        description: "Hình ảnh (URL, không bắt buộc)",
    },
    {
        dbField: "mo_ta",
        excelNames: [
            "Mô tả", "Mô Tả", "Mo ta", "Mo Ta",
            "Mô_tả", "Mô_Tả", "Mo_ta", "Mo_Ta",
            "Description", "description", "Desc", "desc", "Note", "note"
        ],
        required: false,
        type: "string",
        description: "Mô tả (không bắt buộc)",
    },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
    {
        name: "ma_chi_nhanh",
        label: "Mã chi nhánh",
        type: "string",
        required: true,
        description: "Mã chi nhánh (bắt buộc)",
    },
    {
        name: "ten_chi_nhanh",
        label: "Tên chi nhánh",
        type: "string",
        required: true,
        description: "Tên chi nhánh (bắt buộc)",
    },
    {
        name: "dia_chi",
        label: "Địa chỉ",
        type: "string",
        required: false,
        description: "Địa chỉ (không bắt buộc)",
    },
    {
        name: "dinh_vi",
        label: "Định vị",
        type: "string",
        required: false,
        description: "Định vị (link bản đồ, không bắt buộc)",
    },
    {
        name: "hinh_anh",
        label: "Hình ảnh",
        type: "string",
        required: false,
        description: "Hình ảnh (URL, không bắt buộc)",
    },
    {
        name: "mo_ta",
        label: "Mô tả",
        type: "string",
        required: false,
        description: "Mô tả (không bắt buộc)",
    },
]

// Validate a single row
function validateRow(
    row: Record<string, any>,
    rowNumber: number
): string[] {
    const errors: string[] = []

    // Required fields
    if (!row.ma_chi_nhanh || String(row.ma_chi_nhanh).trim() === "") {
        errors.push("Mã chi nhánh là bắt buộc")
    }

    if (!row.ten_chi_nhanh || String(row.ten_chi_nhanh).trim() === "") {
        errors.push("Tên chi nhánh là bắt buộc")
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
        const maChiNhanh = row.data.ma_chi_nhanh

        if (maChiNhanh) {
            const key = String(maChiNhanh).trim()
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
): Partial<ChiNhanh>[] {
    return rows.map((row) => {
        const mapped: Partial<ChiNhanh> = {}

        // Map required fields
        if (!shouldSkipValue(row.data["ma_chi_nhanh"], options.skipEmptyCells)) {
            mapped.ma_chi_nhanh = String(row.data["ma_chi_nhanh"]).trim()
        }

        if (!shouldSkipValue(row.data["ten_chi_nhanh"], options.skipEmptyCells)) {
            mapped.ten_chi_nhanh = String(row.data["ten_chi_nhanh"]).trim()
        }

        // Map optional fields
        if (!shouldSkipValue(row.data["dia_chi"], options.skipEmptyCells)) {
            mapped.dia_chi = String(row.data["dia_chi"]).trim()
        }

        if (!shouldSkipValue(row.data["dinh_vi"], options.skipEmptyCells)) {
            mapped.dinh_vi = String(row.data["dinh_vi"]).trim()
        }

        if (!shouldSkipValue(row.data["hinh_anh"], options.skipEmptyCells)) {
            mapped.hinh_anh = String(row.data["hinh_anh"]).trim()
        }

        if (!shouldSkipValue(row.data["mo_ta"], options.skipEmptyCells)) {
            mapped.mo_ta = String(row.data["mo_ta"]).trim()
        }

        return mapped
    })
}

export function ChiNhanhImportDialog({ open, onOpenChange, mutation }: ChiNhanhImportDialogProps) {
    const defaultMutation = useBatchUpsertChiNhanh()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions, setImportOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'insert', // Only insert for chi nhánh
    })

    const handleImport = async (rows: Partial<ChiNhanh>[]): Promise<{
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
    const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<ChiNhanh>[] => {
        return mapExcelToDb(rows, importOptions)
    }

    return (
        <ImportDialog<Partial<ChiNhanh>>
            open={open}
            onOpenChange={onOpenChange}
            onImport={handleImport}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={transformData}
            moduleName="chi nhánh"
            expectedHeaders={["ma_chi_nhanh", "ten_chi_nhanh"]}
            templateColumns={templateColumns}
            columnMappings={columnMappings}
            enableAutoMapping={true}
            importOptions={importOptions}
            onOptionsChange={setImportOptions}
        />
    )
}

