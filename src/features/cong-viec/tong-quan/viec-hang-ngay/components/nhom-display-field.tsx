"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { useNhanSu } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/hooks/use-nhan-su"

interface NhomDisplayFieldProps {
    name: string
    label?: string
    value?: string | null
    onChange?: (value: string | null) => void
    disabled?: boolean
    placeholder?: string
    description?: string
}

export function NhomDisplayField({ value, disabled, placeholder }: NhomDisplayFieldProps) {
    const { data: employees } = useNhanSu()
    
    // Find nhom from employees where nhom matches ma_nhom
    const nhomInfo = React.useMemo(() => {
        if (!value || !employees) return null
        // Find first employee with matching nhom
        const emp = employees.find(e => e.nhom === value)
        return emp ? emp.nhom : null
    }, [value, employees])
    
    const displayValue = nhomInfo 
        ? `${value} - ${nhomInfo}`
        : value || ""
    
    return (
        <Input
            value={displayValue}
            disabled={disabled}
            placeholder={placeholder}
            readOnly
            className="bg-muted cursor-not-allowed"
            onChange={() => {}} // Read-only, prevent changes
        />
    )
}

