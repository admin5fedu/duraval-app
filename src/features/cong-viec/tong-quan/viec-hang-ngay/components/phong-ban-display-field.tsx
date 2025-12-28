"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { usePhongBan } from "@/features/he-thong/so-do/phong-ban/hooks/use-phong-ban"

interface PhongBanDisplayFieldProps {
    name: string
    label?: string
    value?: string | null
    onChange?: (value: string | null) => void
    disabled?: boolean
    placeholder?: string
    description?: string
}

export function PhongBanDisplayField({ value, disabled, placeholder }: PhongBanDisplayFieldProps) {
    const { data: phongBans } = usePhongBan()
    
    // Find phong ban by ma_phong_ban
    const phongBan = React.useMemo(() => {
        if (!value || !phongBans) return null
        return phongBans.find(pb => pb.ma_phong_ban === value)
    }, [value, phongBans])
    
    const displayValue = phongBan 
        ? `${value} - ${phongBan.ten_phong_ban}`
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

