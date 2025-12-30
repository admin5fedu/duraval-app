"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertChamOle } from "../actions/cham-ole-excel-actions"
import { ChamOle } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertChamOleReturn = ReturnType<typeof useBatchUpsertChamOle>

interface ChamOleImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertChamOleReturn
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
        dbField: "nam",
        excelNames: [
            "Năm", "Nam",
            "Year", "year"
        ],
        required: true,
        type: "number",
        description: "Năm (bắt buộc)",
    },
    {
        dbField: "thang",
        excelNames: [
            "Tháng", "Thang",
            "Month", "month"
        ],
        required: true,
        type: "number",
        description: "Tháng (bắt buộc)",
    },
    {
        dbField: "phong_id",
        excelNames: [
            "Phòng ID", "Phong ID", "Phòng_ID", "Phong_ID",
            "Department ID", "department id", "DepartmentId", "departmentId"
        ],
        required: false,
        type: "number",
        description: "ID phòng (tùy chọn)",
    },
    {
        dbField: "nhom_id",
        excelNames: [
            "Nhóm ID", "Nhom ID", "Nhóm_ID", "Nhom_ID",
            "Group ID", "group id", "GroupId", "groupId"
        ],
        required: false,
        type: "number",
        description: "ID nhóm (tùy chọn)",
    },
    {
        dbField: "chuc_vu_id",
        excelNames: [
            "Chức vụ ID", "Chuc vu ID", "Chức_vụ_ID", "Chuc_vu_ID",
            "Position ID", "position id", "PositionId", "positionId"
        ],
        required: false,
        type: "number",
        description: "ID chức vụ (tùy chọn)",
    },
    {
        dbField: "danh_gia",
        excelNames: [
            "Đánh giá", "Danh gia", "Đánh_giá", "Danh_gia",
            "Evaluation", "evaluation", "Review", "review"
        ],
        required: false,
        type: "text",
        description: "Đánh giá (tùy chọn)",
    },
    {
        dbField: "ole",
        excelNames: [
            "OLE", "ole",
            "OLE Score", "ole score"
        ],
        required: false,
        type: "number",
        description: "Điểm OLE (tùy chọn)",
    },
    {
        dbField: "kpi",
        excelNames: [
            "KPI", "kpi",
            "KPI Score", "kpi score"
        ],
        required: false,
        type: "number",
        description: "Điểm KPI (tùy chọn)",
    },
    {
        dbField: "cong",
        excelNames: [
            "Cộng", "Cong",
            "Plus", "plus", "Add", "add"
        ],
        required: false,
        type: "number",
        description: "Điểm cộng (tùy chọn)",
    },
    {
        dbField: "tru",
        excelNames: [
            "Trừ", "Tru",
            "Minus", "minus", "Subtract", "subtract"
        ],
        required: false,
        type: "number",
        description: "Điểm trừ (tùy chọn)",
    },
    {
        dbField: "ghi_chu",
        excelNames: [
            "Ghi chú", "Ghi chu", "Ghi_chú", "Ghi_chu",
            "Note", "note", "Comment", "comment", "Remarks", "remarks"
        ],
        required: false,
        type: "text",
        description: "Ghi chú (tùy chọn)",
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
        header: "Năm",
        type: "number",
        required: true,
        description: "Năm (bắt buộc)",
    },
    {
        header: "Tháng",
        type: "number",
        required: true,
        description: "Tháng (bắt buộc, 1-12)",
    },
    {
        header: "Phòng ID",
        type: "number",
        required: false,
        description: "ID phòng (tùy chọn)",
    },
    {
        header: "Nhóm ID",
        type: "number",
        required: false,
        description: "ID nhóm (tùy chọn)",
    },
    {
        header: "Chức vụ ID",
        type: "number",
        required: false,
        description: "ID chức vụ (tùy chọn)",
    },
    {
        header: "Đánh giá",
        type: "text",
        required: false,
        description: "Đánh giá (tùy chọn)",
    },
    {
        header: "OLE",
        type: "number",
        required: false,
        description: "Điểm OLE (tùy chọn)",
    },
    {
        header: "KPI",
        type: "number",
        required: false,
        description: "Điểm KPI (tùy chọn)",
    },
    {
        header: "Cộng",
        type: "number",
        required: false,
        description: "Điểm cộng (tùy chọn)",
    },
    {
        header: "Trừ",
        type: "number",
        required: false,
        description: "Điểm trừ (tùy chọn)",
    },
    {
        header: "Ghi chú",
        type: "text",
        required: false,
        description: "Ghi chú (tùy chọn)",
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
    if (!row.nam || isNaN(Number(row.nam))) {
        errors.push("Năm là bắt buộc và phải là số")
    }
    if (!row.thang || isNaN(Number(row.thang))) {
        errors.push("Tháng là bắt buộc và phải là số")
    }
    if (row.thang && (Number(row.thang) < 1 || Number(row.thang) > 12)) {
        errors.push("Tháng phải từ 1 đến 12")
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
        const nam = row.data.nam
        const thang = row.data.thang

        if (nhanVienId && nam && thang) {
            const key = `${nhanVienId}_${nam}_${thang}`
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
): Partial<ChamOle>[] {
    return rows.map((row) => {
        const mapped: Partial<ChamOle> = {}

        // Map required fields
        if (!shouldSkipValue(row.data["nhan_vien_id"], options.skipEmptyCells)) {
            mapped.nhan_vien_id = Number(row.data["nhan_vien_id"])
        }
        if (!shouldSkipValue(row.data["nam"], options.skipEmptyCells)) {
            mapped.nam = Number(row.data["nam"])
        }
        if (!shouldSkipValue(row.data["thang"], options.skipEmptyCells)) {
            mapped.thang = Number(row.data["thang"])
        }

        // Map optional fields
        if (!shouldSkipValue(row.data["phong_id"], options.skipEmptyCells)) {
            mapped.phong_id = Number(row.data["phong_id"]) || null
        }
        if (!shouldSkipValue(row.data["nhom_id"], options.skipEmptyCells)) {
            mapped.nhom_id = Number(row.data["nhom_id"]) || null
        }
        if (!shouldSkipValue(row.data["chuc_vu_id"], options.skipEmptyCells)) {
            mapped.chuc_vu_id = Number(row.data["chuc_vu_id"]) || null
        }
        if (!shouldSkipValue(row.data["danh_gia"], options.skipEmptyCells)) {
            mapped.danh_gia = String(row.data["danh_gia"]).trim() || null
        }
        if (!shouldSkipValue(row.data["ole"], options.skipEmptyCells)) {
            mapped.ole = Number(row.data["ole"]) || null
        }
        if (!shouldSkipValue(row.data["kpi"], options.skipEmptyCells)) {
            mapped.kpi = Number(row.data["kpi"]) || null
        }
        if (!shouldSkipValue(row.data["cong"], options.skipEmptyCells)) {
            mapped.cong = Number(row.data["cong"]) || null
        }
        if (!shouldSkipValue(row.data["tru"], options.skipEmptyCells)) {
            mapped.tru = Number(row.data["tru"]) || null
        }
        if (!shouldSkipValue(row.data["ghi_chu"], options.skipEmptyCells)) {
            mapped.ghi_chu = String(row.data["ghi_chu"]).trim() || null
        }

        return mapped
    })
}

export function ChamOleImportDialog({ open, onOpenChange, mutation }: ChamOleImportDialogProps) {
    const defaultMutation = useBatchUpsertChamOle()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update', // Update mode: update if exists, insert if not
    })

    const handleImport = async (rows: Partial<ChamOle>[]): Promise<{
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
                nam: row.nam,
                thang: row.thang,
                phong_id: row.phong_id,
                nhom_id: row.nhom_id,
                chuc_vu_id: row.chuc_vu_id,
                danh_gia: row.danh_gia,
                ole: row.ole,
                kpi: row.kpi,
                cong: row.cong,
                tru: row.tru,
                ghi_chu: row.ghi_chu,
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
    const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<ChamOle>[] => {
        return mapExcelToDb(rows, importOptions)
    }

    return (
        <ImportDialog<Partial<ChamOle>>
            open={open}
            onOpenChange={onOpenChange}
            onImport={handleImport}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={transformData}
            moduleName="chấm OLE"
            templateColumns={templateColumns}
            columnMappings={columnMappings}
            enableAutoMapping={true}
            importOptions={importOptions}
        />
    )
}

