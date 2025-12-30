/**
 * Phản Hồi Khách Hàng Form Route
 * 
 * Route component for form view (create/edit)
 */

"use client"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { PhanHoiKhachHangFormView } from "../components/phan-hoi-khach-hang-form-view"
import { phanHoiKhachHangConfig } from "../config"

export default function PhanHoiKhachHangFormRoute() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  // Check if it's "moi" (new) route by checking pathname
  const isNewMode = location.pathname.endsWith('/moi')
  
  // Determine if it's create or edit mode
  const isEditMode = !isNewMode && !!id
  const phanHoiId = id ? Number(id) : undefined

  // Validate ID if in edit mode
  if (isEditMode && (!phanHoiId || isNaN(phanHoiId))) {
    navigate(phanHoiKhachHangConfig.routePath)
    return null
  }

  const handleComplete = () => {
    if (isEditMode && phanHoiId) {
      // After edit, go to detail view
      navigate(`${phanHoiKhachHangConfig.routePath}/${phanHoiId}`)
    } else {
      // After create, go to list view
      navigate(phanHoiKhachHangConfig.routePath)
    }
  }

  const handleCancel = () => {
    // Check if there's a returnTo query param
    const searchParams = new URLSearchParams(location.search)
    const returnTo = searchParams.get('returnTo')

    if (returnTo === 'detail' && isEditMode && phanHoiId) {
      // Return to detail view
      navigate(`${phanHoiKhachHangConfig.routePath}/${phanHoiId}`)
    } else {
      // Return to list view
      navigate(phanHoiKhachHangConfig.routePath)
    }
  }

  return (
    <PhanHoiKhachHangFormView
      id={isEditMode ? phanHoiId : undefined}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}

