"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertDangKyDoanhSo } from "../actions/dang-ky-doanh-so-excel-actions"
import { DangKyDoanhSo } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertDangKyDoanhSoReturn = ReturnType<typeof useBatchUpsertDangKyDoanhSo>

interface DangKyDoanhSoImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertDangKyDoanhSoReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "nam",
        excelNames: [
            "Năm", "Nam", "Year", "year", "YEAR"
        ],
        required: false,
        type: "number",
        description: "Năm (số)",
    },
    {
        dbField: "thang",
        excelNames: [
            "Tháng", "Thang", "Month", "month", "MONTH"
        ],
        required: false,
        type: "number",
        description: "Tháng (số)",
    },
    {
        dbField: "nhan_vien_id",
        excelNames: [
            "ID nhân viên", "ID Nhân Viên", "ID nhan vien", "nhan_vien_id",
            "Mã nhân viên", "Mã Nhân Viên", "Ma nhan vien", "ma_nhan_vien",
            "Employee ID", "employee_id", "EmployeeID"
        ],
        required: false,
        type: "number",
        description: "ID nhân viên (số)",
    },
    {
        dbField: "ten_nhan_vien",
        excelNames: [
            "Tên nhân viên", "Tên Nhân Viên", "Ten nhan vien",
            "Employee Name", "employee_name", "EmployeeName", "Name", "name"
        ],
        required: false,
        type: "text",
        description: "Tên nhân viên",
    },
    {
        dbField: "bac_dt",
        excelNames: [
            "Bậc DT", "Bac DT", "bac_dt", "Bậc Doanh Thu",
            "Level", "level", "Sales Level"
        ],
        required: false,
        type: "text",
        description: "Bậc doanh thu",
    },
    {
        dbField: "doanh_thu",
        excelNames: [
            "Doanh thu", "Doanh Thu", "doanh_thu",
            "Revenue", "revenue", "Sales", "sales"
        ],
        required: false,
        type: "number",
        description: "Doanh thu (số)",
    },
    {
        dbField: "nhom_ap_doanh_thu_id",
        excelNames: [
            "ID nhóm áp doanh thu", "ID Nhóm Áp Doanh Thu", "nhom_ap_doanh_thu_id",
            "Group ID", "group_id", "GroupID"
        ],
        required: false,
        type: "number",
        description: "ID nhóm áp doanh thu (số)",
    },
    {
        dbField: "ten_nhom_ap_doanh_thu",
        excelNames: [
            "Tên nhóm áp doanh thu", "Tên Nhóm Áp Doanh Thu", "Ten nhom ap doanh thu",
            "Group Name", "group_name", "GroupName"
        ],
        required: false,
        type: "text",
        description: "Tên nhóm áp doanh thu",
    },
    {
        dbField: "mo_ta",
        excelNames: [
            "Mô tả", "Mô Tả", "Mo ta", "Mo Ta",
            "Description", "description", "desc", "Desc"
        ],
        required: false,
        type: "text",
        description: "Mô tả",
    },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
    {
        header: "Năm",
        type: "number",
        required: false,
        description: "Năm (số)",
    },
    {
        header: "Tháng",
        type: "number",
        required: false,
        description: "Tháng (số)",
    },
    {
        header: "ID nhân viên",
        type: "number",
        required: false,
        description: "ID nhân viên (số)",
    },
    {
        header: "Tên nhân viên",
        type: "text",
        required: false,
        description: "Tên nhân viên",
    },
    {
        header: "Bậc DT",
        type: "text",
        required: false,
        description: "Bậc doanh thu",
    },
    {
        header: "Doanh thu",
        type: "number",
        required: false,
        description: "Doanh thu (số)",
    },
    {
        header: "ID nhóm áp doanh thu",
        type: "number",
        required: false,
        description: "ID nhóm áp doanh thu (số)",
    },
    {
        header: "Tên nhóm áp doanh thu",
        type: "text",
        required: false,
        description: "Tên nhóm áp doanh thu",
    },
    {
        header: "Mô tả",
        type: "text",
        required: false,
        description: "Mô tả",
    },
]

// Validate a single row (no required fields, so just return empty array)
function validateRow(
    _row: Record<string, any>,
    _rowNumber: number
): string[] {
    const errors: string[] = []
    // All fields are optional, so no validation needed
    return errors
}

