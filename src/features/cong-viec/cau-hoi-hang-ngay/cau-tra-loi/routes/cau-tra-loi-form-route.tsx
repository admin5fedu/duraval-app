"use client"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { CauTraLoiFormView } from "../components/cau-tra-loi-form-view"
import { cauTraLoiConfig } from "../config"

export default function CauTraLoiFormRoute() {
    const { id: idParam } = useParams<{ id?: string }>()
    const navigate = useNavigate()
    const location = useLocation()

    // Check if it's "them-moi" (new) route by checking pathname
    const isNewMode = location.pathname.endsWith('/them-moi')
    
    // Determine if it's create or edit mode
    const isEditMode = !isNewMode && !!idParam
    const id = isEditMode && idParam ? Number(idParam) : undefined

    // Validate ID if in edit mode
    if (isEditMode && (!id || isNaN(id))) {
        navigate(cauTraLoiConfig.routePath)
        return null
    }

    // Get returnTo from query params
    const searchParams = new URLSearchParams(location.search)
    const returnTo = searchParams.get('returnTo') || (isEditMode ? 'detail' : 'list')

    const handleComplete = () => {
        if (isEditMode && id) {
            // After edit, go to detail view if returnTo is detail, otherwise go to list
            if (returnTo === 'detail') {
                navigate(`${cauTraLoiConfig.routePath}/${id}`)
            } else {
                navigate(cauTraLoiConfig.routePath)
            }
        } else {
            // After create, go to list view
            navigate(cauTraLoiConfig.routePath)
        }
    }

    const handleCancel = () => {
        if (returnTo === 'detail' && isEditMode && id) {
            // Return to detail view
            navigate(`${cauTraLoiConfig.routePath}/${id}`)
        } else {
            // Return to list view
            navigate(cauTraLoiConfig.routePath)
        }
    }

    return (
        <CauTraLoiFormView
            id={isEditMode ? id : undefined}
            onComplete={handleComplete}
            onCancel={handleCancel}
        />
    )
}

