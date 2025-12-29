"use client"

import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertLichDang } from "../actions/lich-dang-excel-actions"
import { LichDang } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertLichDangReturn = ReturnType<typeof useBatchUpsertLichDang>

interface LichDangImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertLichDangReturn
}

// Template columns for export
const templateColumns: TemplateColumn[] = [
    {
        header: "Ngày đăng",
        type: "date",
        required: true,
        description: "Ngày đăng câu hỏi (bắt buộc, định dạng: YYYY-MM-DD)",
    },
    {
        header: "Nhóm câu hỏi (ID)",
        type: "number",
        required: true,
        description: "ID của nhóm câu hỏi (bắt buộc)",
    },
    {
        header: "Câu hỏi",
        type: "text",
        required: true,
        description: "Nội dung câu hỏi (bắt buộc)",
    },
    {
        header: "Hình ảnh (URL)",
        type: "text",
        required: false,
        description: "URL hình ảnh (không bắt buộc)",
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
        description: "Số thứ tự đáp án đúng (1, 2, 3 hoặc 4) (bắt buộc)",
    },
    {
        header: "Chức vụ áp dụng (IDs)",
        type: "text",
        required: false,
        description: "Danh sách ID chức vụ áp dụng, phân cách bằng dấu phẩy (ví dụ: 1,2,3). Để trống = tất cả chức vụ",
    },
]

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "ngay_dang",
        excelNames: [
            "Ngày đăng", "Ngày Đăng", "Ngay dang", "Ngay Dang",
            "Ngày_đăng", "Ngày_Đăng", "Ngay_dang", "Ngay_Dang",
            "Date", "date", "Ngày", "Ngay", "Ngày tạo", "Ngay tao"
        ],
        required: true,
        type: "date",
        description: "Ngày đăng câu hỏi (bắt buộc)",
    },
    {
        dbField: "nhom_cau_hoi",
        excelNames: [
            "Nhóm câu hỏi", "Nhóm Câu Hỏi", "Nhom cau hoi", "Nhom Cau Hoi",
            "Nhóm_câu_hỏi", "Nhóm_Câu_Hỏi", "Nhom_cau_hoi", "Nhom_Cau_Hoi",
            "Nhóm câu hỏi ID", "Nhóm Câu Hỏi ID", "Nhom cau hoi ID", "Nhom Cau Hoi ID",
            "Group ID", "group_id", "GroupId", "groupId", "Category ID", "category_id"
        ],
        required: true,
        type: "number",
        description: "ID của nhóm câu hỏi (bắt buộc)",
    },
    {
        dbField: "cau_hoi",
        excelNames: [
            "Câu hỏi", "Câu Hỏi", "Cau hoi", "Cau Hoi",
            "Câu_hỏi", "Câu_Hỏi", "Cau_hoi", "Cau_Hoi",
            "Question", "question", "Q", "q", "Nội dung", "Noi dung"
        ],
        required: true,
        type: "text",
        description: "Nội dung câu hỏi (bắt buộc)",
    },
    {
        dbField: "hinh_anh",
        excelNames: [
            "Hình ảnh", "Hình Ảnh", "Hinh anh", "Hinh Anh",
            "Hình_ảnh", "Hình_Ảnh", "Hinh_anh", "Hinh_Anh",
            "Image", "image", "Img", "img", "Picture", "picture", "URL", "url"
        ],
        required: false,
        type: "text",
        description: "URL hình ảnh (không bắt buộc)",
    },
    {
        dbField: "dap_an_1",
        excelNames: [
            "Đáp án 1", "Đáp Án 1", "Dap an 1", "Dap An 1",
            "Đáp_án_1", "Đáp_Án_1", "Dap_an_1", "Dap_An_1",
            "Answer 1", "answer_1", "Answer1", "answer1", "Option 1", "option_1"
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
            "Answer 2", "answer_2", "Answer2", "answer2", "Option 2", "option_2"
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
            "Answer 3", "answer_3", "Answer3", "answer3", "Option 3", "option_3"
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
            "Answer 4", "answer_4", "Answer4", "answer4", "Option 4", "option_4"
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
            "Correct Answer", "correct_answer", "CorrectAnswer", "correctAnswer",
            "Right Answer", "right_answer", "Answer", "answer"
        ],
        required: true,
        type: "number",
        description: "Số thứ tự đáp án đúng (1, 2, 3 hoặc 4) (bắt buộc)",
    },
    {
        dbField: "chuc_vu_ap_dung",
        excelNames: [
            "Chức vụ áp dụng", "Chức Vụ Áp Dụng", "Chuc vu ap dung", "Chuc Vu Ap Dung",
            "Chức_vụ_áp_dụng", "Chức_Vụ_Áp_Dụng", "Chuc_vu_ap_dung", "Chuc_Vu_Ap_Dung",
            "Position", "position", "Positions", "positions", "Roles", "roles"
        ],
        required: false,
        type: "text",
        description: "Danh sách ID chức vụ áp dụng, phân cách bằng dấu phẩy",
    },
]

