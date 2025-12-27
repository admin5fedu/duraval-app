/**
 * Người Thân Form Route
 * 
 * Route component for form view (create/edit)
 */

"use client"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { NguoiThanFormView } from "../components/nguoi-than-form-view"
import { nguoiThanConfig } from "../config"

export default function NguoiThanFormRoute() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  // Check if it's "moi" (new) route by checking pathname
  const isNewMode = location.pathname.endsWith('/moi')
  
  // Determine if it's create or edit mode
  const isEditMode = !isNewMode && !!id
  const nguoiThanId = id ? Number(id) : undefined

  // Validate ID if in edit mode
  if (isEditMode && (!nguoiThanId || isNaN(nguoiThanId))) {
    navigate(nguoiThanConfig.routePath)
    return null
  }

  const handleComplete = () => {
    if (isEditMode && nguoiThanId) {
      // After edit, go to detail view
      navigate(`${nguoiThanConfig.routePath}/${nguoiThanId}`)
    } else {
      // After create, go to list view
      navigate(nguoiThanConfig.routePath)
    }
  }

  const handleCancel = () => {
    // Check if there's a returnTo query param
    const searchParams = new URLSearchParams(location.search)
    const returnTo = searchParams.get('returnTo')

    if (returnTo === 'detail' && isEditMode && nguoiThanId) {
      // Return to detail view
      navigate(`${nguoiThanConfig.routePath}/${nguoiThanId}`)
    } else {
      // Return to list view
      navigate(nguoiThanConfig.routePath)
    }
  }

  return (
    <NguoiThanFormView
      id={isEditMode ? nguoiThanId : undefined}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}

