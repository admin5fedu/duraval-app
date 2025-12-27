/**
 * Thông Tin Công Ty Form Route
 * 
 * Route component for form view (create/edit)
 */

"use client"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { ThongTinCongTyFormView } from "../components/thong-tin-cong-ty-form-view"
import { thongTinCongTyConfig } from "../config"

export default function ThongTinCongTyFormRoute() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  // Check if it's "moi" (new) route by checking pathname
  const isNewMode = location.pathname.endsWith('/moi')
  
  // Determine if it's create or edit mode
  const isEditMode = !isNewMode && !!id
  const thongTinCongTyId = id ? Number(id) : undefined

  // Validate ID if in edit mode
  if (isEditMode && (!thongTinCongTyId || isNaN(thongTinCongTyId))) {
    navigate(thongTinCongTyConfig.routePath)
    return null
  }

  const handleComplete = () => {
    if (isEditMode && thongTinCongTyId) {
      // After edit, go to detail view
      navigate(`${thongTinCongTyConfig.routePath}/${thongTinCongTyId}`)
    } else {
      // After create, go to list view
      navigate(thongTinCongTyConfig.routePath)
    }
  }

  const handleCancel = () => {
    // Check if there's a returnTo query param
    const searchParams = new URLSearchParams(location.search)
    const returnTo = searchParams.get('returnTo')

    if (returnTo === 'detail' && isEditMode && thongTinCongTyId) {
      // Return to detail view
      navigate(`${thongTinCongTyConfig.routePath}/${thongTinCongTyId}`)
    } else {
      // Return to list view
      navigate(thongTinCongTyConfig.routePath)
    }
  }

  return (
    <ThongTinCongTyFormView
      id={isEditMode ? thongTinCongTyId : undefined}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}

