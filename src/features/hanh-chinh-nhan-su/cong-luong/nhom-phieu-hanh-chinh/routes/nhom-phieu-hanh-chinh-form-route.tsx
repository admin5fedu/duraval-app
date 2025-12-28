/**
 * Nhóm Phiếu Hành Chính Form Route
 * 
 * Route component for form view (create/edit)
 */

"use client"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { NhomPhieuHanhChinhFormView } from "../components/nhom-phieu-hanh-chinh-form-view"
import { nhomPhieuHanhChinhConfig } from "../config"

export default function NhomPhieuHanhChinhFormRoute() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  // Check if it's "moi" (new) route by checking pathname
  const isNewMode = location.pathname.endsWith('/moi')
  
  // Determine if it's create or edit mode
  const isEditMode = !isNewMode && !!id
  const nhomPhieuId = id ? Number(id) : undefined

  // Validate ID if in edit mode
  if (isEditMode && (!nhomPhieuId || isNaN(nhomPhieuId))) {
    navigate(nhomPhieuHanhChinhConfig.routePath)
    return null
  }

  const handleComplete = () => {
    if (isEditMode && nhomPhieuId) {
      // After edit, go to detail view
      navigate(`${nhomPhieuHanhChinhConfig.routePath}/${nhomPhieuId}`)
    } else {
      // After create, go to list view
      navigate(nhomPhieuHanhChinhConfig.routePath)
    }
  }

  const handleCancel = () => {
    // Check if there's a returnTo query param
    const searchParams = new URLSearchParams(location.search)
    const returnTo = searchParams.get('returnTo')

    if (returnTo === 'detail' && isEditMode && nhomPhieuId) {
      // Return to detail view
      navigate(`${nhomPhieuHanhChinhConfig.routePath}/${nhomPhieuId}`)
    } else {
      // Return to list view
      navigate(nhomPhieuHanhChinhConfig.routePath)
    }
  }

  return (
    <NhomPhieuHanhChinhFormView
      id={isEditMode ? nhomPhieuId : undefined}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}

