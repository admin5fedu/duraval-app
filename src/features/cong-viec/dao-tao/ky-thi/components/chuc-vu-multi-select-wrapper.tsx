"use client"

import * as React from "react"
import { ChucVuMultiSelect } from "@/components/ui/chuc-vu-multi-select"
import { useReferenceQuery } from "@/lib/react-query/hooks"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase } from "@/lib/supabase"

interface ChucVuMultiSelectWrapperProps {
    value?: number[] | null
    onChange?: (value: number[] | null) => void
    disabled?: boolean
    id?: string
    name?: string
    label?: string
    placeholder?: string
}

/**
 * Fetch chức vụ with phong ban information for ChucVuMultiSelect
 * Similar to LichDangAPI.getDanhSachChucVu but with proper joins
 */
async function getDanhSachChucVu() {
    const { data, error } = await supabase
        .from("var_chuc_vu")
        .select("id, ma_chuc_vu, ten_chuc_vu, ma_phong_ban, ma_phong, phong_ban_id")
        .order("ma_phong", { ascending: true, nullsFirst: false })
        .order("ten_chuc_vu", { ascending: true })

    if (error) {
        console.error("Lỗi khi tải danh sách chức vụ:", error)
        return []
    }

    if (!data || data.length === 0) {
        return []
    }

    // Fetch phong ban info
    const phongBanIds = [...new Set(data.map((cv: any) => cv.phong_ban_id).filter((id): id is number => Boolean(id)))]
    const phongBanMas = [...new Set(data.map((cv: any) => cv.ma_phong).filter((ma): ma is string => Boolean(ma)))]
    
    const phongBanQueries: Promise<any>[] = []
    
    if (phongBanIds.length > 0) {
        phongBanQueries.push(
            Promise.resolve(
                supabase
                    .from("var_phong_ban")
                    .select("id, ma_phong_ban, ten_phong_ban")
                    .in("id", phongBanIds)
            ).then(({ data }) => data || []).catch(() => [])
        )
    }
    
    if (phongBanMas.length > 0) {
        phongBanQueries.push(
            Promise.resolve(
                supabase
                    .from("var_phong_ban")
                    .select("id, ma_phong_ban, ten_phong_ban")
                    .in("ma_phong_ban", phongBanMas)
            ).then(({ data }) => data || []).catch(() => [])
        )
    }

    const phongBanResults = await Promise.all(phongBanQueries)
    
    const phongBanMapById = new Map<number, { ma_phong_ban: string, ten_phong_ban: string }>()
    const phongBanMapByMa = new Map<string, string>()
    
    phongBanResults.forEach((result: any[]) => {
        if (result) {
            result.forEach((pb: any) => {
                if (pb.id) {
                    phongBanMapById.set(pb.id, {
                        ma_phong_ban: pb.ma_phong_ban || '',
                        ten_phong_ban: pb.ten_phong_ban || ''
                    })
                }
                if (pb.ma_phong_ban) {
                    phongBanMapByMa.set(pb.ma_phong_ban, pb.ten_phong_ban || '')
                }
            })
        }
    })

    // Transform to ChucVuOption format
    return data.map((item: any) => {
        let tenPhongBanCap1: string | null = null
        if (item.phong_ban_id) {
            const pbInfo = phongBanMapById.get(item.phong_ban_id)
            tenPhongBanCap1 = pbInfo?.ten_phong_ban || null
        }
        
        const tenPhongBanCap2 = item.ma_phong ? phongBanMapByMa.get(item.ma_phong) || null : null

        return {
            id: item.id,
            ma_chuc_vu: item.ma_chuc_vu || "",
            ten_chuc_vu: item.ten_chuc_vu || "",
            ma_phong_ban: item.ma_phong_ban || null,
            ma_phong: item.ma_phong || null,
            phong_ban_id: item.phong_ban_id || null,
            ten_phong_ban: tenPhongBanCap1,
            ten_phong: tenPhongBanCap2,
        }
    })
}

/**
 * Wrapper component for ChucVuMultiSelect from UI components
 * Fetches chức vụ data with phong ban information and transforms it to the required format
 */
export function ChucVuMultiSelectWrapper({
    value: valueProp,
    onChange: onChangeProp,
    disabled: disabledProp = false,
    placeholder = "Chọn chức vụ áp dụng...",
}: ChucVuMultiSelectWrapperProps) {
    // value, onChange, disabled được truyền từ formField trong FormFieldRenderer
    // useFormField() chỉ trả về metadata (id, name, formItemId, error), không có value/onChange
    const value: number[] | null | undefined = valueProp
    const onChange: ((value: number[] | null) => void) | undefined = onChangeProp
    const disabled = disabledProp
    
    const { data: chucVuOptions = [], isLoading, isError } = useReferenceQuery({
        queryKey: ['chuc-vu-list-for-ky-thi'],
        queryFn: getDanhSachChucVu,
    })

    const handleChange = React.useCallback((newValue: number[] | null) => {
        if (onChange) {
            onChange(newValue)
        }
    }, [onChange])

    // Debug: Log để kiểm tra
    React.useEffect(() => {
        console.log('ChucVuMultiSelectWrapper - isLoading:', isLoading, 'isError:', isError, 'options:', chucVuOptions.length, 'value:', value)
        if (chucVuOptions.length > 0) {
            console.log('ChucVuOptions sample:', chucVuOptions.slice(0, 3))
        }
    }, [isLoading, isError, chucVuOptions.length, value])

    if (isLoading) {
        return <Skeleton className="h-10 w-full" />
    }

    if (isError) {
        return (
            <div className="text-sm text-destructive p-2 border border-destructive rounded-md">
                Lỗi khi tải danh sách chức vụ
            </div>
        )
    }

    if (chucVuOptions.length === 0) {
        return (
            <div className="text-sm text-muted-foreground p-2 border rounded-md">
                Không có chức vụ nào
            </div>
        )
    }

    return (
        <div className="w-full">
            <ChucVuMultiSelect
                options={chucVuOptions}
                value={value || []}
                onChange={handleChange}
                disabled={disabled}
                placeholder={placeholder}
            />
        </div>
    )
}

