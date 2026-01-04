/**
 * Trạng Thái Khách Buôn Form Route
 * 
 * Route component for create/edit form view
 */

"use client"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { TrangThaiKhachBuonFormView } from "../components/trang-thai-khach-buon-form-view"
import { trangThaiKhachBuonConfig } from "../config"

export default function TrangThaiKhachBuonFormRoute() {
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
    navigate(trangThaiKhachBuonConfig.routePath)
    return null
  }

  const handleComplete = () => {
    // Check if there's a returnTo query param
    const searchParams = new URLSearchParams(location.search)
    const returnTo = searchParams.get('returnTo')

    if (returnTo === 'list') {
      navigate(trangThaiKhachBuonConfig.routePath)
    } else if (returnTo === 'detail' && isEditMode && id) {
      navigate(`${trangThaiKhachBuonConfig.routePath}/${id}`)
    } else if (isEditMode && id) {
      navigate(`${trangThaiKhachBuonConfig.routePath}/${id}`)
    } else {
      navigate(trangThaiKhachBuonConfig.routePath)
    }
  }

  const handleCancel = () => {
    // Check if there's a returnTo query param
    const searchParams = new URLSearchParams(location.search)
    const returnTo = searchParams.get('returnTo')

    if (returnTo === 'detail' && isEditMode && id) {
      navigate(`${trangThaiKhachBuonConfig.routePath}/${id}`)
    } else {
      navigate(trangThaiKhachBuonConfig.routePath)
    }
  }

  return (
    <TrangThaiKhachBuonFormView
      id={isEditMode ? id : undefined}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}

