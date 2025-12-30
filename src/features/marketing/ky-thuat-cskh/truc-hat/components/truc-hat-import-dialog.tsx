"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertTrucHat } from "../actions/truc-hat-excel-actions"
import { TrucHat } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertTrucHatReturn = ReturnType<typeof useBatchUpsertTrucHat>

interface TrucHatImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertTrucHatReturn
}

const columnMappings: ColumnMapping[] = [
    {
        dbField: "ma_truc",
        excelNames: [
            "Mã trục", "Mã Trục", "Ma truc", "Ma Truc",
            "Mã_trục", "Ma_truc",
            "Code", "code", "ID", "id"
        ],
        required: false,
        type: "number",
        description: "Mã trục",
    },
    {
        dbField: "khach_hang",
        excelNames: [
            "Khách hàng", "Khách Hàng", "Khach hang", "Khach Hang",
            "Khách_hàng", "Khach_hang",
            "Customer", "customer", "Client", "client"
        ],
        required: false,
        type: "text",
        description: "Khách hàng",
    },
    {
        dbField: "nhan_vien_bh_id",
        excelNames: [
            "Mã nhân viên BH", "Mã Nhân Viên BH", "Ma nhan vien BH", "Ma Nhan Vien BH",
            "Mã_nhân_viên_BH", "Ma_nhan_vien_BH",
            "Sales Person ID", "sales person id", "SalesPersonId", "salesPersonId"
        ],
        required: false,
        type: "number",
        description: "Mã nhân viên bán hàng",
    },
    {
        dbField: "anh_ban_ve",
        excelNames: [
            "Ảnh bản vẽ", "Ảnh Bản Vẽ", "Anh ban ve", "Anh Ban Ve",
            "Ảnh_bản_vẽ", "Anh_ban_ve",
            "Image", "image", "Drawing", "drawing"
        ],
        required: false,
        type: "text",
        description: "Ảnh bản vẽ (URL)",
    },
    {
        dbField: "ghi_chu",
        excelNames: [
            "Ghi chú", "Ghi Chú", "Ghi chu", "Ghi Chu",
            "Ghi_chú", "Ghi_chu",
            "Note", "note", "Comment", "comment", "Remarks", "remarks"
        ],
        required: false,
        type: "text",
        description: "Ghi chú",
    },
    {
        dbField: "trang_thai",
        excelNames: [
            "Trạng thái", "Trạng Thái", "Trang thai", "Trang Thai",
            "Trạng_thái", "Trang_thai",
            "Status", "status", "State", "state"
        ],
        required: false,
        type: "text",
        description: "Trạng thái (Mới, Đang xử lý, Hoàn thành, Đã hủy)",
    },
]

const templateColumns: TemplateColumn[] = [
    { header: "Mã trục", type: "number" },
    { header: "Khách hàng", type: "text" },
    { header: "Mã nhân viên BH", type: "number" },
    { header: "Ảnh bản vẽ", type: "text" },
    { header: "Ghi chú", type: "text" },
    { header: "Trạng thái", type: "text" },
]

function validateRow(
    _row: Record<string, any>
): string[] {
    const errors: string[] = []
    return errors
}

function checkDuplicates(
    rows: Array<{ rowNumber: number; data: Record<string, any> }>
): Map<string, number[]> {
    const duplicates = new Map<string, number[]>()
    const keyMap = new Map<string, number[]>()

    rows.forEach((row, index) => {
        const maTruc = row.data.ma_truc

        if (maTruc) {
            const key = String(maTruc).trim()
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

function mapExcelToDb(
    rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>,
    options: ImportOptions
): Partial<TrucHat>[] {
    return rows.map((row) => {
        const mapped: Partial<TrucHat> = {}

        Object.keys(row.data).forEach((key) => {
            const value = row.data[key]
            if (!shouldSkipValue(value, options.skipEmptyCells)) {
                if (key === "ma_truc" || key === "nhan_vien_bh_id") {
                    mapped[key as keyof TrucHat] = Number(value) as any
                } else {
                    mapped[key as keyof TrucHat] = String(value).trim() as any
                }
            }
        })

        return mapped
    })
}

export function TrucHatImportDialog({
    open,
    onOpenChange,
    mutation,
}: TrucHatImportDialogProps) {
    const defaultMutation = useBatchUpsertTrucHat()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update',
    })

    const handleImport = async (rows: Partial<TrucHat>[]): Promise<{
        success: boolean
        inserted: number
        updated: number
        failed: number
        errors?: Array<{ rowNumber: number; errors: string[] }>
    }> => {
        try {
            const excelRows = rows.map((row) => row as any)
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

    const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<TrucHat>[] => {
        return mapExcelToDb(rows, importOptions)
    }

    return (
        <ImportDialog<Partial<TrucHat>>
            open={open}
            onOpenChange={onOpenChange}
            onImport={handleImport}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={transformData}
            moduleName="trục hạt"
            templateColumns={templateColumns}
            columnMappings={columnMappings}
            enableAutoMapping={true}
            importOptions={importOptions}
        />
    )
}

