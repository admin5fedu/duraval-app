"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertNguoiThan } from "../actions/nguoi-than-excel-actions"
import { NguoiThan } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { parseDate } from "@/shared/utils/excel-date-parser"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertNguoiThanReturn = ReturnType<typeof useBatchUpsertNguoiThan>

interface NguoiThanImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertNguoiThanReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "ma_nhan_vien",
        excelNames: [
            "Mã nhân viên", "Mã Nhân Viên", "Ma Nhan Vien", "Ma nhan vien",
            "Mã NV", "Mã nv", "Ma NV", "Ma nv",
            "Mã_Nhân_Viên", "Mã_nhân_viên", "Ma_Nhan_Vien", "Ma_nhan_vien",
            "Mã_NV", "Mã_nv", "Ma_NV", "Ma_nv",
            "Employee ID", "EmployeeID", "employee_id", "ID", "id"
        ],
        required: true,
        type: "number",
        description: "Mã nhân viên (bắt buộc, số nguyên)",
    },
    {
        dbField: "ho_va_ten",
        excelNames: [
            "Họ và tên", "Họ Và Tên", "Ho Va Ten", "Ho va ten",
            "Họ tên", "Họ Tên", "Ho Ten", "Ho ten",
            "Họ_và_tên", "Họ_Và_Tên", "Ho_Va_Ten", "Ho_va_ten",
            "Họ_tên", "Họ_Tên", "Ho_Ten", "Ho_ten",
            "Full Name", "FullName", "full_name", "Name", "name"
        ],
        required: true,
        type: "string",
        description: "Họ và tên đầy đủ (bắt buộc)",
    },
    {
        dbField: "moi_quan_he",
        excelNames: [
            "Mối quan hệ", "Mối Quan Hệ", "Moi quan he", "Moi Quan He",
            "Mối_quan_hệ", "Mối_Quan_Hệ", "Moi_quan_he", "Moi_Quan_He",
            "Relationship", "relationship", "Relation", "relation"
        ],
        required: true,
        type: "string",
        description: "Mối quan hệ (bắt buộc: Cha/Bố, Mẹ, Vợ/Chồng, Con, Anh/Chị/Em, Khác)",
    },
    {
        dbField: "ngay_sinh",
        excelNames: [
            "Ngày sinh", "Ngày Sinh", "Ngay sinh", "Ngay Sinh",
            "Ngày_sinh", "Ngày_Sinh", "Ngay_sinh", "Ngay_Sinh",
            "Date of Birth", "DateOfBirth", "date_of_birth", "DOB", "dob"
        ],
        required: false,
        type: "date",
        description: "Định dạng dd/mm/yyyy",
    },
    {
        dbField: "so_dien_thoai",
        excelNames: [
            "Số điện thoại", "Số Điện Thoại", "So dien thoai", "So Dien Thoai",
            "Số_điện_thoại", "Số_Điện_Thoại", "So_dien_thoai", "So_Dien_Thoai",
            "SĐT", "SDT", "sdt", "Phone", "phone", "Mobile", "mobile"
        ],
        required: false,
        type: "phone",
        description: "Số điện thoại (10-11 chữ số)",
    },
    {
        dbField: "ghi_chu",
        excelNames: [
            "Ghi chú", "Ghi Chú", "Ghi chu", "Ghi Chu",
            "Ghi_chú", "Ghi_Chú", "Ghi_chu", "Ghi_Chu",
            "Note", "note", "Notes", "notes", "Comment", "comment"
        ],
        required: false,
        type: "string",
        description: "Ghi chú (không bắt buộc)",
    },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
    {
        name: "ma_nhan_vien",
        label: "Mã nhân viên",
        type: "number",
        required: true,
        description: "Mã nhân viên (bắt buộc, số nguyên)",
    },
    {
        name: "ho_va_ten",
        label: "Họ và tên",
        type: "string",
        required: true,
        description: "Họ và tên đầy đủ (bắt buộc)",
    },
    {
        name: "moi_quan_he",
        label: "Mối quan hệ",
        type: "string",
        required: true,
        description: "Mối quan hệ: Cha/Bố, Mẹ, Vợ/Chồng, Con, Anh/Chị/Em, Khác",
    },
    {
        name: "ngay_sinh",
        label: "Ngày sinh",
        type: "date",
        required: false,
        description: "Định dạng dd/mm/yyyy",
    },
    {
        name: "so_dien_thoai",
        label: "Số điện thoại",
        type: "string",
        required: false,
        description: "Số điện thoại (10-11 chữ số)",
    },
    {
        name: "ghi_chu",
        label: "Ghi chú",
        type: "string",
        required: false,
        description: "Ghi chú (không bắt buộc)",
    },
]

