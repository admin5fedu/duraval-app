"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertTrangThaiKhachBuon } from "../actions/trang-thai-khach-buon-excel-actions"
import { TrangThaiKhachBuon } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertTrangThaiKhachBuonReturn = ReturnType<typeof useBatchUpsertTrangThaiKhachBuon>

interface TrangThaiKhachBuonImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertTrangThaiKhachBuonReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "ma_trang_thai",
        excelNames: [
            "Mã trạng thái", "Mã Trạng Thái", "Ma trang thai", "Ma Trang Thai",
            "Mã_trạng_thái", "Mã_Trạng_Thái", "Ma_trang_thai", "Ma_Trang_Thai",
            "Mã", "Ma", "Code", "code", "Mã TT", "Ma TT"
        ],
        required: false,
        type: "text",
        description: "Mã trạng thái (không bắt buộc)",
    },
    {
        dbField: "ten_trang_thai",
        excelNames: [
            "Tên trạng thái", "Tên Trạng Thái", "Ten trang thai", "Ten Trang Thai",
            "Tên_trạng_thái", "Tên_Trạng_Thái", "Ten_trang_thai", "Ten_Trang_Thai",
            "Trạng thái", "Trạng Thái", "Trang thai", "Trang Thai",
            "Name", "name", "Tên", "Ten", "Title", "title"
        ],
        required: true,
        type: "text",
        description: "Tên trạng thái (bắt buộc)",
    },
    {
        dbField: "tt",
        excelNames: [
            "Thứ tự", "Thứ Tự", "Thu tu", "Thu Tu",
            "Thứ_tự", "Thứ_Tự", "Thu_tu", "Thu_Tu",
            "Order", "order", "Sort", "sort", "TT", "tt", "Stt", "STT"
        ],
        required: false,
        type: "number",
        description: "Thứ tự (không bắt buộc)",
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
    {
        dbField: "mac_dinh_khoi_dau",
        excelNames: [
            "Mặc định khởi đầu", "Mặc Định Khởi Đầu", "Mac dinh khoi dau", "Mac Dinh Khoi Dau",
            "Mặc_định_khởi_đầu", "Mặc_Định_Khởi_Đầu", "Mac_dinh_khoi_dau", "Mac_Dinh_Khoi_Dau",
            "Khởi đầu", "Khoi dau", "YES", "NO", "Có", "Không"
        ],
        required: false,
        type: "text",
        description: "Mặc định khởi đầu (YES/NO, không bắt buộc)",
    },
    {
        dbField: "giai_doan_id",
        excelNames: [
            "Giai đoạn ID", "Giai Đoạn ID", "Giai doan ID", "Giai Doan ID",
            "Giai_đoạn_ID", "Giai_Đoạn_ID", "Giai_doan_ID", "Giai_Doan_ID",
            "Giai đoạn", "Giai Đoạn", "Giai doan", "Giai Doan",
            "GiaiDoanId", "giaiDoanId"
        ],
        required: false,
        type: "number",
        description: "ID giai đoạn (không bắt buộc)",
    },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
    {
        header: "Mã trạng thái",
        type: "text",
        required: false,
        description: "Mã trạng thái (không bắt buộc)",
    },
    {
        header: "Tên trạng thái",
        type: "text",
        required: true,
        description: "Tên trạng thái (bắt buộc)",
    },
    {
        header: "Thứ tự",
        type: "number",
        required: false,
        description: "Thứ tự (không bắt buộc)",
    },
    {
        header: "Mô tả",
        type: "text",
        required: false,
        description: "Mô tả (không bắt buộc)",
    },
    {
        header: "Mặc định khởi đầu",
        type: "text",
        required: false,
        description: "Mặc định khởi đầu (YES/NO, không bắt buộc)",
    },
    {
        header: "Giai đoạn ID",
        type: "number",
        required: false,
        description: "ID giai đoạn (không bắt buộc)",
    },
]

// Validate a single row
function validateRow(
    row: Record<string, any>,
    _rowNumber: number
): string[] {
    const errors: string[] = []

    // Required fields
    if (!row.ten_trang_thai || String(row.ten_trang_thai).trim() === "") {
        errors.push("Tên trạng thái là bắt buộc")
    }
    
    // Validate tt if provided
    if (row.tt !== null && row.tt !== undefined && row.tt !== "") {
        const ttValue = typeof row.tt === 'number' ? row.tt : parseFloat(String(row.tt))
        if (isNaN(ttValue) || ttValue < 1) {
            errors.push("Thứ tự phải là số lớn hơn 0")
        }
    }

    // Validate mac_dinh_khoi_dau if provided
    if (row.mac_dinh_khoi_dau && String(row.mac_dinh_khoi_dau).trim() !== "") {
        const value = String(row.mac_dinh_khoi_dau).trim().toUpperCase()
        if (value !== "YES" && value !== "NO") {
            errors.push("Mặc định khởi đầu phải là YES hoặc NO")
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
        const tenTrangThai = row.data.ten_trang_thai

        if (tenTrangThai) {
            const key = String(tenTrangThai).trim().toLowerCase()
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
): Partial<TrangThaiKhachBuon>[] {
    return rows.map((row) => {
        const mapped: Partial<TrangThaiKhachBuon> = {}

        if (!shouldSkipValue(row.data["ma_trang_thai"], options.skipEmptyCells)) {
            mapped.ma_trang_thai = String(row.data["ma_trang_thai"]).trim()
        }

        if (!shouldSkipValue(row.data["ten_trang_thai"], options.skipEmptyCells)) {
            mapped.ten_trang_thai = String(row.data["ten_trang_thai"]).trim()
        }

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

        if (!shouldSkipValue(row.data["mac_dinh_khoi_dau"], options.skipEmptyCells)) {
            const value = String(row.data["mac_dinh_khoi_dau"]).trim().toUpperCase()
            if (value === "YES" || value === "NO") {
                mapped.mac_dinh_khoi_dau = value
            }
        }

        if (!shouldSkipValue(row.data["giai_doan_id"], options.skipEmptyCells)) {
            const giaiDoanIdValue = row.data["giai_doan_id"]
            if (giaiDoanIdValue !== null && giaiDoanIdValue !== undefined && giaiDoanIdValue !== "") {
                const numValue = typeof giaiDoanIdValue === 'number' ? giaiDoanIdValue : parseFloat(String(giaiDoanIdValue))
                if (!isNaN(numValue)) {
                    mapped.giai_doan_id = numValue
                }
            }
        }

        return mapped
    })
}

export function TrangThaiKhachBuonImportDialog({ open, onOpenChange, mutation }: TrangThaiKhachBuonImportDialogProps) {
    const defaultMutation = useBatchUpsertTrangThaiKhachBuon()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions, _setImportOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update', // Update mode: update if exists, insert if not
    })

    const handleImport = async (rows: Partial<TrangThaiKhachBuon>[]): Promise<{
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
    const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<TrangThaiKhachBuon>[] => {
        return mapExcelToDb(rows, importOptions)
    }

    return (
        <ImportDialog<Partial<TrangThaiKhachBuon>>
            open={open}
            onOpenChange={onOpenChange}
            onImport={handleImport}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={transformData}
            moduleName="trạng thái khách buôn"
            templateColumns={templateColumns}
            columnMappings={columnMappings}
            enableAutoMapping={true}
            importOptions={importOptions}
        />
    )
}

