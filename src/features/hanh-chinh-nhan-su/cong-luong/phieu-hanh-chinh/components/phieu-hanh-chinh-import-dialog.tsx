"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertPhieuHanhChinh } from "../actions/phieu-hanh-chinh-excel-actions"
import { PhieuHanhChinh } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertPhieuHanhChinhReturn = ReturnType<typeof useBatchUpsertPhieuHanhChinh>

interface PhieuHanhChinhImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertPhieuHanhChinhReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "ngay",
        excelNames: [
            "Ngày", "Ngay", "Date", "date",
            "Ngày_", "Ngay_", "Ngày tạo", "Ngay tao"
        ],
        required: true,
        type: "date",
        description: "Ngày (bắt buộc, định dạng: YYYY-MM-DD)",
    },
    {
        dbField: "loai_phieu",
        excelNames: [
            "Loại phiếu", "Loại Phiếu", "Loai phieu", "Loai Phieu",
            "Loại_P", "Loại_p", "Loai_P", "Loai_p",
            "Type", "type", "Category", "category"
        ],
        required: true,
        type: "text",
        description: "Loại phiếu (bắt buộc)",
    },
    {
        dbField: "ma_phieu",
        excelNames: [
            "Mã phiếu", "Mã Phiếu", "Ma phieu", "Ma Phieu",
            "Mã_P", "Mã_p", "Ma_P", "Ma_p",
            "Code", "code", "Ma", "ma"
        ],
        required: true,
        type: "text",
        description: "Mã phiếu (bắt buộc)",
    },
    {
        dbField: "ca",
        excelNames: [
            "Ca", "ca", "Shift", "shift",
            "Ca làm việc", "Ca lam viec"
        ],
        required: false,
        type: "text",
        description: "Ca (Sáng/Chiều/Tối/Cả ngày)",
    },
    {
        dbField: "so_gio",
        excelNames: [
            "Số giờ", "Số Giờ", "So gio", "So Gio",
            "Số_giờ", "So_gio", "Hours", "hours",
            "Số giờ làm việc", "So gio lam viec"
        ],
        required: false,
        type: "number",
        description: "Số giờ (số dương)",
    },
    {
        dbField: "ly_do",
        excelNames: [
            "Lý do", "Lý Do", "Ly do", "Ly Do",
            "Lý_do", "Ly_do", "Reason", "reason",
            "Lý do nghỉ", "Ly do nghi"
        ],
        required: true,
        type: "text",
        description: "Lý do (bắt buộc)",
    },
    {
        dbField: "com_trua",
        excelNames: [
            "Cơm trưa", "Cơm Trưa", "Com trua", "Com Trua",
            "Cơm_trưa", "Com_trua", "Lunch", "lunch"
        ],
        required: false,
        type: "text",
        description: "Cơm trưa (Có/Không, mặc định: Không)",
    },
    {
        dbField: "phuong_tien",
        excelNames: [
            "Phương tiện", "Phương Tiện", "Phuong tien", "Phuong Tien",
            "Phương_tiện", "Phuong_tien", "Vehicle", "vehicle",
            "Xe", "xe"
        ],
        required: false,
        type: "text",
        description: "Phương tiện (Xe máy cá nhân, Xe ô tô cá nhân, Xe máy công ty, Xe ô tô công ty)",
    },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
    {
        header: "Ngày",
        type: "date",
        required: true,
        description: "Ngày (bắt buộc, định dạng: YYYY-MM-DD)",
    },
    {
        header: "Loại phiếu",
        type: "text",
        required: true,
        description: "Loại phiếu (bắt buộc)",
    },
    {
        header: "Mã phiếu",
        type: "text",
        required: true,
        description: "Mã phiếu (bắt buộc)",
    },
    {
        header: "Ca",
        type: "text",
        required: false,
        description: "Ca (Sáng/Chiều/Tối/Cả ngày, có thể để trống)",
    },
    {
        header: "Số giờ",
        type: "number",
        required: false,
        description: "Số giờ (số dương, có thể để trống)",
    },
    {
        header: "Lý do",
        type: "text",
        required: true,
        description: "Lý do (bắt buộc)",
    },
    {
        header: "Cơm trưa",
        type: "text",
        required: false,
        description: "Cơm trưa (Có/Không, mặc định: Không)",
    },
    {
        header: "Phương tiện",
        type: "text",
        required: false,
        description: "Phương tiện (Xe máy cá nhân, Xe ô tô cá nhân, Xe máy công ty, Xe ô tô công ty)",
    },
]

