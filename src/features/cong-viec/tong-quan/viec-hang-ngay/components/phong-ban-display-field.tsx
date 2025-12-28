"use client"

import * as React from "react"
import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { usePhongBan } from "@/features/he-thong/so-do/phong-ban/hooks/use-phong-ban"

interface PhongBanDisplayFieldProps {
    name: string
    label: string
    disabled?: boolean
    placeholder?: string
}

export function PhongBanDisplayField({ name, label, disabled, placeholder }: PhongBanDisplayFieldProps) {
    const form = useFormContext()
    const { data: phongBans } = usePhongBan()
    const maPhong = form.watch(name)
    
    // Find phong ban by ma_phong_ban
    const phongBan = React.useMemo(() => {
        if (!maPhong || !phongBans) return null
        return phongBans.find(pb => pb.ma_phong_ban === maPhong)
    }, [maPhong, phongBans])
    
    const displayValue = phongBan 
        ? `${maPhong} - ${phongBan.ten_phong_ban}`
        : maPhong || ""
    
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

