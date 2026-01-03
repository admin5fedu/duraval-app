"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertCauHoi } from "../actions/cau-hoi-excel-actions"
import { CauHoi } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertCauHoiReturn = ReturnType<typeof useBatchUpsertCauHoi>

interface CauHoiImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertCauHoiReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "ten_chuyen_de",
        excelNames: [
            "Chuyên đề", "Chuyên Đề", "Chuyen de", "Chuyen De",
            "Chuyên_đề", "Chuyên_Đề", "Chuyen_de", "Chuyen_De",
            "Tên chuyên đề", "Ten chuyen de", "Topic", "topic"
        ],
        required: true,
        type: "text",
        description: "Tên chuyên đề (bắt buộc) - dùng để tìm chuyen_de_id",
    },
    {
        dbField: "cau_hoi",
        excelNames: [
            "Câu hỏi", "Câu Hỏi", "Cau hoi", "Cau Hoi",
            "Câu_hỏi", "Câu_Hỏi", "Cau_hoi", "Cau_Hoi",
            "Question", "question", "Nội dung", "Noi dung"
        ],
        required: true,
        type: "text",
        description: "Nội dung câu hỏi (bắt buộc)",
    },
    {
        dbField: "dap_an_1",
        excelNames: [
            "Đáp án 1", "Đáp Án 1", "Dap an 1", "Dap An 1",
            "Đáp_án_1", "Đáp_Án_1", "Dap_an_1", "Dap_An_1",
            "Answer 1", "answer 1", "A", "a"
        ],
        required: true,
        type: "text",
        description: "Đáp án 1 (bắt buộc)",
    },
    {
        dbField: "dap_an_2",
        excelNames: [
            "Đáp án 2", "Đáp Án 2", "Dap an 2", "Dap An 2",
            "Đáp_án_2", "Đáp_Án_2", "Dap_an_2", "Dap_An_2",
            "Answer 2", "answer 2", "B", "b"
        ],
        required: true,
        type: "text",
        description: "Đáp án 2 (bắt buộc)",
    },
    {
        dbField: "dap_an_3",
        excelNames: [
            "Đáp án 3", "Đáp Án 3", "Dap an 3", "Dap An 3",
            "Đáp_án_3", "Đáp_Án_3", "Dap_an_3", "Dap_An_3",
            "Answer 3", "answer 3", "C", "c"
        ],
        required: true,
        type: "text",
        description: "Đáp án 3 (bắt buộc)",
    },
    {
        dbField: "dap_an_4",
        excelNames: [
            "Đáp án 4", "Đáp Án 4", "Dap an 4", "Dap An 4",
            "Đáp_án_4", "Đáp_Án_4", "Dap_an_4", "Dap_An_4",
            "Answer 4", "answer 4", "D", "d"
        ],
        required: true,
        type: "text",
        description: "Đáp án 4 (bắt buộc)",
    },
    {
        dbField: "dap_an_dung",
        excelNames: [
            "Đáp án đúng", "Đáp Án Đúng", "Dap an dung", "Dap An Dung",
            "Đáp_án_đúng", "Đáp_Án_Đúng", "Dap_an_dung", "Dap_An_Dung",
            "Correct Answer", "correct answer", "Đúng", "Dung"
        ],
        required: true,
        type: "number",
        description: "Đáp án đúng (1-4) (bắt buộc)",
    },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
    {
        header: "Chuyên đề",
        type: "text",
        required: true,
        description: "Tên chuyên đề (bắt buộc) - phải tồn tại trong hệ thống",
    },
    {
        header: "Câu hỏi",
        type: "text",
        required: true,
        description: "Nội dung câu hỏi (bắt buộc)",
    },
    {
        header: "Đáp án 1",
        type: "text",
        required: true,
        description: "Đáp án 1 (bắt buộc)",
    },
    {
        header: "Đáp án 2",
        type: "text",
        required: true,
        description: "Đáp án 2 (bắt buộc)",
    },
    {
        header: "Đáp án 3",
        type: "text",
        required: true,
        description: "Đáp án 3 (bắt buộc)",
    },
    {
        header: "Đáp án 4",
        type: "text",
        required: true,
        description: "Đáp án 4 (bắt buộc)",
    },
    {
        header: "Đáp án đúng",
        type: "number",
        required: true,
        description: "Đáp án đúng (1-4) (bắt buộc)",
    },
]

