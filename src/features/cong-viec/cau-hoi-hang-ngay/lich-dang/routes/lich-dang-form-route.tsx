"use client"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { LichDangFormView } from "../components/lich-dang-form-view"
import { lichDangConfig } from "../config"

export default function LichDangFormRoute() {
    const { id: idParam } = useParams<{ id?: string }>()
    const navigate = useNavigate()
    const location = useLocation()

    // Check if it's "moi" (new) route by checking pathname
    const isNewMode = location.pathname.endsWith('/moi')
    
    // Determine if it's create or edit mode
    const isEditMode = !isNewMode && !!idParam
    const id = isEditMode && idParam ? Number(idParam) : undefined

    // Validate ID if in edit mode
    if (isEditMode && (!id || isNaN(id))) {
        navigate(lichDangConfig.routePath)
        return null
    }

    // Get returnTo from query params
    const searchParams = new URLSearchParams(location.search)
    const returnTo = searchParams.get('returnTo') || (isEditMode ? 'detail' : 'list')

    const handleComplete = () => {
        if (isEditMode && id) {
            // After edit, go to detail view if returnTo is detail, otherwise go to list
            if (returnTo === 'detail') {
                navigate(`${lichDangConfig.routePath}/${id}`)
            } else {
                navigate(lichDangConfig.routePath)
            }
        } else {
            // After create, go to list view
            navigate(lichDangConfig.routePath)
        }
    }

    const handleCancel = () => {
        if (returnTo === 'detail' && isEditMode && id) {
            // Return to detail view
            navigate(`${lichDangConfig.routePath}/${id}`)
        } else {
            // Return to list view
            navigate(lichDangConfig.routePath)
        }
    }

    return (
        <LichDangFormView
            id={isEditMode ? id : undefined}
            onComplete={handleComplete}
            onCancel={handleCancel}
        />
    )
}

