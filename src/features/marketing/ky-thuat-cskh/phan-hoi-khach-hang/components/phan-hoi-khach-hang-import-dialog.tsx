"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertPhanHoiKhachHang } from "../actions/phan-hoi-khach-hang-excel-actions"
import { PhanHoiKhachHang } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertPhanHoiKhachHangReturn = ReturnType<typeof useBatchUpsertPhanHoiKhachHang>

interface PhanHoiKhachHangImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertPhanHoiKhachHangReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "ngay",
        excelNames: [
            "Ngày", "Ngay",
            "Ngày_", "Ngay_",
            "Date", "date"
        ],
        required: false,
        type: "date",
        description: "Ngày",
    },
    {
        dbField: "nhan_vien_id",
        excelNames: [
            "Mã nhân viên", "Mã Nhân Viên", "Ma nhan vien", "Ma Nhan Vien",
            "Mã_nhân_viên", "Ma_nhan_vien",
            "Employee ID", "employee id", "EmployeeId", "employeeId", "ID", "id"
        ],
        required: false,
        type: "number",
        description: "Mã nhân viên",
    },
    {
        dbField: "ten_nhan_vien",
        excelNames: [
            "Tên nhân viên", "Tên Nhân Viên", "Ten nhan vien", "Ten Nhan Vien",
            "Tên_nhân_viên", "Ten_nhan_vien",
            "Employee Name", "employee name", "EmployeeName", "employeeName"
        ],
        required: false,
        type: "text",
        description: "Tên nhân viên",
    },
    {
        dbField: "ma_san_pham",
        excelNames: [
            "Mã sản phẩm", "Mã Sản Phẩm", "Ma san pham", "Ma San Pham",
            "Mã_sản_phẩm", "Ma_san_pham",
            "Product Code", "product code", "ProductCode", "productCode"
        ],
        required: false,
        type: "text",
        description: "Mã sản phẩm",
    },
    {
        dbField: "ten_san_pham",
        excelNames: [
            "Tên sản phẩm", "Tên Sản Phẩm", "Ten san pham", "Ten San Pham",
            "Tên_sản_phẩm", "Ten_san_pham",
            "Product Name", "product name", "ProductName", "productName"
        ],
        required: false,
        type: "text",
        description: "Tên sản phẩm",
    },
    {
        dbField: "id_don_hang",
        excelNames: [
            "ID đơn hàng", "ID Đơn Hàng", "Id don hang", "Id Don Hang",
            "ID_đơn_hàng", "ID_don_hang",
            "Order ID", "order id", "OrderID", "orderId"
        ],
        required: false,
        type: "text",
        description: "ID đơn hàng",
    },
    {
        dbField: "sdt_khach",
        excelNames: [
            "SĐT khách", "SĐT Khách", "SDT khach", "SDT Khach",
            "SĐT_khách", "SDT_khach",
            "Customer Phone", "customer phone", "CustomerPhone", "customerPhone", "Phone", "phone"
        ],
        required: false,
        type: "text",
        description: "Số điện thoại khách hàng",
    },
    {
        dbField: "ngay_ban",
        excelNames: [
            "Ngày bán", "Ngày Bán", "Ngay ban", "Ngay Ban",
            "Ngày_bán", "Ngay_ban",
            "Sale Date", "sale date", "SaleDate", "saleDate", "Date", "date"
        ],
        required: false,
        type: "date",
        description: "Ngày bán",
    },
    {
        dbField: "loai",
        excelNames: [
            "Loại", "Loai",
            "Loại_", "Loai_",
            "Type", "type", "Category", "category"
        ],
        required: false,
        type: "text",
        description: "Loại (Chất lượng SP, Hỏng lỗi, Chăm sóc, Giao hàng, Bảo hành / Bảo trì, Giá cả, Hóa đơn, Khác)",
    },
    {
        dbField: "ten_loi",
        excelNames: [
            "Tên lỗi", "Tên Lỗi", "Ten loi", "Ten Loi",
            "Tên_lỗi", "Ten_loi",
            "Error Name", "error name", "ErrorName", "errorName"
        ],
        required: false,
        type: "text",
        description: "Tên lỗi",
    },
    {
        dbField: "mo_ta_loi",
        excelNames: [
            "Mô tả lỗi", "Mô Tả Lỗi", "Mo ta loi", "Mo Ta Loi",
            "Mô_tả_lỗi", "Mo_ta_loi",
            "Error Description", "error description", "ErrorDescription", "errorDescription"
        ],
        required: false,
        type: "text",
        description: "Mô tả lỗi",
    },
    {
        dbField: "muc_do",
        excelNames: [
            "Mức độ", "Mức Độ", "Muc do", "Muc Do",
            "Mức_độ", "Muc_do",
            "Severity", "severity", "Level", "level"
        ],
        required: false,
        type: "text",
        description: "Mức độ (Nghiêm trọng, Bình thường, Thấp)",
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

// Template columns for export
const templateColumns: TemplateColumn[] = [
    { header: "Ngày", type: "date" },
    { header: "Mã sản phẩm", type: "text" },
    { header: "Tên sản phẩm", type: "text" },
    { header: "ID đơn hàng", type: "text" },
    { header: "SĐT khách", type: "text" },
    { header: "Ngày bán", type: "date" },
    { header: "Loại", type: "text" },
    { header: "Trạng thái", type: "text" },
]

// Validate a single row
function validateRow(
    _row: Record<string, any>
): string[] {
    const errors: string[] = []
    // No required fields for phan hoi khach hang
    return errors
}

// Check for duplicates within the import data
function checkDuplicates(
    rows: Array<{ rowNumber: number; data: Record<string, any> }>
): Map<string, number[]> {
    const duplicates = new Map<string, number[]>()
    const keyMap = new Map<string, number[]>()

    rows.forEach((row, index) => {
        const idDonHang = row.data.id_don_hang

        if (idDonHang) {
            const key = String(idDonHang).trim()
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
): Partial<PhanHoiKhachHang>[] {
    return rows.map((row) => {
        const mapped: Partial<PhanHoiKhachHang> = {}

        // Map all fields
        Object.keys(row.data).forEach((key) => {
            const value = row.data[key]
            if (!shouldSkipValue(value, options.skipEmptyCells)) {
                if (key === "nhan_vien_id" || key === "phong_id" || key === "nhom_id" || key === "chi_phi") {
                    mapped[key as keyof PhanHoiKhachHang] = Number(value) as any
                } else if (key === "hinh_anh") {
                    // Parse hinh_anh array
                    const hinhAnhStr = String(value).trim()
                    if (hinhAnhStr) {
                        (mapped as any).hinh_anh = hinhAnhStr
                            .split(/[,\n]/)
                            .map((url: string) => url.trim())
                            .filter((url: string) => url.length > 0)
                    }
                } else {
                    mapped[key as keyof PhanHoiKhachHang] = String(value).trim() as any
                }
            }
        })

        return mapped
    })
}

export function PhanHoiKhachHangImportDialog({
    open,
    onOpenChange,
    mutation,
}: PhanHoiKhachHangImportDialogProps) {
    const defaultMutation = useBatchUpsertPhanHoiKhachHang()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update',
    })

    const handleImport = async (rows: Partial<PhanHoiKhachHang>[]): Promise<{
        success: boolean
        inserted: number
        updated: number
        failed: number
        errors?: Array<{ rowNumber: number; errors: string[] }>
    }> => {
        try {
            // Convert rows to ExcelRow format for mutation
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

    // Transform Excel data to database format
    const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<PhanHoiKhachHang>[] => {
        return mapExcelToDb(rows, importOptions)
    }

    return (
        <ImportDialog<Partial<PhanHoiKhachHang>>
            open={open}
            onOpenChange={onOpenChange}
            onImport={handleImport}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={transformData}
            moduleName="phản hồi khách hàng"
            templateColumns={templateColumns}
            columnMappings={columnMappings}
            enableAutoMapping={true}
            importOptions={importOptions}
        />
    )
}

