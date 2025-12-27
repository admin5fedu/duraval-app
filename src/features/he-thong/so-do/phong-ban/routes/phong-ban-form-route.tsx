/**
 * Phòng Ban Form Route
 * 
 * Route component for form view (create/edit)
 */

"use client"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { PhongBanFormView } from "../components/phong-ban-form-view"
import { phongBanConfig } from "../config"

export default function PhongBanFormRoute() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  // Check if it's "moi" (new) route by checking pathname
  const isNewMode = location.pathname.endsWith('/moi')
  
  // Determine if it's create or edit mode
  const isEditMode = !isNewMode && !!id
  const phongBanId = id ? Number(id) : undefined

  // Validate ID if in edit mode
  if (isEditMode && (!phongBanId || isNaN(phongBanId))) {
    navigate(phongBanConfig.routePath)
    return null
  }

  const handleComplete = () => {
    if (isEditMode && phongBanId) {
      // After edit, go to detail view
      navigate(`${phongBanConfig.routePath}/${phongBanId}`)
    } else {
      // After create, go to list view
      navigate(phongBanConfig.routePath)
    }
  }

  const handleCancel = () => {
    // Check if there's a returnTo query param
    const searchParams = new URLSearchParams(location.search)
    const returnTo = searchParams.get('returnTo')

    if (returnTo === 'detail' && isEditMode && phongBanId) {
      // Return to detail view
      navigate(`${phongBanConfig.routePath}/${phongBanId}`)
    } else {
      // Return to list view
      navigate(phongBanConfig.routePath)
    }
  }

  return (
    <PhongBanFormView
      id={isEditMode ? phongBanId : undefined}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}