// Validate a single row
function validateRow(
    row: Record<string, any>,
    _rowNumber: number
): string[] {
    const errors: string[] = []

    // Required fields
    if (!row.ten_chuyen_de || String(row.ten_chuyen_de).trim() === "") {
        errors.push("Chuyên đề là bắt buộc")
    }

    if (!row.cau_hoi || String(row.cau_hoi).trim() === "") {
        errors.push("Câu hỏi là bắt buộc")
    }

    if (!row.dap_an_1 || String(row.dap_an_1).trim() === "") {
        errors.push("Đáp án 1 là bắt buộc")
    }

    if (!row.dap_an_2 || String(row.dap_an_2).trim() === "") {
        errors.push("Đáp án 2 là bắt buộc")
    }

    if (!row.dap_an_3 || String(row.dap_an_3).trim() === "") {
        errors.push("Đáp án 3 là bắt buộc")
    }

    if (!row.dap_an_4 || String(row.dap_an_4).trim() === "") {
        errors.push("Đáp án 4 là bắt buộc")
    }

    // Validate dap_an_dung
    const dapAnDung = row.dap_an_dung
    if (dapAnDung === null || dapAnDung === undefined || dapAnDung === "") {
        errors.push("Đáp án đúng là bắt buộc")
    } else {
        const num = typeof dapAnDung === 'number' ? dapAnDung : parseInt(String(dapAnDung), 10)
        if (isNaN(num) || num < 1 || num > 4) {
            errors.push("Đáp án đúng phải từ 1 đến 4")
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
        const cauHoi = row.data.cau_hoi
        const tenChuyenDe = row.data.ten_chuyen_de

        if (cauHoi && tenChuyenDe) {
            const key = `${String(cauHoi).trim().toLowerCase()}|${String(tenChuyenDe).trim().toLowerCase()}`
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
): Partial<CauHoi>[] {
    return rows.map((row) => {
        const mapped: Partial<CauHoi> = {}

        // Map ten_chuyen_de (will be resolved to chuyen_de_id in the action)
        if (!shouldSkipValue(row.data["ten_chuyen_de"], options.skipEmptyCells)) {
            mapped.ten_chuyen_de = String(row.data["ten_chuyen_de"]).trim()
        }

        // Map required fields
        if (!shouldSkipValue(row.data["cau_hoi"], options.skipEmptyCells)) {
            mapped.cau_hoi = String(row.data["cau_hoi"]).trim()
        }

        if (!shouldSkipValue(row.data["dap_an_1"], options.skipEmptyCells)) {
            mapped.dap_an_1 = String(row.data["dap_an_1"]).trim()
        }

        if (!shouldSkipValue(row.data["dap_an_2"], options.skipEmptyCells)) {
            mapped.dap_an_2 = String(row.data["dap_an_2"]).trim()
        }

        if (!shouldSkipValue(row.data["dap_an_3"], options.skipEmptyCells)) {
            mapped.dap_an_3 = String(row.data["dap_an_3"]).trim()
        }

        if (!shouldSkipValue(row.data["dap_an_4"], options.skipEmptyCells)) {
            mapped.dap_an_4 = String(row.data["dap_an_4"]).trim()
        }

        // Map dap_an_dung (convert to number)
        if (!shouldSkipValue(row.data["dap_an_dung"], options.skipEmptyCells)) {
            const value = row.data["dap_an_dung"]
            if (typeof value === 'number') {
                mapped.dap_an_dung = value
            } else {
                const num = parseInt(String(value), 10)
                if (!isNaN(num) && num >= 1 && num <= 4) {
                    mapped.dap_an_dung = num
                }
            }
        }

        return mapped
    })
}

export function CauHoiImportDialog({ open, onOpenChange, mutation }: CauHoiImportDialogProps) {
    const defaultMutation = useBatchUpsertCauHoi()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions, _setImportOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update', // Update mode: update if exists, insert if not
    })

    const handleImport = async (rows: Partial<CauHoi>[]): Promise<{
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
            moduleName="câu hỏi"
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

