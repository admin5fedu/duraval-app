"use client"

import * as React from "react"
import { ImportDialog, type ImportOptions } from "@/shared/components/data-display/import/import-dialog"
import { useBatchUpsertNhanSu } from "../actions/nhan-su-excel-actions"
import { NhanSu } from "../types"
import type { TemplateColumn } from "@/lib/excel/template-utils"
import type { ColumnMapping } from "@/shared/utils/excel-column-mapper"
import { parseDate } from "@/shared/utils/excel-date-parser"
import { shouldSkipValue } from "@/shared/utils/excel-data-cleaner"

type UseBatchUpsertNhanSuReturn = ReturnType<typeof useBatchUpsertNhanSu>

interface NhanSuImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mutation?: UseBatchUpsertNhanSuReturn
}

// Column mappings for auto-mapping
const columnMappings: ColumnMapping[] = [
    {
        dbField: "ma_nhan_vien",
        excelNames: [
            "Mã nhân viên", "Mã Nhân Viên", "Ma Nhan Vien", "Ma nhan vien",
            "Mã NV", "Mã nv", "Ma NV", "Ma nv",
            "Mã_Nhân_Viên", "Mã_nhân_viên", "Ma_Nhan_Vien", "Ma_nhan_vien",
            "Mã_NV", "Mã_nv", "Ma_NV", "Ma_nv",
            "Employee ID", "EmployeeID", "employee_id", "ID", "id"
        ],
        required: true,
        type: "number",
        description: "Mã nhân viên (bắt buộc, số nguyên)",
    },
    {
        dbField: "ho_ten",
        excelNames: [
            "Họ tên", "Họ Tên", "Ho Ten", "Ho ten",
            "Họ và Tên", "Họ và tên", "Ho va Ten", "Ho va ten",
            "Họ_Tên", "Họ_tên", "Ho_Ten", "Ho_ten",
            "Họ_và_Tên", "Họ_và_tên", "Ho_va_Ten", "Ho_va_ten",
            "Full Name", "FullName", "full_name", "Name", "name"
        ],
        required: true,
        type: "text",
        description: "Họ và tên đầy đủ",
    },
    {
        dbField: "email_cong_ty",
        excelNames: [
            "Email công ty", "Email Công Ty", "Email Cong Ty", "Email cong ty",
            "Email Cty", "Email cty", "Email CTY", "Email cty",
            "Email_Công_Ty", "Email_công_ty", "Email_Cong_Ty", "Email_cong_ty",
            "Email_Cty", "Email_cty", "Email_CTY", "Email_cty",
            "Work Email", "WorkEmail", "work_email", "Email", "email"
        ],
        required: false,
        type: "email",
        description: "Email công ty (không bắt buộc)",
    },
    {
        dbField: "gioi_tinh",
        excelNames: [
            "Giới tính", "Giới Tính", "Gioi Tinh", "Gioi tinh",
            "Giới_Tính", "Giới_tính", "Gioi_Tinh", "Gioi_tinh",
            "Gender", "gender", "Sex", "sex"
        ],
        required: false,
        type: "text",
        description: "Nam hoặc Nữ",
    },
    {
        dbField: "ngay_sinh",
        excelNames: [
            "Ngày sinh", "Ngày Sinh", "Ngay sinh", "Ngay Sinh",
            "Ngày_sinh", "Ngày_Sinh", "Ngay_sinh", "Ngay_Sinh",
            "Date of Birth", "DateOfBirth", "date_of_birth", "DOB", "dob"
        ],
        required: false,
        type: "date",
        description: "Định dạng dd/mm/yyyy",
    },
    {
        dbField: "so_dien_thoai",
        excelNames: [
            "Số điện thoại", "Số Điện Thoại", "So dien thoai", "So Dien Thoai",
            "Số_điện_thoại", "Số_Điện_Thoại", "So_dien_thoai", "So_Dien_Thoai",
            "SĐT", "SDT", "sdt", "Phone", "phone", "Mobile", "mobile"
        ],
        required: false,
        type: "phone",
        description: "Số điện thoại (10-11 chữ số)",
    },
    {
        dbField: "phong_ban",
        excelNames: [
            "Phòng ban", "Phòng Ban", "Phong ban", "Phong Ban",
            "Phòng_ban", "Phòng_Ban", "Phong_ban", "Phong_Ban",
            "Department", "department", "Dept", "dept"
        ],
        required: false,
        type: "text",
        description: "Tên phòng ban",
    },
    {
        dbField: "chuc_vu",
        excelNames: [
            "Chức vụ", "Chức Vụ", "Chuc vu", "Chuc Vu",
            "Chức_vụ", "Chức_Vụ", "Chuc_vu", "Chuc_Vu",
            "Position", "position", "Title", "title", "Job Title", "job_title"
        ],
        required: false,
        type: "text",
        description: "Tên chức vụ",
    },
    {
        dbField: "tinh_trang",
        excelNames: [
            "Tình trạng", "Tình Trạng", "Tinh trang", "Tinh Trang",
            "Tình_trạng", "Tình_Trạng", "Tinh_trang", "Tinh_Trang",
            "Status", "status", "State", "state"
        ],
        required: false,
        type: "text",
        description: "Chính thức, Thử việc, Nghỉ việc, Tạm nghỉ",
    },
    {
        dbField: "ngay_thu_viec",
        excelNames: [
            "Ngày thử việc", "Ngày Thử Việc", "Ngay thu viec", "Ngay Thu Viec",
            "Ngày_thử_việc", "Ngày_Thử_Việc", "Ngay_thu_viec", "Ngay_Thu_Viec",
            "Probation Date", "probation_date", "Start Date", "start_date"
        ],
        required: false,
        type: "date",
        description: "Định dạng dd/mm/yyyy",
    },
    {
        dbField: "ngay_chinh_thuc",
        excelNames: [
            "Ngày chính thức", "Ngày Chính Thức", "Ngay chinh thuc", "Ngay Chinh Thuc",
            "Ngày_chính_thức", "Ngày_Chính_Thức", "Ngay_chinh_thuc", "Ngay_Chinh_Thuc",
            "Official Date", "official_date", "Permanent Date", "permanent_date"
        ],
        required: false,
        type: "date",
        description: "Định dạng dd/mm/yyyy",
    },
]

