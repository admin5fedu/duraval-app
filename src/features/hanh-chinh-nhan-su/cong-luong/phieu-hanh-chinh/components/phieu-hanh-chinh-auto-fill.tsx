"use client"

import { useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { useAuthStore } from "@/shared/stores/auth-store"
import { PhongBanAPI } from "@/features/he-thong/so-do/phong-ban/services/phong-ban.api"

interface PhieuHanhChinhAutoFillProps {
    isEditMode: boolean
}

export function PhieuHanhChinhAutoFill({ isEditMode }: PhieuHanhChinhAutoFillProps) {
    const { setValue } = useFormContext()
    const { employee } = useAuthStore()

    useEffect(() => {
        // Chỉ auto-fill khi tạo mới
        if (isEditMode) return

        const fillData = async () => {
            if (!employee) return

            // 1. Fill Phong info
            // Ưu tiên lấy phong_id, nếu không có thì lấy phong_ban_id (fallback cũ nếu cần, nhưng user yêu cầu phong_id)
            const phongId = employee.phong_id

            if (phongId) {
                setValue("phong_id", phongId, { shouldValidate: false, shouldDirty: false })
                // Fetch ma_phong từ var_phong_ban
                try {
                    const phong = await PhongBanAPI.getById(phongId)
                    if (phong && phong.ma_phong_ban) {
                        setValue("ma_phong", phong.ma_phong_ban, { shouldValidate: false, shouldDirty: false })
                    }
                } catch (error) {
                    console.error("Error fetching Phong info:", error)
                }
            }

            // 2. Fill Nhom info
            const nhomId = employee.nhom_id
            if (nhomId) {
                setValue("nhom_id", nhomId, { shouldValidate: false, shouldDirty: false })
                // Fetch ma_nhom từ var_phong_ban
                try {
                    const nhom = await PhongBanAPI.getById(nhomId)
                    if (nhom && nhom.ma_phong_ban) {
                        setValue("ma_nhom", nhom.ma_phong_ban, { shouldValidate: false, shouldDirty: false })
                    }
                } catch (error) {
                    console.error("Error fetching Nhom info:", error)
                }
            }
        }

        fillData()
    }, [employee, isEditMode, setValue])

    return null
}
