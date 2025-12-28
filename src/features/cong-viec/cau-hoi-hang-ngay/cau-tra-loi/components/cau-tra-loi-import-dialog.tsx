"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertCauTraLoi } from "../actions/cau-tra-loi-excel-actions"
import { CauTraLoi } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertCauTraLoiReturn = ReturnType<typeof useBatchUpsertCauTraLoi>

interface CauTraLoiImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertCauTraLoiReturn
}

// Template columns for export
const templateColumns: TemplateColumn[] = [
    {
        name: "lich_dang_id",
        label: "Lịch đăng (ID)",
        type: "number",
        required: true,
        description: "ID của lịch đăng (bắt buộc)",
    },
    {
        name: "cau_tra_loi",
        label: "Câu trả lời",
        type: "string",
        required: true,
        description: "Nội dung câu trả lời (bắt buộc)",
    },
    {
        name: "ket_qua",
        label: "Kết quả",
        type: "string",
        required: true,
        description: "Kết quả: Đúng, Sai hoặc Chưa chấm (bắt buộc)",
    },
]

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "lich_dang_id",
        excelNames: [
            "Lịch đăng", "Lịch Đăng", "Lich dang", "Lich Dang",
            "Lịch_đăng", "Lịch_Đăng", "Lich_dang", "Lich_Dang",
            "Lịch đăng ID", "Lich dang ID", "Lịch đăng ID", "Lich dang ID",
            "LichDangId", "lichDangId", "LichDangID", "lich_dang_id"
        ],
    },
    {
        dbField: "cau_tra_loi",
        excelNames: [
            "Câu trả lời", "Câu Trả Lời", "Cau tra loi", "Cau Tra Loi",
            "Câu_trả_lời", "Câu_Trả_Lời", "Cau_tra_loi", "Cau_Tra_Loi",
            "CauTraLoi", "cauTraLoi", "Cau Tra Loi", "cau tra loi",
            "Câu trả lời", "Cau tra loi", "Trả lời", "Tra loi"
        ],
    },
    {
        dbField: "ket_qua",
        excelNames: [
            "Kết quả", "Kết Quả", "Ket qua", "Ket Qua",
            "Kết_quả", "Kết_Quả", "Ket_qua", "Ket_Qua",
            "KetQua", "ketQua", "Kết quả", "Ket qua",
            "Kết quả", "Result", "result", "RESULT"
        ],
    },
]

// Transform function to convert Excel rows to CauTraLoi
function transformData(rows: Array<{ rowNumber: number; data: Record<string, any> }>): Partial<CauTraLoi>[] {
    return rows.map(({ data }) => {
        const record: Partial<CauTraLoi> = {}

        // lich_dang_id
        if (data.lich_dang_id !== undefined && !shouldSkipValue(data.lich_dang_id)) {
            if (typeof data.lich_dang_id === "string") {
                const num = Number(data.lich_dang_id.trim())
                record.lich_dang_id = isNaN(num) ? undefined : num
            } else if (typeof data.lich_dang_id === "number") {
                record.lich_dang_id = data.lich_dang_id
            }
        }

        // cau_tra_loi
        if (data.cau_tra_loi !== undefined && !shouldSkipValue(data.cau_tra_loi)) {
            record.cau_tra_loi = String(data.cau_tra_loi).trim() || undefined
        }

        // ket_qua
        if (data.ket_qua !== undefined && !shouldSkipValue(data.ket_qua)) {
            const trimmed = String(data.ket_qua).trim()
            // Validate ket_qua values
            const validValues = ["Đúng", "Sai", "Chưa chấm"]
            if (validValues.includes(trimmed)) {
                record.ket_qua = trimmed
            } else {
                // Try to normalize
                const normalized = trimmed.toLowerCase()
                if (normalized === "dung" || normalized === "đúng" || normalized === "true") {
                    record.ket_qua = "Đúng"
                } else if (normalized === "sai" || normalized === "false") {
                    record.ket_qua = "Sai"
                } else if (normalized.includes("chưa") || normalized.includes("chua")) {
                    record.ket_qua = "Chưa chấm"
                } else {
                    record.ket_qua = trimmed // Return as is if not matching
                }
            }
        }

        return record
    })
}

export function CauTraLoiImportDialog({ open, onOpenChange, mutation }: CauTraLoiImportDialogProps) {
    const batchUpsertMutation = mutation || useBatchUpsertCauTraLoi()

    const handleImport = async (records: Partial<CauTraLoi>[]) => {
        const result = await batchUpsertMutation.mutateAsync(records)
        return {
            success: result.errors.length === 0,
            inserted: result.inserted,
            updated: result.updated,
            failed: result.errors.length,
            errors: result.errors.map(err => ({ rowNumber: err.row, errors: [err.error] })),
        }
    }

    return (
        <ImportDialog<CauTraLoi>
            open={open}
            onOpenChange={onOpenChange}
            onImport={handleImport}
            transformData={transformData}
            moduleName="Câu Trả Lời"
            templateColumns={templateColumns}
            columnMappings={columnMappings}
            enableAutoMapping={true}
        />
    )
}