// Template columns for Excel import
const templateColumns: TemplateColumn[] = [
    {
        header: "Mã nhân viên",
        description: "Mã nhân viên (bắt buộc, số nguyên)",
        required: true,
        example: 1001,
        type: "number",
    },
    {
        header: "Họ tên",
        description: "Họ và tên đầy đủ",
        required: true,
        example: "Nguyễn Văn A",
        type: "text",
    },
    {
        header: "Email công ty",
        description: "Email công ty (không bắt buộc, định dạng email)",
        required: false,
        example: "nguyen.van.a@company.com",
        type: "email",
    },
    {
        header: "Giới tính",
        description: "Nam hoặc Nữ",
        required: false,
        example: "Nam",
        type: "text",
    },
    {
        header: "Ngày sinh",
        description: "Định dạng dd/mm/yyyy",
        required: false,
        example: "01/01/1990",
        type: "date",
    },
    {
        header: "Số điện thoại",
        description: "Số điện thoại (10-11 chữ số)",
        required: false,
        example: "0912345678",
        type: "phone",
    },
    {
        header: "Phòng ban",
        description: "Tên phòng ban",
        required: false,
        example: "Phòng Kỹ thuật",
        type: "text",
    },
    {
        header: "Chức vụ",
        description: "Tên chức vụ",
        required: false,
        example: "Nhân viên",
        type: "text",
    },
    {
        header: "Tình trạng",
        description: "Chính thức, Thử việc, Nghỉ việc, Tạm nghỉ",
        required: false,
        example: "Chính thức",
        type: "text",
    },
    {
        header: "Ngày thử việc",
        description: "Định dạng dd/mm/yyyy",
        required: false,
        example: "01/01/2024",
        type: "date",
    },
    {
        header: "Ngày chính thức",
        description: "Định dạng dd/mm/yyyy",
        required: false,
        example: "01/04/2024",
        type: "date",
    },
]

