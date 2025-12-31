/**
 * Loại Doanh Thu Form Route
 * 
 * Route component for create/edit form view
 */

"use client"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { LoaiDoanhThuFormView } from "../components/loai-doanh-thu-form-view"
import { loaiDoanhThuConfig } from "../config"

export default function LoaiDoanhThuFormRoute() {
  const params = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Check if it's "moi" (new) route by checking pathname
  const isNewMode = location.pathname.endsWith('/moi')
  
  // Determine if it's create or edit mode
  const isEditMode = !isNewMode && !!params.id
  const id = params.id ? parseInt(params.id, 10) : undefined

  // Validate ID if in edit mode
  if (isEditMode && (!id || isNaN(id))) {
    navigate(loaiDoanhThuConfig.routePath)
    return null
  }

  const handleComplete = () => {
    // Check if there's a returnTo query param
    const searchParams = new URLSearchParams(location.search)
    const returnTo = searchParams.get('returnTo')

    if (returnTo === 'list') {
      // Return to list view (from list or create)
      navigate(loaiDoanhThuConfig.routePath)
    } else if (returnTo === 'detail' && isEditMode && id) {
      // Return to detail view (from detail)
      navigate(`${loaiDoanhThuConfig.routePath}/${id}`)
    } else if (isEditMode && id) {
      // Default: after edit, go to detail view
      navigate(`${loaiDoanhThuConfig.routePath}/${id}`)
    } else {
      // Default: after create, go to list view
      navigate(loaiDoanhThuConfig.routePath)
    }
  }

  const handleCancel = () => {
    // Check if there's a returnTo query param
    const searchParams = new URLSearchParams(location.search)
    const returnTo = searchParams.get('returnTo')

    if (returnTo === 'detail' && isEditMode && id) {
      // Return to detail view
      navigate(`${loaiDoanhThuConfig.routePath}/${id}`)
    } else {
      // Return to list view
      navigate(loaiDoanhThuConfig.routePath)
    }
  }

  return (
    <LoaiDoanhThuFormView
      id={isEditMode ? id : undefined}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}

