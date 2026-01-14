"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertChucVu } from "../actions/chuc-vu-excel-actions"
import { ChucVu } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertChucVuReturn = ReturnType<typeof useBatchUpsertChucVu>

interface ChucVuImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertChucVuReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "ma_chuc_vu",
        excelNames: [
            "Mã chức vụ", "Mã Chức Vụ", "Ma chuc vu", "Ma Chuc Vu",
            "Mã_CV", "Mã_cv", "Ma_CV", "Ma_cv",
            "Position Code", "PositionCode", "position_code", "Code", "code"
        ],
        required: true,
        type: "text",
        description: "Mã chức vụ (bắt buộc)",
    },
    {
        dbField: "ten_chuc_vu",
        excelNames: [
            "Tên chức vụ", "Tên Chức Vụ", "Ten chuc vu", "Ten Chuc Vu",
            "Tên_CV", "Tên_cv", "Ten_CV", "Ten_cv",
            "Position Name", "PositionName", "position_name", "Name", "name"
        ],
        required: true,
        type: "text",
        description: "Tên chức vụ (bắt buộc)",
    },
    {
        dbField: "cap_bac",
        excelNames: [
            "Cấp bậc", "Cấp Bậc", "Cap bac", "Cap Bac",
            "Level", "level", "Grade", "grade"
        ],
        required: true,
        type: "number",
        description: "Số cấp bậc (bắt buộc, ví dụ: 1, 2, 3)",
    },
    {
        dbField: "ten_cap_bac",
        excelNames: [
            "Tên cấp bậc", "Tên Cấp Bậc", "Ten cap bac", "Ten Cap Bac",
            "Level Name", "level_name", "Ten_CB", "Ten_cb"
        ],
        required: false,
        type: "text",
        description: "Tên cấp bậc (không bắt buộc)",
    },
    {
        dbField: "ma_phong_ban",
        excelNames: [
            "Mã phòng ban", "Mã Phòng Ban", "Ma phong ban", "Ma Phong Ban",
            "Department Code", "dept_code", "Ma_PB", "Ma_pb"
        ],
        required: true,
        type: "text",
        description: "Mã phòng ban (bắt buộc)",
    },
    {
        dbField: "ngach_luong",
        excelNames: ["Ngạch lương", "Ngạch Lương", "Ngach luong", "Ngach Luong", "Salary Grade", "salary_grade"],
        required: false,
        type: "text",
        description: "Ngạch lương (không bắt buộc)",
    },
    {
        dbField: "muc_dong_bao_hiem",
        excelNames: ["Mức đóng bảo hiểm", "Mức Đóng Bảo Hiểm", "Muc dong bao hiem", "Muc Dong Bao Hiem", "Insurance Rate", "insurance_rate"],
        required: false,
        type: "number",
        description: "Mức đóng bảo hiểm (không bắt buộc)",
    },
    {
        dbField: "so_ngay_nghi_thu_7",
        excelNames: ["Số ngày nghỉ thứ 7", "Số Ngày Nghỉ Thứ 7", "So ngay nghi thu 7", "Saturday Leave", "saturday_leave"],
        required: false,
        type: "text",
        description: "Số ngày nghỉ thứ 7 (không bắt buộc)",
    },
    {
        dbField: "nhom_thuong",
        excelNames: ["Nhóm thưởng", "Nhóm Thưởng", "Nhom thuong", "Nhom Thuong", "Bonus Group", "bonus_group"],
        required: false,
        type: "text",
        description: "Nhóm thưởng (không bắt buộc)",
    },
    {
        dbField: "diem_thuong",
        excelNames: ["Điểm thưởng", "Điểm Thưởng", "Diem thuong", "Diem Thuong", "Bonus Points", "bonus_points"],
        required: false,
        type: "number",
        description: "Điểm thưởng (không bắt buộc)",
    },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
    {
        header: "Mã chức vụ",
        type: "text",
        required: true,
        description: "Mã chức vụ (bắt buộc)",
    },
    {
        header: "Tên chức vụ",
        type: "text",
        required: true,
        description: "Tên chức vụ (bắt buộc)",
    },
    {
        header: "Cấp bậc",
        type: "number",
        required: true,
        description: "Số cấp bậc (bắt buộc)",
    },
    {
        header: "Tên cấp bậc",
        type: "text",
        required: false,
        description: "Tên cấp bậc (không bắt buộc)",
    },
    {
        header: "Mã phòng ban",
        type: "text",
        required: true,
        description: "Mã phòng ban (bắt buộc)",
    },
    {
        header: "Ngạch lương",
        type: "text",
        required: false,
        description: "Ngạch lương (không bắt buộc)",
    },
    {
        header: "Mức đóng bảo hiểm",
        type: "number",
        required: false,
        description: "Mức đóng bảo hiểm (không bắt buộc)",
    },
    {
        header: "Số ngày nghỉ thứ 7",
        type: "text",
        required: false,
        description: "Số ngày nghỉ thứ 7 (không bắt buộc)",
    },
    {
        header: "Nhóm thưởng",
        type: "text",
        required: false,
        description: "Nhóm thưởng (không bắt buộc)",
    },
    {
        header: "Điểm thưởng",
        type: "number",
        required: false,
        description: "Điểm thưởng (không bắt buộc)",
    },
]

