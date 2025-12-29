"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertViecHangNgay } from "../actions/viec-hang-ngay-excel-actions"
import { ViecHangNgay } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { parseDate } from "@/shared/utils/excel-date-parser"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertViecHangNgayReturn = ReturnType<typeof useBatchUpsertViecHangNgay>

interface ViecHangNgayImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertViecHangNgayReturn
}

// Template columns for export
const templateColumns: TemplateColumn[] = [
    {
        header: "Mã nhân viên",
        type: "number",
        required: true,
        description: "Mã nhân viên (bắt buộc, số nguyên)",
    },
    {
        header: "Ngày báo cáo",
        type: "date",
        required: true,
        description: "Ngày báo cáo (định dạng dd/mm/yyyy)",
    },
    {
        header: "Mã phòng",
        type: "text",
        required: false,
        description: "Mã phòng (không bắt buộc)",
    },
    {
        header: "Mã nhóm",
        type: "text",
        required: false,
        description: "Mã nhóm (không bắt buộc)",
    },
]

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
        dbField: "ngay_bao_cao",
        excelNames: [
            "Ngày báo cáo", "Ngày Báo Cáo", "Ngay bao cao", "Ngay Bao Cao",
            "Ngày_báo_cáo", "Ngày_Báo_Cáo", "Ngay_bao_cao", "Ngay_Bao_Cao",
            "Ngày BC", "Ngày bc", "Ngay BC", "Ngay bc",
            "Report Date", "ReportDate", "report_date", "Date", "date"
        ],
        required: true,
        type: "date",
        description: "Ngày báo cáo (định dạng dd/mm/yyyy)",
    },
    {
        dbField: "ma_phong",
        excelNames: [
            "Mã phòng", "Mã Phòng", "Ma phong", "Ma Phong",
            "Mã_phòng", "Mã_Phòng", "Ma_phong", "Ma_Phong",
            "Room Code", "RoomCode", "room_code", "Room", "room"
        ],
        required: false,
        type: "text",
        description: "Mã phòng (không bắt buộc)",
    },
    {
        dbField: "ma_nhom",
        excelNames: [
            "Mã nhóm", "Mã Nhóm", "Ma nhom", "Ma Nhom",
            "Mã_nhóm", "Mã_Nhóm", "Ma_nhom", "Ma_Nhom",
            "Group Code", "GroupCode", "group_code", "Group", "group"
        ],
        required: false,
        type: "text",
        description: "Mã nhóm (không bắt buộc)",
    },
]

// Validate a single row
function validateRow(
    row: Record<string, any>,
    _rowNumber: number
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

    if (!row.ngay_bao_cao || String(row.ngay_bao_cao).trim() === "") {
        errors.push("Ngày báo cáo là bắt buộc")
    }

    return errors
}

// Check for duplicates within the import data (ma_nhan_vien + ngay_bao_cao)
function checkDuplicates(
    rows: Array<{ rowNumber: number; data: Record<string, any> }>
): Map<string, number[]> {
    const duplicates = new Map<string, number[]>()

    rows.forEach((row, index) => {
        const maNV = row.data.ma_nhan_vien
        const ngayBaoCao = row.data.ngay_bao_cao

        if (maNV && ngayBaoCao) {
            const key = `${maNV}_${String(ngayBaoCao).trim()}`
            if (!duplicates.has(key)) {
                duplicates.set(key, [])
            }
            duplicates.get(key)!.push(index)
        }
    })

    // Only keep keys with more than one occurrence
    const result = new Map<string, number[]>()
    duplicates.forEach((indices, key) => {
        if (indices.length > 1) {
            result.set(key, indices)
        }
    })

    return result
}

// Map Excel columns to database fields
function mapExcelToDb(
    rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>,
    options: ImportOptions
): Partial<ViecHangNgay>[] {
    return rows.map((row) => {
        const mapped: Partial<ViecHangNgay> = {}

        // Map required fields
        if (row.data["ma_nhan_vien"] !== undefined && row.data["ma_nhan_vien"] !== null && row.data["ma_nhan_vien"] !== "") {
            mapped.ma_nhan_vien = Number(row.data["ma_nhan_vien"])
        }

        if (!shouldSkipValue(row.data["ngay_bao_cao"], options.skipEmptyCells)) {
            // Parse date using utility (dd/mm/yyyy)
            const dateFormat = options.dateFormat || 'dd/mm/yyyy'
            mapped.ngay_bao_cao = parseDate(row.data["ngay_bao_cao"], dateFormat) || String(row.data["ngay_bao_cao"]).trim()
        }

        // Map optional fields
        if (!shouldSkipValue(row.data["ma_phong"], options.skipEmptyCells)) {
            mapped.ma_phong = String(row.data["ma_phong"]).trim()
        }

        if (!shouldSkipValue(row.data["ma_nhom"], options.skipEmptyCells)) {
            mapped.ma_nhom = String(row.data["ma_nhom"]).trim()
        }

        // chi_tiet_cong_viec is not imported from Excel (too complex)
        // Users should use the form to add chi_tiet_cong_viec

        return mapped
    })
}

export function ViecHangNgayImportDialog({ open, onOpenChange, mutation }: ViecHangNgayImportDialogProps) {
    const defaultMutation = useBatchUpsertViecHangNgay()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update', // Update mode: update if exists (ma_nhan_vien + ngay_bao_cao), insert if not
        dateFormat: 'dd/mm/yyyy',
    })

    const handleImport = async (rows: Partial<ViecHangNgay>[]): Promise<{
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
    const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<ViecHangNgay>[] => {
        return mapExcelToDb(rows, importOptions)
    }

    return (
        <ImportDialog<Partial<ViecHangNgay>>
            open={open}
            onOpenChange={onOpenChange}
            onImport={handleImport}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={transformData}
            moduleName="việc hàng ngày"
            templateColumns={templateColumns}
            columnMappings={columnMappings}
            enableAutoMapping={true}
            importOptions={importOptions}
        />
    )
}

