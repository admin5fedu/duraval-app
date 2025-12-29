/**
 * Nhóm Điểm Cộng Trừ Form Route
 * 
 * Route component for form view (create/edit)
 */

"use client"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { NhomDiemCongTruFormView } from "../components/nhom-diem-cong-tru-form-view"
import { nhomDiemCongTruConfig } from "../config"

export default function NhomDiemCongTruFormRoute() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  // Check if it's "moi" (new) route by checking pathname
  const isNewMode = location.pathname.endsWith('/moi')
  
  // Determine if it's create or edit mode
  const isEditMode = !isNewMode && !!id
  const nhomDiemId = id ? Number(id) : undefined

  // Validate ID if in edit mode
  if (isEditMode && (!nhomDiemId || isNaN(nhomDiemId))) {
    navigate(nhomDiemCongTruConfig.routePath)
    return null
  }

  const handleComplete = () => {
    if (isEditMode && nhomDiemId) {
      // After edit, go to detail view
      navigate(`${nhomDiemCongTruConfig.routePath}/${nhomDiemId}`)
    } else {
      // After create, go to list view
      navigate(nhomDiemCongTruConfig.routePath)
    }
  }

  const handleCancel = () => {
    // Check if there's a returnTo query param
    const searchParams = new URLSearchParams(location.search)
    const returnTo = searchParams.get('returnTo')

    if (returnTo === 'detail' && isEditMode && nhomDiemId) {
      // Return to detail view
      navigate(`${nhomDiemCongTruConfig.routePath}/${nhomDiemId}`)
    } else {
      // Return to list view
      navigate(nhomDiemCongTruConfig.routePath)
    }
  }

  return (
    <NhomDiemCongTruFormView
      id={isEditMode ? nhomDiemId : undefined}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}
