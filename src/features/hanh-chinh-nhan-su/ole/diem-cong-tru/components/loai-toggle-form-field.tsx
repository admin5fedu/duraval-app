"use client"

import * as React from "react"
import { ToggleButtonGroup } from "@/features/hanh-chinh-nhan-su/ole/nhom-diem-cong-tru/components/toggle-button-group"
import { useQuery } from "@tanstack/react-query"
import { NhomDiemCongTruAPI } from "@/features/hanh-chinh-nhan-su/ole/nhom-diem-cong-tru/services/nhom-diem-cong-tru.api"
import { nhomDiemCongTruQueryKeys } from "@/lib/react-query/query-keys"

interface LoaiToggleFormFieldProps {
    value?: string | null
    onChange: (value: string | null) => void
    placeholder?: string
    description?: string
    disabled?: boolean
    id?: string // ID từ FormControl
    name?: string // Name từ FormControl
    onBlur?: () => void // onBlur từ FormControl
}

export function LoaiToggleFormField({
    value,
    onChange,
    disabled,
    id,
}: LoaiToggleFormFieldProps) {

    // Fetch unique hang_muc values from nhom-diem-cong-tru table
    const { data: hangMucList, isLoading } = useQuery({
        queryKey: [...nhomDiemCongTruQueryKeys.all(), "hang-muc-for-loai"],
        queryFn: async () => {
            const all = await NhomDiemCongTruAPI.getAll()
            // Get unique hang_muc values
            const uniqueHangMuc = Array.from(
                new Set(all.map((item) => item.hang_muc).filter(Boolean))
            ) as string[]
            return uniqueHangMuc.sort()
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    })

    // Convert hang_muc list to options for toggle button
    const options = React.useMemo(() => {
        if (!hangMucList || hangMucList.length === 0) {
            return [
                { label: "Cộng", value: "Cộng" },
                { label: "Trừ", value: "Trừ" },
            ]
        }
        return hangMucList.map((hangMuc) => ({
            label: hangMuc,
            value: hangMuc,
        }))
    }, [hangMucList])

    const handleChange = React.useCallback(
        (newValue: string | number) => {
            onChange(newValue as string)
        },
        [onChange]
    )

    if (isLoading) {
        return (
            <div className="flex items-center gap-2">
                <div className="h-8 w-20 bg-muted animate-pulse rounded-md" />
                <div className="h-8 w-20 bg-muted animate-pulse rounded-md" />
            </div>
        )
    }

    return (
        <ToggleButtonGroup
            id={id}
            value={value || undefined}
            onChange={handleChange}
            options={options}
            disabled={disabled}
        />
    )
}

