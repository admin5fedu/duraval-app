/**
 * Nhân Sự Form Route
 * 
 * Route component for form view (create/edit)
 */

"use client"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { NhanSuFormView } from "../components/nhan-su-form-view"
import { nhanSuConfig } from "../config"

export default function NhanSuFormRoute() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  // Check if it's "moi" (new) route by checking pathname
  const isNewMode = location.pathname.endsWith('/moi')
  
  // Determine if it's create or edit mode
  const isEditMode = !isNewMode && !!id
  const nhanSuId = id ? Number(id) : undefined

  // Validate ID if in edit mode
  if (isEditMode && (!nhanSuId || isNaN(nhanSuId))) {
    navigate(nhanSuConfig.routePath)
    return null
  }

  const handleComplete = () => {
    if (isEditMode && nhanSuId) {
      // After edit, go to detail view
      navigate(`${nhanSuConfig.routePath}/${nhanSuId}`)
    } else {
      // After create, go to list view
      navigate(nhanSuConfig.routePath)
    }
  }

  const handleCancel = () => {
    // Check if there's a returnTo query param
    const searchParams = new URLSearchParams(location.search)
    const returnTo = searchParams.get('returnTo')

    if (returnTo === 'detail' && isEditMode && nhanSuId) {
      // Return to detail view
      navigate(`${nhanSuConfig.routePath}/${nhanSuId}`)
    } else {
      // Return to list view
      navigate(nhanSuConfig.routePath)
    }
  }

  return (
    <NhanSuFormView
      id={isEditMode ? nhanSuId : undefined}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}

