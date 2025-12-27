"use client"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { ChucVuFormView } from "../components/chuc-vu-form-view"
import { chucVuConfig } from "../config"

export default function ChucVuFormRoute() {
    const { id } = useParams<{ id?: string }>()
    const navigate = useNavigate()
    const location = useLocation()

    // Check if it's "moi" (new) route by checking pathname
    const isNewMode = location.pathname.endsWith('/moi')
    
    // Determine if it's create or edit mode
    const isEditMode = !isNewMode && !!id
    const chucVuId = id ? Number(id) : undefined

    // Validate ID if in edit mode
    if (isEditMode && (!chucVuId || isNaN(chucVuId))) {
        navigate(chucVuConfig.routePath)
        return null
    }

    const handleComplete = () => {
        if (isEditMode && chucVuId) {
            // After edit, go to detail view
            navigate(`${chucVuConfig.routePath}/${chucVuId}`)
        } else {
            // After create, go to list view
            navigate(chucVuConfig.routePath)
        }
    }

    const handleCancel = () => {
        // Check if there's a returnTo query param
        const searchParams = new URLSearchParams(location.search)
        const returnTo = searchParams.get('returnTo')

        if (returnTo === 'detail' && isEditMode && chucVuId) {
            // Return to detail view
            navigate(`${chucVuConfig.routePath}/${chucVuId}`)
        } else {
            // Return to list view
            navigate(chucVuConfig.routePath)
        }
    }

    return (
        <ChucVuFormView
            id={isEditMode ? chucVuId : undefined}
            onComplete={handleComplete}
            onCancel={handleCancel}
        />
    )
}