// Validate a single row
function validateRow(
    row: Record<string, any>
): string[] {
    const errors: string[] = []

    // Required fields
    if (!row.ngay_dang || String(row.ngay_dang).trim() === "") {
        errors.push("Ngày đăng là bắt buộc")
    }

    if (!row.nhom_cau_hoi) {
        errors.push("Nhóm câu hỏi (ID) là bắt buộc")
    } else {
        const nhomId = Number(row.nhom_cau_hoi)
        if (isNaN(nhomId) || nhomId <= 0) {
            errors.push("Nhóm câu hỏi phải là số nguyên dương")
        }
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

    if (!row.dap_an_dung) {
        errors.push("Đáp án đúng là bắt buộc")
    } else {
        const dapAnDung = Number(row.dap_an_dung)
        if (isNaN(dapAnDung) || dapAnDung < 1 || dapAnDung > 4) {
            errors.push("Đáp án đúng phải là số từ 1 đến 4")
        }
    }

    // Validate chuc_vu_ap_dung if provided
    if (row.chuc_vu_ap_dung && String(row.chuc_vu_ap_dung).trim() !== "") {
        const ids = String(row.chuc_vu_ap_dung).split(',').map(id => id.trim())
        for (const id of ids) {
            const numId = Number(id)
            if (isNaN(numId) || numId <= 0) {
                errors.push(`Chức vụ áp dụng: "${id}" không hợp lệ (phải là số nguyên dương)`)
                break
            }
        }
    }

    return errors
}

// Check for duplicates within the import data (ngay_dang + cau_hoi)
function checkDuplicates(
    rows: Array<{ rowNumber: number; data: Record<string, any> }>
): Map<string, number[]> {
    const duplicates = new Map<string, number[]>()

    rows.forEach((row, index) => {
        const ngayDang = row.data.ngay_dang
        const cauHoi = row.data.cau_hoi

        if (ngayDang && cauHoi) {
            const key = `${ngayDang}|${String(cauHoi).trim().toLowerCase()}`
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

// Transform row data before saving
function transformRow(row: Record<string, any>): Partial<LichDang> {
    const transformed: Partial<LichDang> = {}

    // Required fields
    if (row.ngay_dang) {
        transformed.ngay_dang = String(row.ngay_dang).trim()
    }

    if (row.nhom_cau_hoi) {
        transformed.nhom_cau_hoi = Number(row.nhom_cau_hoi)
    }

    if (row.cau_hoi) {
        transformed.cau_hoi = String(row.cau_hoi).trim()
    }

    // Optional fields
    if (row.hinh_anh && !shouldSkipValue(row.hinh_anh)) {
        transformed.hinh_anh = String(row.hinh_anh).trim() || null
    } else {
        transformed.hinh_anh = null
    }

    // Required answer fields
    if (row.dap_an_1) {
        transformed.dap_an_1 = String(row.dap_an_1).trim()
    }
    if (row.dap_an_2) {
        transformed.dap_an_2 = String(row.dap_an_2).trim()
    }
    if (row.dap_an_3) {
        transformed.dap_an_3 = String(row.dap_an_3).trim()
    }
    if (row.dap_an_4) {
        transformed.dap_an_4 = String(row.dap_an_4).trim()
    }

    // Correct answer (must be 1-4)
    if (row.dap_an_dung) {
        transformed.dap_an_dung = Number(row.dap_an_dung)
    }

    // Chức vụ áp dụng (comma-separated IDs)
    if (row.chuc_vu_ap_dung && !shouldSkipValue(row.chuc_vu_ap_dung)) {
        const ids = String(row.chuc_vu_ap_dung)
            .split(',')
            .map(id => Number(id.trim()))
            .filter(id => !isNaN(id) && id > 0)
        transformed.chuc_vu_ap_dung = ids.length > 0 ? ids : null
    } else {
        transformed.chuc_vu_ap_dung = null
    }

    return transformed
}

// Transform Excel data to database format
function transformData(rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<LichDang>[] {
    return rows.map((row) => transformRow(row.data))
}

const importOptions: ImportOptions = {
    skipEmptyCells: true,
    upsertMode: 'update',
    dateFormat: 'dd/mm/yyyy',
}

export function LichDangImportDialog({ open, onOpenChange, mutation }: LichDangImportDialogProps) {
    const batchUpsertMutation = mutation || useBatchUpsertLichDang()

    const handleImport = async (rows: Partial<LichDang>[]): Promise<{
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
                    rowNumber: err.row + 1, // Convert 0-based to 1-based for better UX
                    errors: [err.error],
                })),
            }
        } catch (error) {
            throw error
        }
    }

    return (
        <ImportDialog<Partial<LichDang>>
            open={open}
            onOpenChange={onOpenChange}
            onImport={handleImport}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={transformData}
            moduleName="Lịch Đăng"
            templateColumns={templateColumns}
            columnMappings={columnMappings}
            enableAutoMapping={true}
            importOptions={importOptions}
        />
    )
}