// Validate a row of data (using mapped field names)
function validateRow(row: Record<string, any>, _rowNumber: number): string[] {
    const errors: string[] = []

    // Required fields (using db field names after mapping)
    if (!row["ma_nhan_vien"] && row["ma_nhan_vien"] !== 0) {
        errors.push("Mã nhân viên không được để trống")
    } else {
        const maNhanVien = Number(row["ma_nhan_vien"])
        if (isNaN(maNhanVien) || maNhanVien <= 0) {
            errors.push("Mã nhân viên phải là số nguyên dương")
        }
    }

    if (!row["ho_ten"] || String(row["ho_ten"]).trim() === "") {
        errors.push("Họ tên không được để trống")
    }

    // Email không bắt buộc, nhưng nếu có thì phải hợp lệ
    if (row["email_cong_ty"] && String(row["email_cong_ty"]).trim() !== "") {
        const email = String(row["email_cong_ty"]).trim()
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            errors.push("Email công ty không hợp lệ")
        }
    }

    // Optional field validations
    if (row["gioi_tinh"] && !["Nam", "Nữ"].includes(String(row["gioi_tinh"]).trim())) {
        errors.push("Giới tính phải là 'Nam' hoặc 'Nữ'")
    }

    if (row["tinh_trang"] && !["Chính thức", "Thử việc", "Nghỉ việc", "Tạm nghỉ"].includes(String(row["tinh_trang"]).trim())) {
        errors.push("Tình trạng không hợp lệ (phải là: Chính thức, Thử việc, Nghỉ việc, Tạm nghỉ)")
    }

    // Date validations (using parseDate utility)
    const dateFields = ["ngay_sinh", "ngay_thu_viec", "ngay_chinh_thuc"]
    dateFields.forEach((field) => {
        if (row[field]) {
            const parsed = parseDate(row[field], 'dd/mm/yyyy')
            if (!parsed) {
                const fieldNames: Record<string, string> = {
                    ngay_sinh: "Ngày sinh",
                    ngay_thu_viec: "Ngày thử việc",
                    ngay_chinh_thuc: "Ngày chính thức",
                }
                errors.push(`${fieldNames[field]} không hợp lệ (định dạng: dd/mm/yyyy)`)
            }
        }
    })

    return errors
}

// Check for duplicates in the file (using mapped field names)
function checkDuplicates(rows: Array<{ rowNumber: number; data: Record<string, any> }>): Map<string, number[]> {
    const duplicates = new Map<string, number[]>()
    const maNhanVienMap = new Map<number, number[]>()

    rows.forEach((row, index) => {
        const maNhanVien = row.data["ma_nhan_vien"] // Use mapped field name
        if (maNhanVien !== null && maNhanVien !== undefined && maNhanVien !== "") {
            const maNV = Number(maNhanVien)
            if (!isNaN(maNV)) {
                if (!maNhanVienMap.has(maNV)) {
                    maNhanVienMap.set(maNV, [])
                }
                maNhanVienMap.get(maNV)!.push(index)
            }
        }
    })

    maNhanVienMap.forEach((indices, maNV) => {
        if (indices.length > 1) {
            duplicates.set(String(maNV), indices)
        }
    })

    return duplicates
}

