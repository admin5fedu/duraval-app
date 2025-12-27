"use client"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { CapBacFormView } from "../components/cap-bac-form-view"
import { capBacConfig } from "../config"

export default function CapBacFormRoute() {
    const { id } = useParams<{ id?: string }>()
    const navigate = useNavigate()
    const location = useLocation()

    // Check if it's "moi" (new) route by checking pathname
    const isNewMode = location.pathname.endsWith('/moi')
    
    // Determine if it's create or edit mode
    const isEditMode = !isNewMode && !!id
    const capBacId = id ? Number(id) : undefined

    // Validate ID if in edit mode
    if (isEditMode && (!capBacId || isNaN(capBacId))) {
        navigate(capBacConfig.routePath)
        return null
    }

    const handleComplete = () => {
        if (isEditMode && capBacId) {
            // After edit, go to detail view
            navigate(`${capBacConfig.routePath}/${capBacId}`)
        } else {
            // After create, go to list view
            navigate(capBacConfig.routePath)
        }
    }

    const handleCancel = () => {
        // Check if there's a returnTo query param
        const searchParams = new URLSearchParams(location.search)
        const returnTo = searchParams.get('returnTo')

        if (returnTo === 'detail' && isEditMode && capBacId) {
            // Return to detail view
            navigate(`${capBacConfig.routePath}/${capBacId}`)
        } else {
            // Return to list view
            navigate(capBacConfig.routePath)
        }
    }

    return (
        <CapBacFormView
            id={isEditMode ? capBacId : undefined}
            onComplete={handleComplete}
            onCancel={handleCancel}
        />
    )
}

