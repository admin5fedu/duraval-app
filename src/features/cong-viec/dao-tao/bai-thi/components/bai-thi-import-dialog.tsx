"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertBaiThi } from "../actions/bai-thi-excel-actions"
import { BaiThi } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertBaiThiReturn = ReturnType<typeof useBatchUpsertBaiThi>

interface BaiThiImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertBaiThiReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "ky_thi_id",
        excelNames: [
            "Kỳ thi ID", "Ky thi ID", "Kỳ Thi ID", "Ky Thi ID",
            "Kỳ_thi_ID", "Ky_thi_ID", "Kỳ_Thi_ID", "Ky_Thi_ID",
            "Kỳ thi", "Ky thi", "Kỳ Thi", "Ky Thi",
            "KyThiID", "kyThiID", "ky_thi_id"
        ],
        required: true,
        type: "number",
        description: "ID của kỳ thi (bắt buộc)",
    },
    {
        dbField: "nhan_vien_id",
        excelNames: [
            "Nhân viên ID", "Nhan vien ID", "Nhân Viên ID", "Nhan Vien ID",
            "Nhân_viên_ID", "Nhan_vien_ID", "Nhân_Viên_ID", "Nhan_Vien_ID",
            "Nhân viên", "Nhan vien", "Nhân Viên", "Nhan Vien",
            "Mã nhân viên", "Ma nhan vien", "Mã Nhân Viên", "Ma Nhan Vien",
            "NhanVienID", "nhanVienID", "nhan_vien_id", "ma_nhan_vien"
        ],
        required: true,
        type: "number",
        description: "ID hoặc mã nhân viên (bắt buộc)",
    },
    {
        dbField: "ngay_lam_bai",
        excelNames: [
            "Ngày làm bài", "Ngay lam bai", "Ngày Làm Bài", "Ngay Lam Bai",
            "Ngày_làm_bài", "Ngay_lam_bai", "Ngày_Làm_Bài", "Ngay_Lam_Bai",
            "Ngày", "Ngay", "Date", "date",
            "Ngày thi", "Ngay thi", "Ngày làm", "Ngay lam"
        ],
        required: true,
        type: "date",
        description: "Ngày làm bài (bắt buộc) - định dạng: dd/mm/yyyy",
    },
    {
        dbField: "trang_thai",
        excelNames: [
            "Trạng thái", "Trang thai", "Trạng Thái", "Trang Thai",
            "Trạng_thái", "Trang_thai", "Trạng_Thái", "Trang_Thai",
            "Status", "status", "Trạng thái", "Trang thai"
        ],
        required: false,
        type: "text",
        description: "Trạng thái (Chưa thi/Đang thi/Đạt/Không đạt) - mặc định: Chưa thi",
    },
    {
        dbField: "thoi_gian_bat_dau",
        excelNames: [
            "Thời gian bắt đầu", "Thoi gian bat dau", "Thời Gian Bắt Đầu", "Thoi Gian Bat Dau",
            "Thời_gian_bắt_đầu", "Thoi_gian_bat_dau", "Thời_Gian_Bắt_Đầu", "Thoi_Gian_Bat_Dau",
            "Bắt đầu", "Bat dau", "Bắt Đầu", "Bat Dau",
            "Start time", "start_time", "Thời gian bắt đầu"
        ],
        required: false,
        type: "datetime",
        description: "Thời gian bắt đầu - định dạng: dd/mm/yyyy HH:mm",
    },
    {
        dbField: "thoi_gian_ket_thuc",
        excelNames: [
            "Thời gian kết thúc", "Thoi gian ket thuc", "Thời Gian Kết Thúc", "Thoi Gian Ket Thuc",
            "Thời_gian_kết_thúc", "Thoi_gian_ket_thuc", "Thời_Gian_Kết_Thúc", "Thoi_Gian_Ket_Thuc",
            "Kết thúc", "Ket thuc", "Kết Thúc", "Ket Thuc",
            "End time", "end_time", "Thời gian kết thúc"
        ],
        required: false,
        type: "datetime",
        description: "Thời gian kết thúc - định dạng: dd/mm/yyyy HH:mm",
    },
    {
        dbField: "diem_so",
        excelNames: [
            "Điểm số", "Diem so", "Điểm Số", "Diem So",
            "Điểm_số", "Diem_so", "Điểm_Số", "Diem_So",
            "Điểm", "Diem", "Score", "score", "Points", "points"
        ],
        required: false,
        type: "number",
        description: "Điểm số - mặc định: 0",
    },
    {
        dbField: "tong_so_cau",
        excelNames: [
            "Tổng số câu", "Tong so cau", "Tổng Số Câu", "Tong So Cau",
            "Tổng_số_câu", "Tong_so_cau", "Tổng_Số_Câu", "Tong_So_Cau",
            "Tổng câu", "Tong cau", "Total questions", "total_questions"
        ],
        required: false,
        type: "number",
        description: "Tổng số câu hỏi - mặc định: 0",
    },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
    {
        header: "Kỳ thi ID",
        type: "number",
        required: true,
        description: "ID của kỳ thi (bắt buộc)",
    },
    {
        header: "Nhân viên ID",
        type: "number",
        required: true,
        description: "ID hoặc mã nhân viên (bắt buộc)",
    },
    {
        header: "Ngày làm bài",
        type: "date",
        required: true,
        description: "Ngày làm bài (bắt buộc) - định dạng: dd/mm/yyyy",
    },
    {
        header: "Trạng thái",
        type: "text",
        required: false,
        description: "Trạng thái (Chưa thi/Đang thi/Đạt/Không đạt) - mặc định: Chưa thi",
    },
    {
        header: "Thời gian bắt đầu",
        type: "datetime",
        required: false,
        description: "Thời gian bắt đầu - định dạng: dd/mm/yyyy HH:mm",
    },
    {
        header: "Thời gian kết thúc",
        type: "datetime",
        required: false,
        description: "Thời gian kết thúc - định dạng: dd/mm/yyyy HH:mm",
    },
    {
        header: "Điểm số",
        type: "number",
        required: false,
        description: "Điểm số - mặc định: 0",
    },
    {
        header: "Tổng số câu",
        type: "number",
        required: false,
        description: "Tổng số câu hỏi - mặc định: 0",
    },
]

