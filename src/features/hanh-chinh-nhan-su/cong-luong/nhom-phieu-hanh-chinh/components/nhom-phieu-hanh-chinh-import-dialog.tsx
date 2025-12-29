"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertNhomPhieuHanhChinh } from "../actions/nhom-phieu-hanh-chinh-excel-actions"
import { NhomPhieuHanhChinh } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertNhomPhieuHanhChinhReturn = ReturnType<typeof useBatchUpsertNhomPhieuHanhChinh>

interface NhomPhieuHanhChinhImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertNhomPhieuHanhChinhReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "loai_phieu",
        excelNames: [
            "Loại phiếu", "Loại Phiếu", "Loai phieu", "Loai Phieu",
            "Loại_P", "Loại_p", "Loai_P", "Loai_p",
            "Type", "type", "Category", "category"
        ],
        required: true,
        type: "text",
        description: "Loại phiếu (bắt buộc)",
    },
    {
        dbField: "ma_nhom_phieu",
        excelNames: [
            "Mã nhóm phiếu", "Mã Nhóm Phiếu", "Ma nhom phieu", "Ma Nhom Phieu",
            "Mã_NP", "Mã_np", "Ma_NP", "Ma_np",
            "Group Code", "GroupCode", "group_code", "Code", "code"
        ],
        required: true,
        type: "text",
        description: "Mã nhóm phiếu (bắt buộc)",
    },
    {
        dbField: "ten_nhom_phieu",
        excelNames: [
            "Tên nhóm phiếu", "Tên Nhóm Phiếu", "Ten nhom phieu", "Ten Nhom Phieu",
            "Tên_NP", "Tên_np", "Ten_NP", "Ten_np",
            "Group Name", "GroupName", "group_name", "Name", "name"
        ],
        required: true,
        type: "text",
        description: "Tên nhóm phiếu (bắt buộc)",
    },
    {
        dbField: "so_luong_cho_phep_thang",
        excelNames: [
            "Số lượng cho phép tháng", "Số Lượng Cho Phép Tháng", 
            "So luong cho phep thang", "So Luong Cho Phep Thang",
            "Số_lượng", "Số lượng", "So_luong", "So luong",
            "Quantity", "quantity", "Qty", "qty", "Amount", "amount"
        ],
        required: true,
        type: "number",
        description: "Số lượng cho phép tháng (bắt buộc, số nguyên không âm)",
    },
    {
        dbField: "can_hcns_duyet",
        excelNames: [
            "Cần HCNS duyệt", "Cần HCNS Duyệt", "Can HCNS duyet", "Can HCNS Duyet",
            "Cần_duyệt", "Cần duyệt", "Can_duyet", "Can duyet",
            "Need Approval", "need_approval", "Approval", "approval"
        ],
        required: false,
        type: "text",
        description: "Cần HCNS duyệt (Có/Không, mặc định: Không)",
    },
    {
        dbField: "ca_toi",
        excelNames: [
            "Ca tối", "Ca Tối", "ca toi", "Ca Toi",
            "Night Shift", "night_shift", "Night", "night"
        ],
        required: false,
        type: "text",
        description: "Ca tối (Có/Không, có thể để trống)",
    },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
    {
        header: "Loại phiếu",
        type: "text",
        required: true,
        description: "Loại phiếu (bắt buộc, ví dụ: Vân tay, Đi muộn về sớm)",
    },
    {
        header: "Mã nhóm phiếu",
        type: "text",
        required: true,
        description: "Mã nhóm phiếu (bắt buộc)",
    },
    {
        header: "Tên nhóm phiếu",
        type: "text",
        required: true,
        description: "Tên nhóm phiếu (bắt buộc)",
    },
    {
        header: "Số lượng cho phép tháng",
        type: "number",
        required: true,
        description: "Số lượng cho phép tháng (bắt buộc, số nguyên không âm)",
    },
    {
        header: "Cần HCNS duyệt",
        type: "text",
        required: false,
        description: "Cần HCNS duyệt (Có/Không, mặc định: Không)",
    },
    {
        header: "Ca tối",
        type: "text",
        required: false,
        description: "Ca tối (Có/Không, có thể để trống)",
    },
]

