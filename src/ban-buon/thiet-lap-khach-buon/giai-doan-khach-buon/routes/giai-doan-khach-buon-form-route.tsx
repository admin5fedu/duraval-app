/**
 * Giai Đoạn Khách Buôn Form Route
 * 
 * Route component for create/edit form view
 */

"use client"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { GiaiDoanKhachBuonFormView } from "../components/giai-doan-khach-buon-form-view"
import { giaiDoanKhachBuonConfig } from "../config"

export default function GiaiDoanKhachBuonFormRoute() {
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
    navigate(giaiDoanKhachBuonConfig.routePath)
    return null
  }

  const handleComplete = () => {
    // Check if there's a returnTo query param
    const searchParams = new URLSearchParams(location.search)
    const returnTo = searchParams.get('returnTo')

    if (returnTo === 'list') {
      navigate(giaiDoanKhachBuonConfig.routePath)
    } else if (returnTo === 'detail' && isEditMode && id) {
      navigate(`${giaiDoanKhachBuonConfig.routePath}/${id}`)
    } else if (isEditMode && id) {
      navigate(`${giaiDoanKhachBuonConfig.routePath}/${id}`)
    } else {
      navigate(giaiDoanKhachBuonConfig.routePath)
    }
  }

  const handleCancel = () => {
    // Check if there's a returnTo query param
    const searchParams = new URLSearchParams(location.search)
    const returnTo = searchParams.get('returnTo')

    if (returnTo === 'detail' && isEditMode && id) {
      navigate(`${giaiDoanKhachBuonConfig.routePath}/${id}`)
    } else {
      navigate(giaiDoanKhachBuonConfig.routePath)
    }
  }

  return (
    <GiaiDoanKhachBuonFormView
      id={isEditMode ? id : undefined}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}

