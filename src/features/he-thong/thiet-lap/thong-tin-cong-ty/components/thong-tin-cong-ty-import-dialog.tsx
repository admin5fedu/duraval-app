"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertThongTinCongTy } from "../actions/thong-tin-cong-ty-excel-actions"
import { ThongTinCongTy } from "../schema"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertThongTinCongTyReturn = ReturnType<typeof useBatchUpsertThongTinCongTy>

interface ThongTinCongTyImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertThongTinCongTyReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "ma_cong_ty",
        excelNames: [
            "Mã công ty", "Mã Công Ty", "Ma cong ty", "Ma Cong Ty",
            "Mã_CT", "Mã_ct", "Ma_CT", "Ma_ct",
            "Company Code", "CompanyCode", "company_code", "Code", "code"
        ],
        required: true,
        type: "string",
        description: "Mã công ty (bắt buộc)",
    },
    {
        dbField: "ten_cong_ty",
        excelNames: [
            "Tên công ty", "Tên Công Ty", "Ten cong ty", "Ten Cong Ty",
            "Tên_CT", "Tên_ct", "Ten_CT", "Ten_ct",
            "Company Name", "CompanyName", "company_name", "Name", "name"
        ],
        required: true,
        type: "string",
        description: "Tên công ty (bắt buộc)",
    },
    {
        dbField: "ten_day_du",
        excelNames: [
            "Tên đầy đủ", "Tên Đầy Đủ", "Ten day du", "Ten Day Du",
            "Tên_đầy_đủ", "Tên_Đầy_Đủ", "Ten_day_du", "Ten_Day_Du",
            "Full Name", "FullName", "full_name", "Full", "full"
        ],
        required: true,
        type: "string",
        description: "Tên đầy đủ (bắt buộc)",
    },
    {
        dbField: "link_logo",
        excelNames: [
            "Link logo", "Link Logo", "link logo", "Link Logo",
            "Link_logo", "Link_Logo", "link_logo", "Link_Logo",
            "Logo URL", "LogoURL", "logo_url", "Logo", "logo"
        ],
        required: true,
        type: "string",
        description: "Link logo (bắt buộc, URL)",
    },
    {
        dbField: "dia_chi",
        excelNames: [
            "Địa chỉ", "Địa Chỉ", "Dia chi", "Dia Chi",
            "Địa_chỉ", "Địa_Chỉ", "Dia_chi", "Dia_Chi",
            "Address", "address", "Addr", "addr"
        ],
        required: true,
        type: "string",
        description: "Địa chỉ (bắt buộc)",
    },
    {
        dbField: "so_dien_thoai",
        excelNames: [
            "Số điện thoại", "Số Điện Thoại", "So dien thoai", "So Dien Thoai",
            "Số_điện_thoại", "Số_Điện_Thoại", "So_dien_thoai", "So_Dien_Thoai",
            "SĐT", "SDT", "sdt", "Phone", "phone", "Mobile", "mobile"
        ],
        required: true,
        type: "phone",
        description: "Số điện thoại (bắt buộc, 10-11 chữ số)",
    },
    {
        dbField: "email",
        excelNames: [
            "Email", "email", "E-mail", "e-mail",
            "Email công ty", "Email Công Ty", "Email cong ty", "Email Cong Ty"
        ],
        required: true,
        type: "email",
        description: "Email (bắt buộc, định dạng email hợp lệ)",
    },
    {
        dbField: "website",
        excelNames: [
            "Website", "website", "Web", "web",
            "URL", "url", "Site", "site"
        ],
        required: true,
        type: "string",
        description: "Website (bắt buộc, URL)",
    },
    {
        dbField: "ap_dung",
        excelNames: [
            "Áp dụng", "Áp Dụng", "Ap dung", "Ap Dung",
            "Áp_dụng", "Áp_Dụng", "Ap_dung", "Ap_Dung",
            "Active", "active", "Enabled", "enabled", "Apply", "apply"
        ],
        required: false,
        type: "boolean",
        description: "Áp dụng (true/false, mặc định: false)",
    },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
    {
        name: "ma_cong_ty",
        label: "Mã công ty",
        type: "string",
        required: true,
        description: "Mã công ty (bắt buộc)",
    },
    {
        name: "ten_cong_ty",
        label: "Tên công ty",
        type: "string",
        required: true,
        description: "Tên công ty (bắt buộc)",
    },
    {
        name: "ten_day_du",
        label: "Tên đầy đủ",
        type: "string",
        required: true,
        description: "Tên đầy đủ (bắt buộc)",
    },
    {
        name: "link_logo",
        label: "Link logo",
        type: "string",
        required: true,
        description: "Link logo (bắt buộc, URL)",
    },
    {
        name: "dia_chi",
        label: "Địa chỉ",
        type: "string",
        required: true,
        description: "Địa chỉ (bắt buộc)",
    },
    {
        name: "so_dien_thoai",
        label: "Số điện thoại",
        type: "string",
        required: true,
        description: "Số điện thoại (bắt buộc, 10-11 chữ số)",
    },
    {
        name: "email",
        label: "Email",
        type: "email",
        required: true,
        description: "Email (bắt buộc, định dạng email hợp lệ)",
    },
    {
        name: "website",
        label: "Website",
        type: "string",
        required: true,
        description: "Website (bắt buộc, URL)",
    },
    {
        name: "ap_dung",
        label: "Áp dụng",
        type: "boolean",
        required: false,
        description: "Áp dụng (true/false, mặc định: false)",
    },
]

