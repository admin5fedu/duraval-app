"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertDiemCongTru } from "../actions/diem-cong-tru-excel-actions"
import { DiemCongTru } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertDiemCongTruReturn = ReturnType<typeof useBatchUpsertDiemCongTru>

interface DiemCongTruImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertDiemCongTruReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "nhan_vien_id",
        excelNames: [
            "Mã nhân viên", "Mã Nhân Viên", "Ma nhan vien", "Ma Nhan Vien",
            "Mã_nhân_viên", "Ma_nhan_vien",
            "Employee ID", "employee id", "EmployeeId", "employeeId", "ID", "id"
        ],
        required: true,
        type: "number",
        description: "Mã nhân viên (bắt buộc)",
    },
    {
        dbField: "ho_va_ten",
        excelNames: [
            "Họ và tên", "Họ Và Tên", "Ho va ten", "Ho Va Ten",
            "Họ_và_tên", "Ho_va_ten",
            "Name", "name", "Full Name", "full name", "FullName", "fullName"
        ],
        required: false,
        type: "text",
        description: "Họ và tên (tùy chọn)",
    },
    {
        dbField: "ngay",
        excelNames: [
            "Ngày", "Ngay",
            "Date", "date", "Ngày áp dụng", "Ngay ap dung"
        ],
        required: true,
        type: "date",
        description: "Ngày (bắt buộc)",
    },
    {
        dbField: "phong_ban_id",
        excelNames: [
            "Phòng ban ID", "Phong ban ID", "Phòng_ban_ID", "Phong_ban_ID",
            "Department ID", "department id", "DepartmentId", "departmentId"
        ],
        required: false,
        type: "number",
        description: "ID phòng ban (tùy chọn)",
    },
    {
        dbField: "loai",
        excelNames: [
            "Loại", "Loai",
            "Type", "type", "Category", "category"
        ],
        required: false,
        type: "text",
        description: "Loại (tùy chọn)",
    },
    {
        dbField: "nhom",
        excelNames: [
            "Nhóm", "Nhom",
            "Group", "group", "Team", "team"
        ],
        required: false,
        type: "text",
        description: "Nhóm (tùy chọn)",
    },
    {
        dbField: "diem",
        excelNames: [
            "Điểm", "Diem",
            "Point", "point", "Points", "points", "Score", "score"
        ],
        required: false,
        type: "number",
        description: "Điểm (tùy chọn, mặc định 0)",
    },
    {
        dbField: "tien",
        excelNames: [
            "Tiền", "Tien",
            "Money", "money", "Amount", "amount", "Price", "price"
        ],
        required: false,
        type: "number",
        description: "Tiền (tùy chọn, mặc định 0)",
    },
    {
        dbField: "nhom_luong_id",
        excelNames: [
            "Nhóm lương ID", "Nhom luong ID", "Nhóm_lương_ID", "Nhom_luong_ID",
            "Salary Group ID", "salary group id", "SalaryGroupId", "salaryGroupId"
        ],
        required: false,
        type: "number",
        description: "ID nhóm lương (tùy chọn)",
    },
    {
        dbField: "ten_nhom_luong",
        excelNames: [
            "Tên nhóm lương", "Ten nhom luong", "Tên_nhóm_lương", "Ten_nhom_luong",
            "Salary Group Name", "salary group name", "SalaryGroupName", "salaryGroupName"
        ],
        required: false,
        type: "text",
        description: "Tên nhóm lương (tùy chọn)",
    },
    {
        dbField: "mo_ta",
        excelNames: [
            "Mô tả", "Mô Tả", "Mo ta", "Mo Ta",
            "Mô_tả", "Mo_ta",
            "Description", "description", "Desc", "desc", "Note", "note"
        ],
        required: false,
        type: "text",
        description: "Mô tả (tùy chọn)",
    },
    {
        dbField: "trang_thai",
        excelNames: [
            "Trạng thái", "Trang thai", "Trạng_thái", "Trang_thai",
            "Status", "status", "State", "state"
        ],
        required: false,
        type: "text",
        description: "Trạng thái (tùy chọn)",
    },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
    {
        header: "Mã nhân viên",
        type: "number",
        required: true,
        description: "Mã nhân viên (bắt buộc)",
    },
    {
        header: "Họ và tên",
        type: "text",
        required: false,
        description: "Họ và tên (tùy chọn)",
    },
    {
        header: "Ngày",
        type: "date",
        required: true,
        description: "Ngày (bắt buộc, định dạng YYYY-MM-DD)",
    },
    {
        header: "Phòng ban ID",
        type: "number",
        required: false,
        description: "ID phòng ban (tùy chọn)",
    },
    {
        header: "Loại",
        type: "text",
        required: false,
        description: "Loại (tùy chọn)",
    },
    {
        header: "Nhóm",
        type: "text",
        required: false,
        description: "Nhóm (tùy chọn)",
    },
    {
        header: "Điểm",
        type: "number",
        required: false,
        description: "Điểm (tùy chọn, mặc định 0)",
    },
    {
        header: "Tiền",
        type: "number",
        required: false,
        description: "Tiền (tùy chọn, mặc định 0)",
    },
    {
        header: "Nhóm lương ID",
        type: "number",
        required: false,
        description: "ID nhóm lương (tùy chọn)",
    },
    {
        header: "Tên nhóm lương",
        type: "text",
        required: false,
        description: "Tên nhóm lương (tùy chọn)",
    },
    {
        header: "Mô tả",
        type: "text",
        required: false,
        description: "Mô tả (tùy chọn)",
    },
    {
        header: "Trạng thái",
        type: "text",
        required: false,
        description: "Trạng thái (tùy chọn)",
    },
]