// Validate a single row
function validateRow(
    row: Record<string, any>,
    rowNumber: number
): string[] {
    const errors: string[] = []

    // Required fields
    if (!row.ma_nhan_vien || String(row.ma_nhan_vien).trim() === "") {
        errors.push("Mã nhân viên là bắt buộc")
    } else {
        const maNV = Number(row.ma_nhan_vien)
        if (isNaN(maNV) || maNV <= 0) {
            errors.push("Mã nhân viên phải là số nguyên dương")
        }
    }

    if (!row.ho_va_ten || String(row.ho_va_ten).trim() === "") {
        errors.push("Họ và tên là bắt buộc")
    }

    if (!row.moi_quan_he || String(row.moi_quan_he).trim() === "") {
        errors.push("Mối quan hệ là bắt buộc")
    } else {
        const validRelations = ["Cha/Bố", "Mẹ", "Vợ/Chồng", "Con", "Anh/Chị/Em", "Khác"]
        const relation = String(row.moi_quan_he).trim()
        if (!validRelations.includes(relation)) {
            errors.push(`Mối quan hệ phải là một trong: ${validRelations.join(", ")}`)
        }
    }

    // Optional fields validation
    if (row.so_dien_thoai && String(row.so_dien_thoai).trim() !== "") {
        const phone = String(row.so_dien_thoai).trim().replace(/\s+/g, "")
        if (!/^[0-9]{10,11}$/.test(phone)) {
            errors.push("Số điện thoại phải có 10-11 chữ số")
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
        const maNV = row.data.ma_nhan_vien
        const hoTen = row.data.ho_va_ten

        if (maNV && hoTen) {
            const key = `${maNV}_${String(hoTen).trim()}`
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

// Map Excel columns to database fields (data is already mapped by ImportDialog)
// This function now handles skip empty cells and date parsing
function mapExcelToDb(
    rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>,
    options: ImportOptions
): Partial<NguoiThan>[] {
    return rows.map((row) => {
        const mapped: Partial<NguoiThan> = {}

        // Map required fields
        if (row.data["ma_nhan_vien"] !== undefined && row.data["ma_nhan_vien"] !== null && row.data["ma_nhan_vien"] !== "") {
            mapped.ma_nhan_vien = Number(row.data["ma_nhan_vien"])
        }

        if (!shouldSkipValue(row.data["ho_va_ten"], options.skipEmptyCells)) {
            mapped.ho_va_ten = String(row.data["ho_va_ten"]).trim()
        }

        if (!shouldSkipValue(row.data["moi_quan_he"], options.skipEmptyCells)) {
            mapped.moi_quan_he = String(row.data["moi_quan_he"]).trim()
        }

        // Map optional fields
        if (!shouldSkipValue(row.data["so_dien_thoai"], options.skipEmptyCells)) {
            mapped.so_dien_thoai = String(row.data["so_dien_thoai"]).trim()
        }

        if (!shouldSkipValue(row.data["ghi_chu"], options.skipEmptyCells)) {
            mapped.ghi_chu = String(row.data["ghi_chu"]).trim()
        }

        // Parse dates using utility (dd/mm/yyyy)
        const dateFormat = options.dateFormat || 'dd/mm/yyyy'
        if (row.data["ngay_sinh"] && !shouldSkipValue(row.data["ngay_sinh"], options.skipEmptyCells)) {
            mapped.ngay_sinh = parseDate(row.data["ngay_sinh"], dateFormat)
        }

        return mapped
    })
}

export function NguoiThanImportDialog({ open, onOpenChange, mutation }: NguoiThanImportDialogProps) {
    const defaultMutation = useBatchUpsertNguoiThan()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions, setImportOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'insert', // Only insert for người thân
        dateFormat: 'dd/mm/yyyy',
    })

    const handleImport = async (rows: Partial<NguoiThan>[]): Promise<{
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
    const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<NguoiThan>[] => {
        return mapExcelToDb(rows, importOptions)
    }

    return (
        <ImportDialog<Partial<NguoiThan>>
            open={open}
            onOpenChange={onOpenChange}
            onImport={handleImport}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={transformData}
            moduleName="người thân"
            expectedHeaders={["ma_nhan_vien", "ho_va_ten", "moi_quan_he"]} // Use db field names after mapping
            templateColumns={templateColumns}
            columnMappings={columnMappings}
            enableAutoMapping={true}
            importOptions={importOptions}
            onOptionsChange={setImportOptions}
        />
    )
}