// Validate a single row
function validateRow(
    row: Record<string, any>
): string[] {
    const errors: string[] = []

    // Required fields
    if (!row.loai_phieu || String(row.loai_phieu).trim() === "") {
        errors.push("Loại phiếu là bắt buộc")
    }

    if (!row.ma_nhom_phieu || String(row.ma_nhom_phieu).trim() === "") {
        errors.push("Mã nhóm phiếu là bắt buộc")
    }

    if (!row.ten_nhom_phieu || String(row.ten_nhom_phieu).trim() === "") {
        errors.push("Tên nhóm phiếu là bắt buộc")
    }

    if (row.so_luong_cho_phep_thang === undefined || row.so_luong_cho_phep_thang === null) {
        errors.push("Số lượng cho phép tháng là bắt buộc")
    } else {
        const soLuong = Number(row.so_luong_cho_phep_thang)
        if (isNaN(soLuong) || soLuong < 0 || !Number.isInteger(soLuong)) {
            errors.push("Số lượng cho phép tháng phải là số nguyên không âm")
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
        const maNhomPhieu = row.data.ma_nhom_phieu

        if (maNhomPhieu) {
            const key = String(maNhomPhieu).trim()
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
): Partial<NhomPhieuHanhChinh>[] {
    return rows.map((row) => {
        const mapped: Partial<NhomPhieuHanhChinh> = {}

        // Map required fields
        if (!shouldSkipValue(row.data["loai_phieu"], options.skipEmptyCells)) {
            mapped.loai_phieu = String(row.data["loai_phieu"]).trim()
        }

        if (!shouldSkipValue(row.data["ma_nhom_phieu"], options.skipEmptyCells)) {
            mapped.ma_nhom_phieu = String(row.data["ma_nhom_phieu"]).trim()
        }

        if (!shouldSkipValue(row.data["ten_nhom_phieu"], options.skipEmptyCells)) {
            mapped.ten_nhom_phieu = String(row.data["ten_nhom_phieu"]).trim()
        }

        if (!shouldSkipValue(row.data["so_luong_cho_phep_thang"], options.skipEmptyCells)) {
            mapped.so_luong_cho_phep_thang = Number(row.data["so_luong_cho_phep_thang"])
        }

        // Map boolean fields
        // Convert can_hcns_duyet to "Có"/"Không"
        if (row.data["can_hcns_duyet"] !== undefined && row.data["can_hcns_duyet"] !== null) {
            const value = row.data["can_hcns_duyet"]
            if (value === "Có" || value === "Không") {
                mapped.can_hcns_duyet = value
            } else {
                mapped.can_hcns_duyet = (value === true || value === "true" || value === "1" || value === 1) ? "Có" : "Không"
            }
        }

        // Convert ca_toi to "Có"/"Không" or null
        if (row.data["ca_toi"] !== undefined && row.data["ca_toi"] !== null && row.data["ca_toi"] !== "") {
            const value = row.data["ca_toi"]
            if (value === "Có" || value === "Không") {
                mapped.ca_toi = value
            } else {
                mapped.ca_toi = (value === true || value === "true" || value === "1" || value === 1) ? "Có" : "Không"
            }
        } else {
            mapped.ca_toi = null
        }

        return mapped
    })
}

export function NhomPhieuHanhChinhImportDialog({ open, onOpenChange, mutation }: NhomPhieuHanhChinhImportDialogProps) {
    const defaultMutation = useBatchUpsertNhomPhieuHanhChinh()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update', // Update mode: update if exists, insert if not
    })

    const handleImport = async (rows: Partial<NhomPhieuHanhChinh>[]): Promise<{
        success: boolean
        inserted: number
        updated: number
        failed: number
        errors?: Array<{ rowNumber: number; errors: string[] }>
    }> => {
        try {
            // Convert rows to ExcelRow format for mutation
            const excelRows = rows.map((row) => ({
                loai_phieu: row.loai_phieu,
                ma_nhom_phieu: row.ma_nhom_phieu,
                ten_nhom_phieu: row.ten_nhom_phieu,
                so_luong_cho_phep_thang: row.so_luong_cho_phep_thang,
                can_hcns_duyet: row.can_hcns_duyet,
                ca_toi: row.ca_toi,
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
    const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<NhomPhieuHanhChinh>[] => {
        return mapExcelToDb(rows, importOptions)
    }

    return (
        <ImportDialog<Partial<NhomPhieuHanhChinh>>
            open={open}
            onOpenChange={onOpenChange}
            onImport={handleImport}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={transformData}
            moduleName="nhóm phiếu hành chính"
            
            templateColumns={templateColumns}
            columnMappings={columnMappings}
            enableAutoMapping={true}
            importOptions={importOptions}
            
        />
    )
}

