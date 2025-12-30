"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertDanhMucTaiLieu } from "../actions/danh-muc-tai-lieu-excel-actions"
import { DanhMucTaiLieu } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertDanhMucTaiLieuReturn = ReturnType<typeof useBatchUpsertDanhMucTaiLieu>

interface DanhMucTaiLieuImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertDanhMucTaiLieuReturn
}

// Template columns for export
const templateColumns: TemplateColumn[] = [
    {
        header: "Hạng mục",
        type: "text",
        required: true,
        description: "Hạng mục tài liệu (bắt buộc): Biểu mẫu & Kế hoạch hoặc Văn bản hệ thống",
    },
    {
        header: "Loại ID",
        type: "number",
        required: true,
        description: "ID loại tài liệu (bắt buộc)",
    },
    {
        header: "Loại tài liệu",
        type: "text",
        required: false,
        description: "Loại tài liệu (không bắt buộc)",
    },
    {
        header: "Cấp",
        type: "number",
        required: true,
        description: "Cấp danh mục (bắt buộc: 1 hoặc 2)",
    },
    {
        header: "Danh mục cha ID",
        type: "number",
        required: false,
        description: "ID danh mục cha (tùy chọn - nếu có sẽ tự động tính cấp = 2)",
    },
    {
        header: "Tên danh mục",
        type: "text",
        required: false,
        description: "Tên danh mục (không bắt buộc)",
    },
    {
        header: "Mô tả",
        type: "text",
        required: false,
        description: "Mô tả danh mục (không bắt buộc)",
    },
]

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "hang_muc",
        excelNames: [
            "Hạng mục", "Hạng Mục", "Hang muc", "Hang Muc",
            "Hạng_mục", "Hạng_Mục", "Hang_muc", "Hang_Muc",
            "Category", "category", "Cat", "cat"
        ],
        required: true,
        type: "text",
        description: "Hạng mục tài liệu (bắt buộc): Biểu mẫu & Kế hoạch hoặc Văn bản hệ thống",
    },
    {
        dbField: "loai_id",
        excelNames: [
            "Loại ID", "Loai ID", "Loại_ID", "Loai_ID",
            "Type ID", "type_id", "TypeId", "typeId"
        ],
        required: true,
        type: "number",
        description: "ID loại tài liệu (bắt buộc)",
    },
    {
        dbField: "loai_tai_lieu",
        excelNames: [
            "Loại tài liệu", "Loai tai lieu", "Loại_tài_liệu", "Loai_tai_lieu",
            "Type", "type", "Kind", "kind"
        ],
        required: false,
        type: "text",
        description: "Loại tài liệu (không bắt buộc)",
    },
    {
        dbField: "cap",
        excelNames: [
            "Cấp", "Cap",
            "Level", "level", "Rank", "rank"
        ],
        required: true,
        type: "number",
        description: "Cấp danh mục (bắt buộc: 1 hoặc 2)",
    },
    {
        dbField: "danh_muc_cha_id",
        excelNames: [
            "Danh mục cha ID", "Danh muc cha ID", "Danh_mục_cha_ID", "Danh_muc_cha_ID",
            "Parent ID", "parent_id", "ParentId", "parentId"
        ],
        required: false,
        type: "number",
        description: "ID danh mục cha (tùy chọn - nếu có sẽ tự động tính cấp = 2)",
    },
    {
        dbField: "ten_danh_muc",
        excelNames: [
            "Tên danh mục", "Ten danh muc", "Tên_danh_mục", "Ten_danh_muc",
            "Name", "name", "Title", "title"
        ],
        required: false,
        type: "text",
        description: "Tên danh mục (không bắt buộc)",
    },
    {
        dbField: "mo_ta",
        excelNames: [
            "Mô tả", "Mô Tả", "Mo ta", "Mo Ta",
            "Mô_tả", "Mô_Tả", "Mo_ta", "Mo_Ta",
            "Description", "description", "Desc", "desc", "Note", "note"
        ],
        required: false,
        type: "text",
        description: "Mô tả danh mục (không bắt buộc)",
    },
]

