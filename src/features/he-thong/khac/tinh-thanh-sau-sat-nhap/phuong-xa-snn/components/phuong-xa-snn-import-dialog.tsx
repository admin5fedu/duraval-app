"use client"

import { ImportDialog } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertPhuongXaSNN } from "../actions/phuong-xa-snn-excel-actions"
import { PhuongXaSNN } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertPhuongXaSNNReturn = ReturnType<typeof useBatchUpsertPhuongXaSNN>

interface PhuongXaSNNImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertPhuongXaSNNReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "ma_tinh_thanh",
        excelNames: [
            "Mã tỉnh thành", "Mã Tỉnh Thành", "Ma tinh thanh", "Ma Tinh Thanh",
            "Mã_tỉnh_thành", "Mã_Tỉnh_Thành", "Ma_tinh_thanh", "Ma_Tinh_Thanh",
            "Mã TT", "Ma TT", "Tỉnh thành", "Tinh thanh"
        ],
        required: true,
        type: "text",
        description: "Mã tỉnh thành (bắt buộc)",
    },
    {
        dbField: "ma_phuong_xa",
        excelNames: [
            "Mã phường xã", "Mã Phường Xã", "Ma phuong xa", "Ma Phuong Xa",
            "Mã_phường_xã", "Mã_Phường_Xã", "Ma_phuong_xa", "Ma_Phuong_Xa",
            "Mã", "Ma", "Code", "code"
        ],
        required: true,
        type: "text",
        description: "Mã phường xã (bắt buộc)",
    },
    {
        dbField: "ten_phuong_xa",
        excelNames: [
            "Tên phường xã", "Tên Phường Xã", "Ten phuong xa", "Ten Phuong Xa",
            "Tên_phường_xã", "Tên_Phường_Xã", "Ten_phuong_xa", "Ten_Phuong_Xa",
            "Tên", "Ten", "Name", "name", "Phường xã", "Phuong xa"
        ],
        required: true,
        type: "text",
        description: "Tên phường xã (bắt buộc)",
    },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
    {
        header: "Mã tỉnh thành",
        type: "text",
        required: true,
        description: "Mã tỉnh thành (bắt buộc)",
    },
    {
        header: "Mã phường xã",
        type: "text",
        required: true,
        description: "Mã phường xã (bắt buộc)",
    },
    {
        header: "Tên phường xã",
        type: "text",
        required: true,
        description: "Tên phường xã (bắt buộc)",
    },
]

// Validate a single row
function validateRow(
    row: Record<string, any>,
    _rowNumber: number
): string[] {
    const errors: string[] = []

    if (shouldSkipValue(row.ma_tinh_thanh)) {
        errors.push("Mã tỉnh thành là bắt buộc")
    }

    if (shouldSkipValue(row.ma_phuong_xa)) {
        errors.push("Mã phường xã là bắt buộc")
    }

    if (shouldSkipValue(row.ten_phuong_xa)) {
        errors.push("Tên phường xã là bắt buộc")
    }

    return errors
}

// Transform Excel data to database format
function transformData(
    rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>
): Partial<PhuongXaSNN>[] {
    return rows.map((row) => {
        const record: Partial<PhuongXaSNN> = {
            ma_tinh_thanh: row.data.ma_tinh_thanh ? String(row.data.ma_tinh_thanh).trim() : undefined,
            ma_phuong_xa: row.data.ma_phuong_xa ? String(row.data.ma_phuong_xa).trim() : undefined,
            ten_phuong_xa: row.data.ten_phuong_xa ? String(row.data.ten_phuong_xa).trim() : undefined,
        }

        return record
    })
}

export function PhuongXaSNNImportDialog({
    open,
    onOpenChange,
    mutation: providedMutation,
}: PhuongXaSNNImportDialogProps) {
    const defaultMutation = useBatchUpsertPhuongXaSNN()
    const mutation = providedMutation || defaultMutation

    const handleImport = async (rows: Partial<PhuongXaSNN>[]) => {
        try {
            const result = await mutation.mutateAsync(rows)
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
            moduleName="phường xã SNN"
            columnMappings={columnMappings}
            templateColumns={templateColumns}
            validateRow={validateRow}
            transformData={transformData}
            onImport={handleImport}
        />
    )
}

