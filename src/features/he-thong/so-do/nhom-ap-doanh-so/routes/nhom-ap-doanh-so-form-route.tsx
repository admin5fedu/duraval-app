"use client"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { NhomApDoanhSoFormView } from "../components/nhom-ap-doanh-so-form-view"
import { nhomApDoanhSoConfig } from "../config"

export default function NhomApDoanhSoFormRoute() {
    const { id } = useParams<{ id?: string }>()
    const navigate = useNavigate()
    const location = useLocation()

    // Check if it's "moi" (new) route by checking pathname
    const isNewMode = location.pathname.endsWith('/moi')
    
    // Determine if it's create or edit mode
    const isEditMode = !isNewMode && !!id
    const nhomApDoanhSoId = id ? Number(id) : undefined

    // Validate ID if in edit mode
    if (isEditMode && (!nhomApDoanhSoId || isNaN(nhomApDoanhSoId))) {
        navigate(nhomApDoanhSoConfig.routePath)
        return null
    }

    const handleComplete = () => {
        if (isEditMode && nhomApDoanhSoId) {
            // After edit, go to detail view
            navigate(`${nhomApDoanhSoConfig.routePath}/${nhomApDoanhSoId}`)
        } else {
            // After create, go to list view
            navigate(nhomApDoanhSoConfig.routePath)
        }
    }

    const handleCancel = () => {
        // Check if there's a returnTo query param
        const searchParams = new URLSearchParams(location.search)
        const returnTo = searchParams.get('returnTo')

        if (returnTo === 'detail' && isEditMode && nhomApDoanhSoId) {
            // Return to detail view
            navigate(`${nhomApDoanhSoConfig.routePath}/${nhomApDoanhSoId}`)
        } else {
            // Return to list view
            navigate(nhomApDoanhSoConfig.routePath)
        }
    }

    return (
        <NhomApDoanhSoFormView
            id={isEditMode ? nhomApDoanhSoId : undefined}
            onComplete={handleComplete}
            onCancel={handleCancel}
        />
    )
}