// Validate a single row
function validateRow(
    row: Record<string, any>
): string[] {
    const errors: string[] = []

    // Required fields
    if (!row.nhan_vien_id || isNaN(Number(row.nhan_vien_id))) {
        errors.push("Mã nhân viên là bắt buộc và phải là số")
    }
    if (!row.ngay || String(row.ngay).trim() === "") {
        errors.push("Ngày là bắt buộc")
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
        const nhanVienId = row.data.nhan_vien_id
        const ngay = row.data.ngay

        if (nhanVienId && ngay) {
            const key = `${nhanVienId}_${String(ngay).trim()}`
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
): Partial<DiemCongTru>[] {
    return rows.map((row) => {
        const mapped: Partial<DiemCongTru> = {}

        // Map required fields
        if (!shouldSkipValue(row.data["nhan_vien_id"], options.skipEmptyCells)) {
            mapped.nhan_vien_id = Number(row.data["nhan_vien_id"])
        }
        if (!shouldSkipValue(row.data["ngay"], options.skipEmptyCells)) {
            mapped.ngay = String(row.data["ngay"]).trim()
        }

        // Map optional fields
        if (!shouldSkipValue(row.data["ho_va_ten"], options.skipEmptyCells)) {
            mapped.ho_va_ten = String(row.data["ho_va_ten"]).trim() || null
        }
        if (!shouldSkipValue(row.data["phong_ban_id"], options.skipEmptyCells)) {
            mapped.phong_ban_id = Number(row.data["phong_ban_id"]) || null
        }
        if (!shouldSkipValue(row.data["loai"], options.skipEmptyCells)) {
            mapped.loai = String(row.data["loai"]).trim() || null
        }
        if (!shouldSkipValue(row.data["nhom"], options.skipEmptyCells)) {
            mapped.nhom = String(row.data["nhom"]).trim() || null
        }
        if (!shouldSkipValue(row.data["diem"], options.skipEmptyCells)) {
            mapped.diem = Number(row.data["diem"]) || 0
        }
        if (!shouldSkipValue(row.data["tien"], options.skipEmptyCells)) {
            mapped.tien = Number(row.data["tien"]) || 0
        }
        if (!shouldSkipValue(row.data["nhom_luong_id"], options.skipEmptyCells)) {
            mapped.nhom_luong_id = Number(row.data["nhom_luong_id"]) || null
        }
        if (!shouldSkipValue(row.data["ten_nhom_luong"], options.skipEmptyCells)) {
            mapped.ten_nhom_luong = String(row.data["ten_nhom_luong"]).trim() || null
        }
        if (!shouldSkipValue(row.data["mo_ta"], options.skipEmptyCells)) {
            mapped.mo_ta = String(row.data["mo_ta"]).trim() || null
        }
        if (!shouldSkipValue(row.data["trang_thai"], options.skipEmptyCells)) {
            mapped.trang_thai = String(row.data["trang_thai"]).trim() || null
        }

        return mapped
    })
}

export function DiemCongTruImportDialog({ open, onOpenChange, mutation }: DiemCongTruImportDialogProps) {
    const defaultMutation = useBatchUpsertDiemCongTru()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update', // Update mode: update if exists, insert if not
    })

    const handleImport = async (rows: Partial<DiemCongTru>[]): Promise<{
        success: boolean
        inserted: number
        updated: number
        failed: number
        errors?: Array<{ rowNumber: number; errors: string[] }>
    }> => {
        try {
            // Convert rows to ExcelRow format for mutation
            const excelRows = rows.map((row) => ({
                nhan_vien_id: row.nhan_vien_id,
                ho_va_ten: row.ho_va_ten,
                ngay: row.ngay,
                ma_phong_id: row.ma_phong_id,
                phong_ban_id: row.phong_ban_id,
                loai: row.loai,
                nhom: row.nhom,
                diem: row.diem,
                tien: row.tien,
                nhom_luong_id: row.nhom_luong_id,
                ten_nhom_luong: row.ten_nhom_luong,
                mo_ta: row.mo_ta,
                trang_thai: row.trang_thai,
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
    const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<DiemCongTru>[] => {
        return mapExcelToDb(rows, importOptions)
    }

    return (
        <ImportDialog<Partial<DiemCongTru>>
            open={open}
            onOpenChange={onOpenChange}
            onImport={handleImport}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={transformData}
            moduleName="điểm cộng trừ"
            
            templateColumns={templateColumns}
            columnMappings={columnMappings}
            enableAutoMapping={true}
            importOptions={importOptions}
            
        />
    )
}