// Validate a single row
function validateRow(
    row: Record<string, any>,
    _rowNumber: number
): string[] {
    const errors: string[] = []

    // Required fields
    if (!row.ma_chuc_vu || String(row.ma_chuc_vu).trim() === "") {
        errors.push("Mã chức vụ là bắt buộc")
    }

    if (!row.ten_chuc_vu || String(row.ten_chuc_vu).trim() === "") {
        errors.push("Tên chức vụ là bắt buộc")
    }

    if (row.cap_bac === undefined || row.cap_bac === null || row.cap_bac === "") {
        errors.push("Cấp bậc là bắt buộc")
    }

    if (!row.ma_phong_ban || String(row.ma_phong_ban).trim() === "") {
        errors.push("Mã phòng ban là bắt buộc")
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
        const maChucVu = row.data.ma_chuc_vu

        if (maChucVu) {
            const key = String(maChucVu).trim()
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
): Partial<ChucVu>[] {
    return rows.map((row) => {
        const mapped: Partial<ChucVu> = {}

        // Map required fields
        if (!shouldSkipValue(row.data["ma_chuc_vu"], options.skipEmptyCells)) {
            mapped.ma_chuc_vu = String(row.data["ma_chuc_vu"]).trim()
        }

        if (!shouldSkipValue(row.data["ten_chuc_vu"], options.skipEmptyCells)) {
            mapped.ten_chuc_vu = String(row.data["ten_chuc_vu"]).trim()
        }

        if (!shouldSkipValue(row.data["cap_bac"], options.skipEmptyCells)) {
            mapped.cap_bac = Number(row.data["cap_bac"])
        }

        if (!shouldSkipValue(row.data["ten_cap_bac"], options.skipEmptyCells)) {
            mapped.ten_cap_bac = String(row.data["ten_cap_bac"]).trim()
        }

        if (!shouldSkipValue(row.data["ma_phong_ban"], options.skipEmptyCells)) {
            mapped.ma_phong_ban = String(row.data["ma_phong_ban"]).trim()
        }

        // Map optional fields
        if (!shouldSkipValue(row.data["ngach_luong"], options.skipEmptyCells)) {
            mapped.ngach_luong = String(row.data["ngach_luong"]).trim()
        }

        if (!shouldSkipValue(row.data["muc_dong_bao_hiem"], options.skipEmptyCells)) {
            mapped.muc_dong_bao_hiem = Number(row.data["muc_dong_bao_hiem"])
        }

        if (!shouldSkipValue(row.data["so_ngay_nghi_thu_7"], options.skipEmptyCells)) {
            mapped.so_ngay_nghi_thu_7 = String(row.data["so_ngay_nghi_thu_7"]).trim()
        }

        if (!shouldSkipValue(row.data["nhom_thuong"], options.skipEmptyCells)) {
            mapped.nhom_thuong = String(row.data["nhom_thuong"]).trim()
        }

        if (!shouldSkipValue(row.data["diem_thuong"], options.skipEmptyCells)) {
            mapped.diem_thuong = Number(row.data["diem_thuong"])
        }

        return mapped
    })
}

export function ChucVuImportDialog({ open, onOpenChange, mutation }: ChucVuImportDialogProps) {
    const defaultMutation = useBatchUpsertChucVu()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions, _setImportOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update', // Update mode: update if exists, insert if not
    })

    const handleImport = async (rows: Partial<ChucVu>[]): Promise<{
        success: boolean
        inserted: number
        updated: number
        failed: number
        errors?: Array<{ rowNumber: number; errors: string[] }>
    }> => {
        try {
            // Convert rows to ExcelRow format for mutation
            const excelRows = rows.map((row) => ({
                ma_chuc_vu: row.ma_chuc_vu,
                ten_chuc_vu: row.ten_chuc_vu,
                cap_bac: row.cap_bac,
                ten_cap_bac: row.ten_cap_bac,
                ma_phong_ban: row.ma_phong_ban,
                ngach_luong: row.ngach_luong,
                muc_dong_bao_hiem: row.muc_dong_bao_hiem,
                so_ngay_nghi_thu_7: row.so_ngay_nghi_thu_7,
                nhom_thuong: row.nhom_thuong,
                diem_thuong: row.diem_thuong,
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
    const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<ChucVu>[] => {
        return mapExcelToDb(rows, importOptions)
    }

    return (
        <ImportDialog<Partial<ChucVu>>
            open={open}
            onOpenChange={onOpenChange}
            onImport={handleImport}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={transformData}
            moduleName="chức vụ"

            templateColumns={templateColumns}
            columnMappings={columnMappings}
            enableAutoMapping={true}
            importOptions={importOptions}

        />
    )
}