// Validate a single row
function validateRow(
    row: Record<string, any>
): string[] {
    const errors: string[] = []

    // Required fields
    if (!row.ngay || String(row.ngay).trim() === "") {
        errors.push("Ngày là bắt buộc")
    }

    if (!row.loai_phieu || String(row.loai_phieu).trim() === "") {
        errors.push("Loại phiếu là bắt buộc")
    }

    if (!row.ma_phieu || String(row.ma_phieu).trim() === "") {
        errors.push("Mã phiếu là bắt buộc")
    }

    if (!row.ly_do || String(row.ly_do).trim() === "") {
        errors.push("Lý do là bắt buộc")
    }

    // Validate so_gio if provided
    if (row.so_gio !== undefined && row.so_gio !== null && row.so_gio !== "") {
        const soGio = Number(row.so_gio)
        if (isNaN(soGio) || soGio <= 0) {
            errors.push("Số giờ phải là số dương")
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
        const maPhieu = row.data.ma_phieu

        if (maPhieu) {
            const key = String(maPhieu).trim()
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
): Partial<PhieuHanhChinh>[] {
    return rows.map((row) => {
        const mapped: Partial<PhieuHanhChinh> = {}

        // Map required fields
        if (!shouldSkipValue(row.data["ngay"], options.skipEmptyCells)) {
            const ngayValue = row.data["ngay"]
            if (ngayValue instanceof Date) {
                mapped.ngay = ngayValue.toISOString().split('T')[0]
            } else if (typeof ngayValue === 'string') {
                mapped.ngay = ngayValue.trim()
            }
        }

        if (!shouldSkipValue(row.data["loai_phieu"], options.skipEmptyCells)) {
            mapped.loai_phieu = String(row.data["loai_phieu"]).trim()
        }

        if (!shouldSkipValue(row.data["ma_phieu"], options.skipEmptyCells)) {
            mapped.ma_phieu = String(row.data["ma_phieu"]).trim()
        }

        if (!shouldSkipValue(row.data["ly_do"], options.skipEmptyCells)) {
            mapped.ly_do = String(row.data["ly_do"]).trim()
        }

        // Map optional fields
        if (!shouldSkipValue(row.data["ca"], options.skipEmptyCells)) {
            mapped.ca = String(row.data["ca"]).trim()
        }

        if (!shouldSkipValue(row.data["so_gio"], options.skipEmptyCells)) {
            mapped.so_gio = Number(row.data["so_gio"])
        }

        // Map boolean fields
        if (row.data["com_trua"] !== undefined && row.data["com_trua"] !== null) {
            const value = row.data["com_trua"]
            mapped.com_trua = (value === true || value === "true" || value === "1" || value === 1 || value === "Có")
        }

        if (!shouldSkipValue(row.data["phuong_tien"], options.skipEmptyCells)) {
            mapped.phuong_tien = String(row.data["phuong_tien"]).trim()
        }

        return mapped
    })
}

export function PhieuHanhChinhImportDialog({ open, onOpenChange, mutation }: PhieuHanhChinhImportDialogProps) {
    const defaultMutation = useBatchUpsertPhieuHanhChinh()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions, _setImportOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update', // Update mode: update if exists, insert if not
    })

    const handleImport = async (rows: Partial<PhieuHanhChinh>[]): Promise<{
        success: boolean
        inserted: number
        updated: number
        failed: number
        errors?: Array<{ rowNumber: number; errors: string[] }>
    }> => {
        try {
            // Convert rows to ExcelRow format for mutation
            const excelRows = rows.map((row) => ({
                ngay: row.ngay,
                loai_phieu: row.loai_phieu,
                ma_phieu: row.ma_phieu,
                ca: row.ca,
                so_gio: row.so_gio,
                ly_do: row.ly_do,
                com_trua: row.com_trua,
                phuong_tien: row.phuong_tien,
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
    const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<PhieuHanhChinh>[] => {
        return mapExcelToDb(rows, importOptions)
    }

    return (
        <ImportDialog<Partial<PhieuHanhChinh>>
            open={open}
            onOpenChange={onOpenChange}
            onImport={handleImport}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={transformData}
            moduleName="phiếu hành chính"
            
            templateColumns={templateColumns}
            columnMappings={columnMappings}
            enableAutoMapping={true}
            importOptions={importOptions}
            
        />
    )
}

