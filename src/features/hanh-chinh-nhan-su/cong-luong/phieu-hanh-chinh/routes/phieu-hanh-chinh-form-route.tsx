/**
 * Phiếu Hành Chính Form Route
 * 
 * Route component for form view (create/edit)
 */

"use client"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { PhieuHanhChinhFormView } from "../components/phieu-hanh-chinh-form-view"
import { phieuHanhChinhConfig } from "../config"

export default function PhieuHanhChinhFormRoute() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  // Check if it's "moi" (new) route by checking pathname
  const isNewMode = location.pathname.endsWith('/moi')
  
  // Determine if it's create or edit mode
  const isEditMode = !isNewMode && !!id
  const phieuId = id ? Number(id) : undefined

  // Validate ID if in edit mode
  if (isEditMode && (!phieuId || isNaN(phieuId))) {
    navigate(phieuHanhChinhConfig.routePath)
    return null
  }

  const handleComplete = () => {
    if (isEditMode && phieuId) {
      // After edit, go to detail view
      navigate(`${phieuHanhChinhConfig.routePath}/${phieuId}`)
    } else {
      // After create, go to list view
      navigate(phieuHanhChinhConfig.routePath)
    }
  }

  const handleCancel = () => {
    // Check if there's a returnTo query param
    const searchParams = new URLSearchParams(location.search)
    const returnTo = searchParams.get('returnTo')

    if (returnTo === 'detail' && isEditMode && phieuId) {
      // Return to detail view
      navigate(`${phieuHanhChinhConfig.routePath}/${phieuId}`)
    } else {
      // Return to list view
      navigate(phieuHanhChinhConfig.routePath)
    }
  }

  return (
    <PhieuHanhChinhFormView
      id={isEditMode ? phieuId : undefined}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}
