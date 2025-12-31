"use client"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { TaiLieuBieuMauFormView } from "../components"
import { taiLieuBieuMauConfig } from "../config"

/**
 * Route component for Tài Liệu & Biểu Mẫu form view (create/edit)
 * Uses explicit route pattern (not orchestrator)
 */
export default function TaiLieuBieuMauFormRoute() {
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
    navigate(taiLieuBieuMauConfig.routePath)
    return null
  }

  // Get returnTo from query params
  const searchParams = new URLSearchParams(location.search)
  const returnTo = searchParams.get('returnTo') || (isEditMode ? 'detail' : 'list')

  const handleComplete = () => {
    if (isEditMode && id) {
      // After edit, go to detail view if returnTo is detail, otherwise go to list
      if (returnTo === 'detail') {
        navigate(`${taiLieuBieuMauConfig.routePath}/${id}`)
      } else {
        navigate(taiLieuBieuMauConfig.routePath)
      }
    } else {
      // After create, go to list view
      navigate(taiLieuBieuMauConfig.routePath)
    }
  }

  const handleCancel = () => {
    if (returnTo === 'detail' && isEditMode && id) {
      // Return to detail view
      navigate(`${taiLieuBieuMauConfig.routePath}/${id}`)
    } else {
      // Return to list view
      navigate(taiLieuBieuMauConfig.routePath)
    }
  }

  return (
    <TaiLieuBieuMauFormView
      id={isEditMode ? id : undefined}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}

