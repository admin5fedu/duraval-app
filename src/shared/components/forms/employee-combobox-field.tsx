/**
 * Reusable Employee Combobox Field
 * 
 * Component tái sử dụng để chọn nhân viên trong các form.
 * Đảm bảo tính nhất quán và dễ dàng sử dụng lại.
 * 
 * @example
 * ```tsx
 * <EmployeeComboboxField
 *   value={String(maNhanVien)}
 *   onChange={(value) => setMaNhanVien(Number(value))}
 *   disabled={isSubmitting}
 * />
 * ```
 */

"use client"

import * as React from "react"
import { ComboboxFormField } from "./combobox-form-field"
import { useNhanSu } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/hooks/use-nhan-su"
import { useMemo } from "react"

interface EmployeeComboboxFieldProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function EmployeeComboboxField({
  value,
  onChange,
  disabled = false,
  placeholder = "Chọn nhân viên...",
  className,
}: EmployeeComboboxFieldProps) {
  const { data: employees, isLoading } = useNhanSu()

  // Create employee options for dropdown
  // Sắp xếp theo mã từ lớn xuống nhỏ (descending) - quy tắc chung
  const employeeOptions = useMemo(() => {
    if (!employees) return []
    
    // Sort by ma_nhan_vien descending (từ lớn xuống nhỏ)
    const sortedEmployees = [...employees].sort((a, b) => b.ma_nhan_vien - a.ma_nhan_vien)
    
    return sortedEmployees.map(emp => ({
      label: `${emp.ma_nhan_vien} - ${emp.ho_ten}`,
      value: String(emp.ma_nhan_vien)
    }))
  }, [employees])

  if (isLoading) {
    return (
      <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm animate-pulse">
        Đang tải danh sách nhân viên...
      </div>
    )
  }

  return (
    <ComboboxFormField
      value={value}
      onChange={onChange}
      options={employeeOptions}
      placeholder={placeholder}
      searchPlaceholder="Tìm kiếm theo mã hoặc tên nhân viên..."
      emptyText="Không tìm thấy nhân viên"
      disabled={disabled}
      className={className}
    />
  )
}

