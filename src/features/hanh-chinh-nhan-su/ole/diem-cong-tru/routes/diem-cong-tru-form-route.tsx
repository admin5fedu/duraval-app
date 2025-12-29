/**
 * Điểm Cộng Trừ Form Route
 * 
 * Route component for form view (create/edit)
 */

"use client"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { DiemCongTruFormView } from "../components/diem-cong-tru-form-view"
import { diemCongTruConfig } from "../config"

export default function DiemCongTruFormRoute() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  // Check if it's "moi" (new) route by checking pathname
  const isNewMode = location.pathname.endsWith('/moi')
  
  // Determine if it's create or edit mode
  const isEditMode = !isNewMode && !!id
  const diemCongTruId = id ? Number(id) : undefined

  // Validate ID if in edit mode
  if (isEditMode && (!diemCongTruId || isNaN(diemCongTruId))) {
    navigate(diemCongTruConfig.routePath)
    return null
  }

  const handleComplete = () => {
    if (isEditMode && diemCongTruId) {
      // After edit, go to detail view
      navigate(`${diemCongTruConfig.routePath}/${diemCongTruId}`)
    } else {
      // After create, go to list view
      navigate(diemCongTruConfig.routePath)
    }
  }

  const handleCancel = () => {
    // Check if there's a returnTo query param
    const searchParams = new URLSearchParams(location.search)
    const returnTo = searchParams.get('returnTo')

    if (returnTo === 'detail' && isEditMode && diemCongTruId) {
      // Return to detail view
      navigate(`${diemCongTruConfig.routePath}/${diemCongTruId}`)
    } else {
      // Return to list view
      navigate(diemCongTruConfig.routePath)
    }
  }

  return (
    <DiemCongTruFormView
      id={isEditMode ? diemCongTruId : undefined}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}
