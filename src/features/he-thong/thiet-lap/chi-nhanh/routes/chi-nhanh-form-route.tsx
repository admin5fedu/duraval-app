/**
 * Chi Nhánh Form Route
 * 
 * Route component for form view (create/edit)
 */

"use client"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { ChiNhanhFormView } from "../components/chi-nhanh-form-view"
import { chiNhanhConfig } from "../config"

export default function ChiNhanhFormRoute() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  // Check if it's "moi" (new) route by checking pathname
  const isNewMode = location.pathname.endsWith('/moi')
  
  // Determine if it's create or edit mode
  const isEditMode = !isNewMode && !!id
  const chiNhanhId = id ? Number(id) : undefined

  // Validate ID if in edit mode
  if (isEditMode && (!chiNhanhId || isNaN(chiNhanhId))) {
    navigate(chiNhanhConfig.routePath)
    return null
  }

  const handleComplete = () => {
    if (isEditMode && chiNhanhId) {
      // After edit, go to detail view
      navigate(`${chiNhanhConfig.routePath}/${chiNhanhId}`)
    } else {
      // After create, go to list view
      navigate(chiNhanhConfig.routePath)
    }
  }

  const handleCancel = () => {
    // Check if there's a returnTo query param
    const searchParams = new URLSearchParams(location.search)
    const returnTo = searchParams.get('returnTo')

    if (returnTo === 'detail' && isEditMode && chiNhanhId) {
      // Return to detail view
      navigate(`${chiNhanhConfig.routePath}/${chiNhanhId}`)
    } else {
      // Return to list view
      navigate(chiNhanhConfig.routePath)
    }
  }

  return (
    <ChiNhanhFormView
      id={isEditMode ? chiNhanhId : undefined}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}

