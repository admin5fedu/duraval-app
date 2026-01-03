"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertKyThi } from "../actions/ky-thi-excel-actions"
import { KyThi } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertKyThiReturn = ReturnType<typeof useBatchUpsertKyThi>

interface KyThiImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertKyThiReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "ngay",
        excelNames: [
            "Ngày", "Ngay", "Date", "date",
            "Ngày thi", "Ngay thi", "Ngày tổ chức", "Ngay to chuc"
        ],
        required: true,
        type: "date",
        description: "Ngày tổ chức kỳ thi (bắt buộc) - định dạng: dd/mm/yyyy",
    },
    {
        dbField: "ten_ky_thi",
        excelNames: [
            "Tên kỳ thi", "Ten ky thi", "Tên Kỳ Thi", "Ten Ky Thi",
            "Tên_kỳ_thi", "Ten_ky_thi", "Tên_Kỳ_Thi", "Ten_Ky_Thi",
            "Name", "name", "Tên", "Ten"
        ],
        required: true,
        type: "text",
        description: "Tên kỳ thi (bắt buộc)",
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
        description: "Trạng thái (Mở/Đóng) - mặc định: Mở",
    },
    {
        dbField: "so_cau_hoi",
        excelNames: [
            "Số câu hỏi", "So cau hoi", "Số Câu Hỏi", "So Cau Hoi",
            "Số_câu_hỏi", "So_cau_hoi", "Số_Câu_Hỏi", "So_Cau_Hoi",
            "Number of questions", "So cau", "Số câu", "So cau"
        ],
        required: false,
        type: "number",
        description: "Số câu hỏi - mặc định: 10",
    },
    {
        dbField: "so_phut_lam_bai",
        excelNames: [
            "Số phút làm bài", "So phut lam bai", "Số Phút Làm Bài", "So Phut Lam Bai",
            "Số_phút_làm_bài", "So_phut_lam_bai", "Số_Phút_Làm_Bài", "So_Phut_Lam_Bai",
            "Time", "time", "Thời gian", "Thoi gian", "Phút", "Phut"
        ],
        required: false,
        type: "number",
        description: "Số phút làm bài - mặc định: 15",
    },
    {
        dbField: "nhom_chuyen_de_ids",
        excelNames: [
            "Nhóm chuyên đề", "Nhom chuyen de", "Nhóm Chuyên Đề", "Nhom Chuyen De",
            "Nhóm_chuyên_đề", "Nhom_chuyen_de", "Nhóm_Chuyên_Đề", "Nhom_Chuyen_De",
            "Nhóm chuyên đề IDs", "Nhom chuyen de IDs", "Nhóm IDs", "Nhom IDs"
        ],
        required: false,
        type: "text",
        description: "Danh sách ID nhóm chuyên đề, cách nhau bởi dấu phẩy (ví dụ: 1,2,3)",
    },
    {
        dbField: "chuyen_de_ids",
        excelNames: [
            "Chuyên đề", "Chuyen de", "Chuyên Đề", "Chuyen De",
            "Chuyên_đề", "Chuyen_de", "Chuyên_Đề", "Chuyen_De",
            "Chuyên đề IDs", "Chuyen de IDs", "Chuyên đề ID", "Chuyen de ID"
        ],
        required: false,
        type: "text",
        description: "Danh sách ID chuyên đề, cách nhau bởi dấu phẩy (ví dụ: 10,11,12)",
    },
    {
        dbField: "chuc_vu_ids",
        excelNames: [
            "Chức vụ", "Chuc vu", "Chức Vụ", "Chuc Vu",
            "Chức_vụ", "Chuc_vu", "Chức_Vụ", "Chuc_Vu",
            "Chức vụ IDs", "Chuc vu IDs", "Chức vụ ID", "Chuc vu ID"
        ],
        required: false,
        type: "text",
        description: "Danh sách ID chức vụ, cách nhau bởi dấu phẩy (ví dụ: 1,2) - để trống nếu không giới hạn",
    },
    {
        dbField: "ghi_chu",
        excelNames: [
            "Ghi chú", "Ghi chu", "Ghi Chú", "Ghi Chu",
            "Ghi_chú", "Ghi_chu", "Ghi_Chú", "Ghi_Chu",
            "Note", "note", "Notes", "notes", "Mô tả", "Mo ta"
        ],
        required: false,
        type: "text",
        description: "Ghi chú (tùy chọn)",
    },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
    {
        header: "Ngày",
        type: "date",
        required: true,
        description: "Ngày tổ chức kỳ thi (bắt buộc) - định dạng: dd/mm/yyyy",
    },
    {
        header: "Tên kỳ thi",
        type: "text",
        required: true,
        description: "Tên kỳ thi (bắt buộc)",
    },
    {
        header: "Trạng thái",
        type: "text",
        required: false,
        description: "Trạng thái (Mở/Đóng) - mặc định: Mở",
    },
    {
        header: "Số câu hỏi",
        type: "number",
        required: false,
        description: "Số câu hỏi - mặc định: 10",
    },
    {
        header: "Số phút làm bài",
        type: "number",
        required: false,
        description: "Số phút làm bài - mặc định: 15",
    },
    {
        header: "Nhóm chuyên đề IDs",
        type: "text",
        required: false,
        description: "Danh sách ID nhóm chuyên đề, cách nhau bởi dấu phẩy (ví dụ: 1,2,3)",
    },
    {
        header: "Chuyên đề IDs",
        type: "text",
        required: false,
        description: "Danh sách ID chuyên đề, cách nhau bởi dấu phẩy (ví dụ: 10,11,12)",
    },
    {
        header: "Chức vụ IDs",
        type: "text",
        required: false,
        description: "Danh sách ID chức vụ, cách nhau bởi dấu phẩy (ví dụ: 1,2) - để trống nếu không giới hạn",
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
    row: Record<string, any>,
    _rowNumber: number
): string[] {
    const errors: string[] = []

    // Required fields
    if (!row.ngay || String(row.ngay).trim() === "") {
        errors.push("Ngày là bắt buộc")
    }

    if (!row.ten_ky_thi || String(row.ten_ky_thi).trim() === "") {
        errors.push("Tên kỳ thi là bắt buộc")
    }

    // Validate so_cau_hoi if provided
    if (row.so_cau_hoi !== undefined && row.so_cau_hoi !== null && row.so_cau_hoi !== "") {
        const num = typeof row.so_cau_hoi === 'number' ? row.so_cau_hoi : parseInt(String(row.so_cau_hoi), 10)
        if (isNaN(num) || num <= 0) {
            errors.push("Số câu hỏi phải lớn hơn 0")
        }
    }

    // Validate so_phut_lam_bai if provided
    if (row.so_phut_lam_bai !== undefined && row.so_phut_lam_bai !== null && row.so_phut_lam_bai !== "") {
        const num = typeof row.so_phut_lam_bai === 'number' ? row.so_phut_lam_bai : parseInt(String(row.so_phut_lam_bai), 10)
        if (isNaN(num) || num <= 0) {
            errors.push("Số phút làm bài phải lớn hơn 0")
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
        const tenKyThi = row.data.ten_ky_thi
        const ngay = row.data.ngay

        if (tenKyThi && ngay) {
            const key = `${String(tenKyThi).trim().toLowerCase()}|${String(ngay).trim().toLowerCase()}`
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
): Partial<KyThi>[] {
    return rows.map((row) => {
        const mapped: Partial<KyThi> = {}

        // Map required fields
        if (!shouldSkipValue(row.data["ngay"], options.skipEmptyCells)) {
            mapped.ngay = String(row.data["ngay"]).trim()
        }

        if (!shouldSkipValue(row.data["ten_ky_thi"], options.skipEmptyCells)) {
            mapped.ten_ky_thi = String(row.data["ten_ky_thi"]).trim()
        }

        // Map optional fields
        if (!shouldSkipValue(row.data["trang_thai"], options.skipEmptyCells)) {
            mapped.trang_thai = String(row.data["trang_thai"]).trim()
        }

        if (!shouldSkipValue(row.data["so_cau_hoi"], options.skipEmptyCells)) {
            const value = row.data["so_cau_hoi"]
            if (typeof value === 'number') {
                mapped.so_cau_hoi = value
            } else {
                const num = parseInt(String(value), 10)
                if (!isNaN(num) && num > 0) {
                    mapped.so_cau_hoi = num
                }
            }
        }

        if (!shouldSkipValue(row.data["so_phut_lam_bai"], options.skipEmptyCells)) {
            const value = row.data["so_phut_lam_bai"]
            if (typeof value === 'number') {
                mapped.so_phut_lam_bai = value
            } else {
                const num = parseInt(String(value), 10)
                if (!isNaN(num) && num > 0) {
                    mapped.so_phut_lam_bai = num
                }
            }
        }

        // Map array fields
        if (!shouldSkipValue(row.data["nhom_chuyen_de_ids"], options.skipEmptyCells)) {
            const value = row.data["nhom_chuyen_de_ids"]
            if (typeof value === 'string') {
                mapped.nhom_chuyen_de_ids = value.split(",").map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id) && id > 0)
            } else if (Array.isArray(value)) {
                mapped.nhom_chuyen_de_ids = value.map(id => typeof id === 'string' ? parseInt(id, 10) : id).filter(id => !isNaN(id) && id > 0)
            }
        }

        if (!shouldSkipValue(row.data["chuyen_de_ids"], options.skipEmptyCells)) {
            const value = row.data["chuyen_de_ids"]
            if (typeof value === 'string') {
                mapped.chuyen_de_ids = value.split(",").map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id) && id > 0)
            } else if (Array.isArray(value)) {
                mapped.chuyen_de_ids = value.map(id => typeof id === 'string' ? parseInt(id, 10) : id).filter(id => !isNaN(id) && id > 0)
            }
        }

        if (!shouldSkipValue(row.data["chuc_vu_ids"], options.skipEmptyCells)) {
            const value = row.data["chuc_vu_ids"]
            if (typeof value === 'string') {
                mapped.chuc_vu_ids = value.split(",").map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id) && id > 0)
            } else if (Array.isArray(value)) {
                mapped.chuc_vu_ids = value.map(id => typeof id === 'string' ? parseInt(id, 10) : id).filter(id => !isNaN(id) && id > 0)
            }
        }

        if (!shouldSkipValue(row.data["ghi_chu"], options.skipEmptyCells)) {
            mapped.ghi_chu = String(row.data["ghi_chu"]).trim()
        }

        return mapped
    })
}

export function KyThiImportDialog({ open, onOpenChange, mutation }: KyThiImportDialogProps) {
    const defaultMutation = useBatchUpsertKyThi()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions, _setImportOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update', // Update mode: update if exists, insert if not
    })

    const handleImport = async (rows: Partial<KyThi>[]): Promise<{
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
            moduleName="kỳ thi"
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