// Validate a single row
function validateRow(
    row: Record<string, any>
): string[] {
    const errors: string[] = []

    // Required fields
    if (!row.hang_muc || String(row.hang_muc).trim() === "") {
        errors.push("Hạng mục là bắt buộc")
    } else {
        const hangMuc = String(row.hang_muc).trim()
        if (hangMuc !== "Biểu mẫu & Kế hoạch" && hangMuc !== "Văn bản hệ thống") {
            errors.push("Hạng mục phải là 'Biểu mẫu & Kế hoạch' hoặc 'Văn bản hệ thống'")
        }
    }

    // Loại ID bắt buộc
    if (!row.loai_id || isNaN(Number(row.loai_id))) {
        errors.push("Loại ID là bắt buộc và phải là số")
    }

    // Cấp bắt buộc và phải là 1 hoặc 2
    const cap = row.cap ? Number(row.cap) : null
    if (cap === null || isNaN(cap)) {
        errors.push("Cấp là bắt buộc")
    } else if (cap !== 1 && cap !== 2) {
        errors.push("Cấp chỉ có thể là 1 hoặc 2")
    }

    // Nếu có danh_muc_cha_id thì cap phải là 2
    if (row.danh_muc_cha_id && cap !== 2) {
        errors.push("Nếu có danh mục cha thì cấp phải là 2")
    }

    // Nếu không có danh_muc_cha_id thì cap phải là 1
    if (!row.danh_muc_cha_id && cap !== 1) {
        errors.push("Nếu không có danh mục cha thì cấp phải là 1")
    }

    return errors
}

// Check for duplicates within the import data (using hang_muc + ten_danh_muc combination)
function checkDuplicates(
    rows: Array<{ rowNumber: number; data: Record<string, any> }>
): Map<string, number[]> {
    const duplicates = new Map<string, number[]>()

    rows.forEach((row, index) => {
        const hangMuc = row.data.hang_muc || ""
        const tenDanhMuc = row.data.ten_danh_muc || ""
        const key = `${String(hangMuc).trim().toLowerCase()}_${String(tenDanhMuc).trim().toLowerCase()}`

        if (key !== "_") { // Only check if at least one field has value
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
): Partial<DanhMucTaiLieu>[] {
    return rows.map((row) => {
        const mapped: Partial<DanhMucTaiLieu> = {}

        // Map required fields
        if (row.data["hang_muc"] !== undefined && row.data["hang_muc"] !== null && row.data["hang_muc"] !== "") {
            mapped.hang_muc = String(row.data["hang_muc"]).trim()
        }

        // Map required field loai_id
        if (row.data["loai_id"]) {
            const loaiId = Number(row.data["loai_id"])
            if (!isNaN(loaiId)) {
                mapped.loai_id = loaiId
            }
        }

        if (!shouldSkipValue(row.data["loai_tai_lieu"], options.skipEmptyCells)) {
            mapped.loai_tai_lieu = String(row.data["loai_tai_lieu"]).trim()
        }

        // Map required field cap
        if (row.data["cap"]) {
            const cap = Number(row.data["cap"])
            if (!isNaN(cap)) {
                mapped.cap = cap
            }
        }

        // Map optional field danh_muc_cha_id
        if (!shouldSkipValue(row.data["danh_muc_cha_id"], options.skipEmptyCells)) {
            const danhMucChaId = Number(row.data["danh_muc_cha_id"])
            if (!isNaN(danhMucChaId)) {
                mapped.danh_muc_cha_id = danhMucChaId
            }
        }

        if (!shouldSkipValue(row.data["ten_danh_muc"], options.skipEmptyCells)) {
            mapped.ten_danh_muc = String(row.data["ten_danh_muc"]).trim()
        }

        if (!shouldSkipValue(row.data["mo_ta"], options.skipEmptyCells)) {
            mapped.mo_ta = String(row.data["mo_ta"]).trim()
        }

        return mapped
    })
}

export function DanhMucTaiLieuImportDialog({ open, onOpenChange, mutation }: DanhMucTaiLieuImportDialogProps) {
    const defaultMutation = useBatchUpsertDanhMucTaiLieu()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update', // Update mode: update if exists (hang_muc + ten_danh_muc), insert if not
    })

    const handleImport = async (rows: Partial<DanhMucTaiLieu>[]): Promise<{
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
    const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<DanhMucTaiLieu>[] => {
        return mapExcelToDb(rows, importOptions)
    }

    return (
        <ImportDialog<Partial<DanhMucTaiLieu>>
            open={open}
            onOpenChange={onOpenChange}
            onImport={handleImport}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={transformData}
            moduleName="danh mục tài liệu"
            templateColumns={templateColumns}
            columnMappings={columnMappings}
            enableAutoMapping={true}
            importOptions={importOptions}
        />
    )
}

