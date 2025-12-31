"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertTaiLieuBieuMau } from "../actions/tai-lieu-bieu-mau-excel-actions"
import { TaiLieuBieuMau } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertTaiLieuBieuMauReturn = ReturnType<typeof useBatchUpsertTaiLieuBieuMau>

interface TaiLieuBieuMauImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertTaiLieuBieuMauReturn
}

// Template columns for export
const templateColumns: TemplateColumn[] = [
    {
        header: "Hạng mục",
        type: "text",
        required: false,
        description: "Hạng mục tài liệu (tùy chọn): Biểu mẫu & Kế hoạch hoặc Văn bản hệ thống",
    },
    {
        header: "Loại ID",
        type: "number",
        required: false,
        description: "ID loại tài liệu (tùy chọn)",
    },
    {
        header: "Danh mục ID",
        type: "number",
        required: false,
        description: "ID danh mục tài liệu (tùy chọn)",
    },
    {
        header: "Mã tài liệu",
        type: "text",
        required: false,
        description: "Mã tài liệu (tùy chọn)",
    },
    {
        header: "Tên tài liệu",
        type: "text",
        required: true,
        description: "Tên tài liệu (bắt buộc)",
    },
    {
        header: "Mô tả",
        type: "text",
        required: false,
        description: "Mô tả tài liệu (tùy chọn)",
    },
    {
        header: "Link dự thảo",
        type: "text",
        required: false,
        description: "Link dự thảo (tùy chọn, phải là URL hợp lệ)",
    },
    {
        header: "Link áp dụng",
        type: "text",
        required: false,
        description: "Link áp dụng (tùy chọn, phải là URL hợp lệ)",
    },
    {
        header: "Trạng thái",
        type: "text",
        required: false,
        description: "Trạng thái tài liệu (tùy chọn)",
    },
    {
        header: "Ghi chú",
        type: "text",
        required: false,
        description: "Ghi chú (tùy chọn)",
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
        required: false,
        type: "text",
        description: "Hạng mục tài liệu (tùy chọn): Biểu mẫu & Kế hoạch hoặc Văn bản hệ thống",
    },
    {
        dbField: "loai_id",
        excelNames: [
            "Loại ID", "Loai ID", "Loại_ID", "Loai_ID",
            "Type ID", "type_id", "TypeId", "typeId"
        ],
        required: false,
        type: "number",
        description: "ID loại tài liệu (tùy chọn)",
    },
    {
        dbField: "danh_muc_id",
        excelNames: [
            "Danh mục ID", "Danh muc ID", "Danh_mục_ID", "Danh_muc_ID",
            "Category ID", "category_id", "CategoryId", "categoryId"
        ],
        required: false,
        type: "number",
        description: "ID danh mục tài liệu (tùy chọn)",
    },
    {
        dbField: "ma_tai_lieu",
        excelNames: [
            "Mã tài liệu", "Ma tai lieu", "Mã_tài_liệu", "Ma_tai_lieu",
            "Document Code", "document_code", "DocumentCode", "documentCode", "Code", "code"
        ],
        required: false,
        type: "text",
        description: "Mã tài liệu (tùy chọn)",
    },
    {
        dbField: "ten_tai_lieu",
        excelNames: [
            "Tên tài liệu", "Ten tai lieu", "Tên_tài_liệu", "Ten_tai_lieu",
            "Document Name", "document_name", "DocumentName", "documentName", "Name", "name", "Title", "title"
        ],
        required: true,
        type: "text",
        description: "Tên tài liệu (bắt buộc)",
    },
    {
        dbField: "mo_ta",
        excelNames: [
            "Mô tả", "Mo ta", "Mô_tả", "Mo_ta",
            "Description", "description", "Desc", "desc"
        ],
        required: false,
        type: "text",
        description: "Mô tả tài liệu (tùy chọn)",
    },
    {
        dbField: "link_du_thao",
        excelNames: [
            "Link dự thảo", "Link du thao", "Link_dự_thảo", "Link_du_thao",
            "Draft Link", "draft_link", "DraftLink", "draftLink"
        ],
        required: false,
        type: "text",
        description: "Link dự thảo (tùy chọn, phải là URL hợp lệ)",
    },
    {
        dbField: "link_ap_dung",
        excelNames: [
            "Link áp dụng", "Link ap dung", "Link_áp_dụng", "Link_ap_dung",
            "Applied Link", "applied_link", "AppliedLink", "appliedLink"
        ],
        required: false,
        type: "text",
        description: "Link áp dụng (tùy chọn, phải là URL hợp lệ)",
    },
    {
        dbField: "trang_thai",
        excelNames: [
            "Trạng thái", "Trang thai", "Trạng_thái", "Trang_thai",
            "Status", "status", "State", "state"
        ],
        required: false,
        type: "text",
        description: "Trạng thái tài liệu (tùy chọn)",
    },
    {
        dbField: "ghi_chu",
        excelNames: [
            "Ghi chú", "Ghi chu", "Ghi_chú", "Ghi_chu",
            "Note", "note", "Notes", "notes", "Description", "description", "Comment", "comment"
        ],
        required: false,
        type: "text",
        description: "Ghi chú (tùy chọn)",
    },
]