// Map Excel columns to database fields (data is already mapped by ImportDialog)
// This function now handles skip empty cells and date parsing
function mapExcelToDb(
    rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>,
    options: ImportOptions
): Partial<NhanSu>[] {
    return rows.map((row) => {
        const mapped: Partial<NhanSu> = {}

        // Map fields (data is already mapped to db field names by ImportDialog)
        if (row.data["ma_nhan_vien"] !== undefined && row.data["ma_nhan_vien"] !== null && row.data["ma_nhan_vien"] !== "") {
            mapped.ma_nhan_vien = Number(row.data["ma_nhan_vien"])
        }

        // Skip empty cells if option enabled
        if (!shouldSkipValue(row.data["ho_ten"], options.skipEmptyCells)) {
            mapped.ho_ten = String(row.data["ho_ten"]).trim()
        }
        if (!shouldSkipValue(row.data["email_cong_ty"], options.skipEmptyCells)) {
            mapped.email_cong_ty = String(row.data["email_cong_ty"]).trim()
        }
        if (!shouldSkipValue(row.data["gioi_tinh"], options.skipEmptyCells)) {
            mapped.gioi_tinh = String(row.data["gioi_tinh"]).trim()
        }
        if (!shouldSkipValue(row.data["so_dien_thoai"], options.skipEmptyCells)) {
            mapped.so_dien_thoai = String(row.data["so_dien_thoai"]).trim()
        }
        if (!shouldSkipValue(row.data["phong_ban"], options.skipEmptyCells)) {
            mapped.phong_ban = String(row.data["phong_ban"]).trim()
        }
        if (!shouldSkipValue(row.data["chuc_vu"], options.skipEmptyCells)) {
            mapped.chuc_vu = String(row.data["chuc_vu"]).trim()
        }
        if (!shouldSkipValue(row.data["tinh_trang"], options.skipEmptyCells)) {
            mapped.tinh_trang = String(row.data["tinh_trang"]).trim()
        }

        // Parse dates using utility (dd/mm/yyyy)
        const dateFormat = options.dateFormat || 'dd/mm/yyyy'
        if (row.data["ngay_sinh"] && !shouldSkipValue(row.data["ngay_sinh"], options.skipEmptyCells)) {
            mapped.ngay_sinh = parseDate(row.data["ngay_sinh"], dateFormat)
        }
        if (row.data["ngay_thu_viec"] && !shouldSkipValue(row.data["ngay_thu_viec"], options.skipEmptyCells)) {
            mapped.ngay_thu_viec = parseDate(row.data["ngay_thu_viec"], dateFormat)
        }
        if (row.data["ngay_chinh_thuc"] && !shouldSkipValue(row.data["ngay_chinh_thuc"], options.skipEmptyCells)) {
            mapped.ngay_chinh_thuc = parseDate(row.data["ngay_chinh_thuc"], dateFormat)
        }

        return mapped
    })
}

export function NhanSuImportDialog({ open, onOpenChange, mutation }: NhanSuImportDialogProps) {
    const defaultMutation = useBatchUpsertNhanSu()
    const batchUpsertMutation = mutation || defaultMutation
    const [importOptions, _setImportOptions] = React.useState<ImportOptions>({
        skipEmptyCells: true,
        upsertMode: 'update',
        dateFormat: 'dd/mm/yyyy',
    })

    const handleImport = async (rows: Partial<NhanSu>[]): Promise<{
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
    const transformData = (rows: Array<{ rowNumber: number; data: Record<string, any>; errors: string[] }>): Partial<NhanSu>[] => {
        return mapExcelToDb(rows, importOptions)
    }

    return (
        <ImportDialog<Partial<NhanSu>>
            open={open}
            onOpenChange={onOpenChange}
            onImport={handleImport}
            validateRow={validateRow}
            checkDuplicates={checkDuplicates}
            transformData={transformData}
            moduleName="nhân sự"
             // Use db field names after mapping
            templateColumns={templateColumns}
            columnMappings={columnMappings}
            enableAutoMapping={true}
            importOptions={importOptions}
            
        />
    )
}