// Check for duplicates within the import data
// For đăng ký doanh số, we consider a row duplicate if it has the same nhan_vien_id, nam, thang, nhom_ap_doanh_thu_id
function checkDuplicates(
    rows: Array<{ rowNumber: number; data: Record<string, any> }>
): Map<string, number[]> {
    const duplicates = new Map<string, number[]>()
    const keyMap = new Map<string, number[]>()

    rows.forEach((row, index) => {
        const nhanVienId = row.data.nhan_vien_id
        const nam = row.data.nam
        const thang = row.data.thang
        const nhomApDoanhThuId = row.data.nhom_ap_doanh_thu_id

        // Create a composite key
        const key = `${nhanVienId || ''}_${nam || ''}_${thang || ''}_${nhomApDoanhThuId || ''}`
        
        if (key && key !== '___') { // Only check if at least one field is present
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
): Partial<DangKyDoanhSo>[] {
    return rows.map((row) => {
        const mapped: Partial<DangKyDoanhSo> = {}

        // Map fields
        if (!shouldSkipValue(row.data["nam"], options.skipEmptyCells)) {
            const value = Number(row.data["nam"])
            mapped.nam = isNaN(value) ? undefined : value
        }

        if (!shouldSkipValue(row.data["thang"], options.skipEmptyCells)) {
            const value = Number(row.data["thang"])
            mapped.thang = isNaN(value) ? undefined : value
        }

        if (!shouldSkipValue(row.data["nhan_vien_id"], options.skipEmptyCells)) {
            const value = Number(row.data["nhan_vien_id"])
            mapped.nhan_vien_id = isNaN(value) ? undefined : value
        }

        if (!shouldSkipValue(row.data["ten_nhan_vien"], options.skipEmptyCells)) {
            mapped.ten_nhan_vien = String(row.data["ten_nhan_vien"]).trim()
        }

        if (!shouldSkipValue(row.data["bac_dt"], options.skipEmptyCells)) {
            mapped.bac_dt = String(row.data["bac_dt"]).trim()
        }

        if (!shouldSkipValue(row.data["doanh_thu"], options.skipEmptyCells)) {
            const value = Number(row.data["doanh_thu"])
            mapped.doanh_thu = isNaN(value) ? undefined : value
        }

        if (!shouldSkipValue(row.data["nhom_ap_doanh_thu_id"], options.skipEmptyCells)) {
            const value = Number(row.data["nhom_ap_doanh_thu_id"])
            mapped.nhom_ap_doanh_thu_id = isNaN(value) ? undefined : value
        }

        if (!shouldSkipValue(row.data["ten_nhom_ap_doanh_thu"], options.skipEmptyCells)) {
            mapped.ten_nhom_ap_doanh_thu = String(row.data["ten_nhom_ap_doanh_thu"]).trim()
        }

        if (!shouldSkipValue(row.data["mo_ta"], options.skipEmptyCells)) {
            mapped.mo_ta = String(row.data["mo_ta"]).trim()
        }

        return mapped
    })
}

export function DangKyDoanhSoImportDialog({ open, onOpenChange, mutation }: DangKyDoanhSoImportDialogProps) {
    const defaultMutation = useBatchUpsertDangKyDoanhSo()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions, _setImportOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update', // Update mode: update if exists, insert if not
    })

    const handleImport = async (rows: Partial<DangKyDoanhSo>[]): Promise<{
        success: boolean
        inserted: number
        updated: number
        failed: number
        errors?: Array<{ rowNumber: number; errors: string[] }>
    }> => {
        try {
            // Convert rows to ExcelRow format for mutation
            const excelRows = rows.map((row) => ({
                nam: row.nam,
                thang: row.thang,
                nhan_vien_id: row.nhan_vien_id,
                ten_nhan_vien: row.ten_nhan_vien,
                bac_dt: row.bac_dt,
                doanh_thu: row.doanh_thu,
                nhom_ap_doanh_thu_id: row.nhom_ap_doanh_thu_id,
                ten_nhom_ap_doanh_thu: row.ten_nhom_ap_doanh_thu,
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
    const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<DangKyDoanhSo>[] => {
        return mapExcelToDb(rows, importOptions)
    }

    return (
        <ImportDialog<Partial<DangKyDoanhSo>>
            open={open}
            onOpenChange={onOpenChange}
            onImport={handleImport}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={transformData}
            moduleName="đăng ký doanh số"
            templateColumns={templateColumns}
            columnMappings={columnMappings}
            enableAutoMapping={true}
            importOptions={importOptions}
        />
    )
}

