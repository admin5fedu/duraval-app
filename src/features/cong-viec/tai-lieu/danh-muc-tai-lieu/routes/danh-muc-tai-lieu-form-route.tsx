"use client"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { DanhMucTaiLieuFormView } from "../components"
import { danhMucTaiLieuConfig } from "../config"

/**
 * Route component for Danh Mục Tài Liệu form view (create/edit)
 * Uses explicit route pattern (not orchestrator)
 */
export default function DanhMucTaiLieuFormRoute() {
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
    navigate(danhMucTaiLieuConfig.routePath)
    return null
  }

  // Get returnTo from query params
  const searchParams = new URLSearchParams(location.search)
  const returnTo = searchParams.get('returnTo') || (isEditMode ? 'detail' : 'list')

  const handleComplete = () => {
    if (isEditMode && id) {
      // After edit, go to detail view if returnTo is detail, otherwise go to list
      if (returnTo === 'detail') {
        navigate(`${danhMucTaiLieuConfig.routePath}/${id}`)
      } else {
        navigate(danhMucTaiLieuConfig.routePath)
      }
    } else {
      // After create, go to list view
      navigate(danhMucTaiLieuConfig.routePath)
    }
  }

  const handleCancel = () => {
    if (returnTo === 'detail' && isEditMode && id) {
      // Return to detail view
      navigate(`${danhMucTaiLieuConfig.routePath}/${id}`)
    } else {
      // Return to list view
      navigate(danhMucTaiLieuConfig.routePath)
    }
  }

  return (
    <DanhMucTaiLieuFormView
      id={isEditMode ? id : undefined}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}