// Validate a single row
function validateRow(
    row: Record<string, any>
): string[] {
    const errors: string[] = []

    // Validate hang_muc if provided
    if (row.hang_muc && String(row.hang_muc).trim() !== "") {
        const hangMuc = String(row.hang_muc).trim()
        if (hangMuc !== "Biểu mẫu & Kế hoạch" && hangMuc !== "Văn bản hệ thống") {
            errors.push("Hạng mục phải là 'Biểu mẫu & Kế hoạch' hoặc 'Văn bản hệ thống'")
        }
    }

    // Validate loai_id if provided
    if (row.loai_id !== undefined && row.loai_id !== null && row.loai_id !== "") {
        const loaiId = Number(row.loai_id)
        if (isNaN(loaiId) || loaiId < 1) {
            errors.push("Loại ID phải là số nguyên dương")
        }
    }

    // Validate danh_muc_id if provided
    if (row.danh_muc_id !== undefined && row.danh_muc_id !== null && row.danh_muc_id !== "") {
        const danhMucId = Number(row.danh_muc_id)
        if (isNaN(danhMucId) || danhMucId < 1) {
            errors.push("Danh mục ID phải là số nguyên dương")
        }
    }


    // ten_tai_lieu is required
    const tenTaiLieu = row.ten_tai_lieu ? String(row.ten_tai_lieu).trim() : ""
    
    if (!tenTaiLieu) {
        errors.push("Tên tài liệu là bắt buộc")
    }

    // Validate URLs if provided
    if (row.link_du_thao && String(row.link_du_thao).trim() !== "") {
        try {
            new URL(String(row.link_du_thao).trim())
        } catch {
            errors.push("Link dự thảo phải là URL hợp lệ")
        }
    }

    if (row.link_ap_dung && String(row.link_ap_dung).trim() !== "") {
        try {
            new URL(String(row.link_ap_dung).trim())
        } catch {
            errors.push("Link áp dụng phải là URL hợp lệ")
        }
    }

    return errors
}

// Check for duplicates within the import data (using ma_tai_lieu or ten_tai_lieu)
function checkDuplicates(
    rows: Array<{ rowNumber: number; data: Record<string, any> }>
): Map<string, number[]> {
    const duplicates = new Map<string, number[]>()

    rows.forEach((row, index) => {
        // Use ten_tai_lieu for duplicate check (required field)
        const tenTaiLieu = row.data.ten_tai_lieu ? String(row.data.ten_tai_lieu).trim().toLowerCase() : ""
        const key = tenTaiLieu || ""

        if (key !== "") {
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
): Partial<TaiLieuBieuMau>[] {
    return rows.map((row) => {
        const mapped: Partial<TaiLieuBieuMau> = {}

        // Map optional fields
        if (!shouldSkipValue(row.data["hang_muc"], options.skipEmptyCells)) {
            mapped.hang_muc = String(row.data["hang_muc"]).trim() || undefined
        }

        if (row.data["loai_id"]) {
            const loaiId = Number(row.data["loai_id"])
            if (!isNaN(loaiId) && loaiId > 0) {
                mapped.loai_id = loaiId
            }
        }

        if (row.data["danh_muc_id"]) {
            const danhMucId = Number(row.data["danh_muc_id"])
            if (!isNaN(danhMucId) && danhMucId > 0) {
                mapped.danh_muc_id = danhMucId
            }
        }

        // ten_danh_muc và ten_loai sẽ được tự động fill từ danh_muc_id và loai_id trong excel actions

        if (!shouldSkipValue(row.data["ma_tai_lieu"], options.skipEmptyCells)) {
            mapped.ma_tai_lieu = String(row.data["ma_tai_lieu"]).trim() || null
        }

        // ten_tai_lieu is required
        const tenTaiLieu = row.data["ten_tai_lieu"]
        if (!tenTaiLieu || String(tenTaiLieu).trim() === "") {
            throw new Error("Tên tài liệu là bắt buộc")
        }
        mapped.ten_tai_lieu = String(tenTaiLieu).trim()

        if (!shouldSkipValue(row.data["mo_ta"], options.skipEmptyCells)) {
            mapped.mo_ta = String(row.data["mo_ta"]).trim() || null
        }

        if (!shouldSkipValue(row.data["link_du_thao"], options.skipEmptyCells)) {
            mapped.link_du_thao = String(row.data["link_du_thao"]).trim() || null
        }

        if (!shouldSkipValue(row.data["link_ap_dung"], options.skipEmptyCells)) {
            mapped.link_ap_dung = String(row.data["link_ap_dung"]).trim() || null
        }

        if (!shouldSkipValue(row.data["trang_thai"], options.skipEmptyCells)) {
            mapped.trang_thai = String(row.data["trang_thai"]).trim() || undefined
        }

        if (!shouldSkipValue(row.data["ghi_chu"], options.skipEmptyCells)) {
            mapped.ghi_chu = String(row.data["ghi_chu"]).trim() || null
        }

        return mapped
    })
}

export function TaiLieuBieuMauImportDialog({ open, onOpenChange, mutation }: TaiLieuBieuMauImportDialogProps) {
    const defaultMutation = useBatchUpsertTaiLieuBieuMau()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update', // Update mode: update if exists (ma_tai_lieu or ten_tai_lieu), insert if not
    })

    const handleImport = async (rows: Partial<TaiLieuBieuMau>[]): Promise<{
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
    const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<TaiLieuBieuMau>[] => {
        return mapExcelToDb(rows, importOptions)
    }

    return (
        <ImportDialog<Partial<TaiLieuBieuMau>>
            open={open}
            onOpenChange={onOpenChange}
            onImport={handleImport}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={transformData}
            moduleName="tài liệu & biểu mẫu"
            templateColumns={templateColumns}
            columnMappings={columnMappings}
            enableAutoMapping={true}
            importOptions={importOptions}
        />
    )
}