// Validate a single row
function validateRow(
    row: Record<string, any>,
    rowNumber: number
): string[] {
    const errors: string[] = []

    // Required fields
    if (!row.ma_cong_ty || String(row.ma_cong_ty).trim() === "") {
        errors.push("Mã công ty là bắt buộc")
    }

    if (!row.ten_cong_ty || String(row.ten_cong_ty).trim() === "") {
        errors.push("Tên công ty là bắt buộc")
    }

    if (!row.ten_day_du || String(row.ten_day_du).trim() === "") {
        errors.push("Tên đầy đủ là bắt buộc")
    }

    if (!row.link_logo || String(row.link_logo).trim() === "") {
        errors.push("Link logo là bắt buộc")
    }

    if (!row.dia_chi || String(row.dia_chi).trim() === "") {
        errors.push("Địa chỉ là bắt buộc")
    }

    if (!row.so_dien_thoai || String(row.so_dien_thoai).trim() === "") {
        errors.push("Số điện thoại là bắt buộc")
    } else {
        const phone = String(row.so_dien_thoai).trim().replace(/\s+/g, "")
        if (!/^[0-9]{10,11}$/.test(phone)) {
            errors.push("Số điện thoại phải có 10-11 chữ số")
        }
    }

    if (!row.email || String(row.email).trim() === "") {
        errors.push("Email là bắt buộc")
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(String(row.email).trim())) {
            errors.push("Email không hợp lệ")
        }
    }

    if (!row.website || String(row.website).trim() === "") {
        errors.push("Website là bắt buộc")
    }

    // Optional fields validation
    if (row.ap_dung !== undefined && row.ap_dung !== null && row.ap_dung !== "") {
        const apDung = String(row.ap_dung).toLowerCase().trim()
        if (apDung !== "true" && apDung !== "false" && apDung !== "1" && apDung !== "0" && apDung !== "có" && apDung !== "không") {
            errors.push("Áp dụng phải là true/false hoặc có/không")
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
        const maCongTy = row.data.ma_cong_ty

        if (maCongTy) {
            const key = String(maCongTy).trim()
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
): Partial<ThongTinCongTy>[] {
    return rows.map((row) => {
        const mapped: Partial<ThongTinCongTy> = {}

        // Map required fields
        if (!shouldSkipValue(row.data["ma_cong_ty"], options.skipEmptyCells)) {
            mapped.ma_cong_ty = String(row.data["ma_cong_ty"]).trim()
        }

        if (!shouldSkipValue(row.data["ten_cong_ty"], options.skipEmptyCells)) {
            mapped.ten_cong_ty = String(row.data["ten_cong_ty"]).trim()
        }

        if (!shouldSkipValue(row.data["ten_day_du"], options.skipEmptyCells)) {
            mapped.ten_day_du = String(row.data["ten_day_du"]).trim()
        }

        if (!shouldSkipValue(row.data["link_logo"], options.skipEmptyCells)) {
            mapped.link_logo = String(row.data["link_logo"]).trim()
        }

        if (!shouldSkipValue(row.data["dia_chi"], options.skipEmptyCells)) {
            mapped.dia_chi = String(row.data["dia_chi"]).trim()
        }

        if (!shouldSkipValue(row.data["so_dien_thoai"], options.skipEmptyCells)) {
            mapped.so_dien_thoai = String(row.data["so_dien_thoai"]).trim()
        }

        if (!shouldSkipValue(row.data["email"], options.skipEmptyCells)) {
            mapped.email = String(row.data["email"]).trim()
        }

        if (!shouldSkipValue(row.data["website"], options.skipEmptyCells)) {
            mapped.website = String(row.data["website"]).trim()
        }

        // Map optional fields
        if (row.data["ap_dung"] !== undefined && row.data["ap_dung"] !== null && row.data["ap_dung"] !== "") {
            const apDung = String(row.data["ap_dung"]).toLowerCase().trim()
            if (apDung === "true" || apDung === "1" || apDung === "có") {
                mapped.ap_dung = true
            } else if (apDung === "false" || apDung === "0" || apDung === "không") {
                mapped.ap_dung = false
            }
        }

        return mapped
    })
}

export function ThongTinCongTyImportDialog({ open, onOpenChange, mutation }: ThongTinCongTyImportDialogProps) {
    const defaultMutation = useBatchUpsertThongTinCongTy()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions, setImportOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'insert', // Only insert for thông tin công ty
    })

    const handleImport = async (rows: Partial<ThongTinCongTy>[]): Promise<{
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
    const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<ThongTinCongTy>[] => {
        return mapExcelToDb(rows, importOptions)
    }

    return (
        <ImportDialog<Partial<ThongTinCongTy>>
            open={open}
            onOpenChange={onOpenChange}
            onImport={handleImport}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={transformData}
            moduleName="thông tin công ty"
            expectedHeaders={["ma_cong_ty", "ten_cong_ty", "ten_day_du", "link_logo", "dia_chi", "so_dien_thoai", "email", "website"]}
            templateColumns={templateColumns}
            columnMappings={columnMappings}
            enableAutoMapping={true}
            importOptions={importOptions}
            onOptionsChange={setImportOptions}
        />
    )
}