// Validate a single row
function validateRow(
    row: Record<string, any>,
    _rowNumber: number
): string[] {
    const errors: string[] = []

    // Required fields
    if (!row.ky_thi_id || String(row.ky_thi_id).trim() === "") {
        errors.push("Kỳ thi ID là bắt buộc")
    } else {
        const num = typeof row.ky_thi_id === 'number' ? row.ky_thi_id : parseInt(String(row.ky_thi_id), 10)
        if (isNaN(num) || num <= 0) {
            errors.push("Kỳ thi ID phải là số dương")
        }
    }

    if (!row.nhan_vien_id || String(row.nhan_vien_id).trim() === "") {
        errors.push("Nhân viên ID là bắt buộc")
    } else {
        const num = typeof row.nhan_vien_id === 'number' ? row.nhan_vien_id : parseInt(String(row.nhan_vien_id), 10)
        if (isNaN(num) || num <= 0) {
            errors.push("Nhân viên ID phải là số dương")
        }
    }

    if (!row.ngay_lam_bai || String(row.ngay_lam_bai).trim() === "") {
        errors.push("Ngày làm bài là bắt buộc")
    }

    // Validate diem_so if provided
    if (row.diem_so !== undefined && row.diem_so !== null && row.diem_so !== "") {
        const num = typeof row.diem_so === 'number' ? row.diem_so : parseInt(String(row.diem_so), 10)
        if (isNaN(num) || num < 0) {
            errors.push("Điểm số phải lớn hơn hoặc bằng 0")
        }
    }

    // Validate tong_so_cau if provided
    if (row.tong_so_cau !== undefined && row.tong_so_cau !== null && row.tong_so_cau !== "") {
        const num = typeof row.tong_so_cau === 'number' ? row.tong_so_cau : parseInt(String(row.tong_so_cau), 10)
        if (isNaN(num) || num < 0) {
            errors.push("Tổng số câu phải lớn hơn hoặc bằng 0")
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
        const kyThiId = row.data.ky_thi_id
        const nhanVienId = row.data.nhan_vien_id
        const ngayLamBai = row.data.ngay_lam_bai

        if (kyThiId && nhanVienId && ngayLamBai) {
            const key = `${String(kyThiId).trim()}|${String(nhanVienId).trim()}|${String(ngayLamBai).trim().toLowerCase()}`
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
): Partial<BaiThi>[] {
    return rows.map((row) => {
        const mapped: Partial<BaiThi> = {}

        // Map required fields
        if (!shouldSkipValue(row.data["ky_thi_id"], options.skipEmptyCells)) {
            const value = row.data["ky_thi_id"]
            mapped.ky_thi_id = typeof value === 'number' ? value : parseInt(String(value), 10)
        }

        if (!shouldSkipValue(row.data["nhan_vien_id"], options.skipEmptyCells)) {
            const value = row.data["nhan_vien_id"]
            mapped.nhan_vien_id = typeof value === 'number' ? value : parseInt(String(value), 10)
        }

        if (!shouldSkipValue(row.data["ngay_lam_bai"], options.skipEmptyCells)) {
            mapped.ngay_lam_bai = String(row.data["ngay_lam_bai"]).trim()
        }

        // Map optional fields
        if (!shouldSkipValue(row.data["trang_thai"], options.skipEmptyCells)) {
            mapped.trang_thai = String(row.data["trang_thai"]).trim()
        }

        // Map datetime fields
        if (!shouldSkipValue(row.data["thoi_gian_bat_dau"], options.skipEmptyCells)) {
            const value = row.data["thoi_gian_bat_dau"]
            if (typeof value === 'string') {
                try {
                    const date = new Date(value)
                    if (!isNaN(date.getTime())) {
                        mapped.thoi_gian_bat_dau = date.toISOString()
                    }
                } catch {
                    // Keep as string if parsing fails
                    mapped.thoi_gian_bat_dau = value
                }
            }
        }

        if (!shouldSkipValue(row.data["thoi_gian_ket_thuc"], options.skipEmptyCells)) {
            const value = row.data["thoi_gian_ket_thuc"]
            if (typeof value === 'string') {
                try {
                    const date = new Date(value)
                    if (!isNaN(date.getTime())) {
                        mapped.thoi_gian_ket_thuc = date.toISOString()
                    }
                } catch {
                    // Keep as string if parsing fails
                    mapped.thoi_gian_ket_thuc = value
                }
            }
        }

        // Map number fields
        if (!shouldSkipValue(row.data["diem_so"], options.skipEmptyCells)) {
            const value = row.data["diem_so"]
            if (typeof value === 'number') {
                mapped.diem_so = value
            } else {
                const num = parseInt(String(value), 10)
                if (!isNaN(num)) {
                    mapped.diem_so = num
                }
            }
        }

        if (!shouldSkipValue(row.data["tong_so_cau"], options.skipEmptyCells)) {
            const value = row.data["tong_so_cau"]
            if (typeof value === 'number') {
                mapped.tong_so_cau = value
            } else {
                const num = parseInt(String(value), 10)
                if (!isNaN(num)) {
                    mapped.tong_so_cau = num
                }
            }
        }

        return mapped
    })
}

export function BaiThiImportDialog({ open, onOpenChange, mutation }: BaiThiImportDialogProps) {
    const defaultMutation = useBatchUpsertBaiThi()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions, _setImportOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update', // Update mode: update if exists, insert if not
    })

    const handleImport = async (rows: Partial<BaiThi>[]): Promise<{
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
            return {
                success: false,
                inserted: 0,
                updated: 0,
                failed: rows.length,
                errors: rows.map((_, index) => ({
                    rowNumber: index + 1,
                    errors: [error instanceof Error ? error.message : "Lỗi không xác định"],
                })),
            }
        }
    }

    return (
        <ImportDialog
            open={open}
            onOpenChange={onOpenChange}
            moduleName="bài thi"
            columnMappings={columnMappings}
            templateColumns={templateColumns}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={(rows) => {
                const options: ImportOptions = {
                    skipEmptyCells: true,
                    upsertMode: 'update',
                    dateFormat: 'dd/mm/yyyy',
                }
                return mapExcelToDb(rows, options)
            }}
            onImport={handleImport}
            importOptions={importOptions}
        />
    )
}

