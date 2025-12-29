/**
 * Nhóm Lương Form Route
 * 
 * Route component for form view (create/edit)
 */

"use client"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { NhomLuongFormView } from "../components/nhom-luong-form-view"
import { nhomLuongConfig } from "../config"

export default function NhomLuongFormRoute() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  // Check if it's "moi" (new) route by checking pathname
  const isNewMode = location.pathname.endsWith('/moi')
  
  // Determine if it's create or edit mode
  const isEditMode = !isNewMode && !!id
  const nhomLuongId = id ? Number(id) : undefined

  // Validate ID if in edit mode
  if (isEditMode && (!nhomLuongId || isNaN(nhomLuongId))) {
    navigate(nhomLuongConfig.routePath)
    return null
  }

  const handleComplete = () => {
    if (isEditMode && nhomLuongId) {
      // After edit, go to detail view
      navigate(`${nhomLuongConfig.routePath}/${nhomLuongId}`)
    } else {
      // After create, go to list view
      navigate(nhomLuongConfig.routePath)
    }
  }

  const handleCancel = () => {
    // Check if there's a returnTo query param
    const searchParams = new URLSearchParams(location.search)
    const returnTo = searchParams.get('returnTo')

    if (returnTo === 'detail' && isEditMode && nhomLuongId) {
      // Return to detail view
      navigate(`${nhomLuongConfig.routePath}/${nhomLuongId}`)
    } else {
      // Return to list view
      navigate(nhomLuongConfig.routePath)
    }
  }

  return (
    <NhomLuongFormView
      id={isEditMode ? nhomLuongId : undefined}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}

