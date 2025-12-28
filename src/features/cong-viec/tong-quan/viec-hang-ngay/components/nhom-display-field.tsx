"use client"

import * as React from "react"
import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useNhanSu } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/hooks/use-nhan-su"

interface NhomDisplayFieldProps {
    name: string
    label: string
    disabled?: boolean
    placeholder?: string
}

export function NhomDisplayField({ name, label, disabled, placeholder }: NhomDisplayFieldProps) {
    const form = useFormContext()
    const { data: employees } = useNhanSu()
    const maNhom = form.watch(name)
    
    // Find nhom from employees where nhom matches ma_nhom
    const nhomInfo = React.useMemo(() => {
        if (!maNhom || !employees) return null
        // Find first employee with matching nhom
        const emp = employees.find(e => e.nhom === maNhom)
        return emp ? emp.nhom : null
    }, [maNhom, employees])
    
    const displayValue = nhomInfo 
        ? `${maNhom} - ${nhomInfo}`
        : maNhom || ""
    
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Input
                            {...field}
                            value={displayValue}
                            disabled={disabled}
                            placeholder={placeholder}
                            readOnly
                            className="bg-muted cursor-not-allowed"
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

