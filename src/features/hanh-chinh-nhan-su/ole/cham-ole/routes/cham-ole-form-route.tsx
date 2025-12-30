/**
 * Chấm OLE Form Route
 * 
 * Route component for form view (create/edit)
 */

"use client"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { ChamOleFormView } from "../components/cham-ole-form-view"
import { chamOleConfig } from "../config"

export default function ChamOleFormRoute() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  // Check if it's "moi" (new) route by checking pathname
  const isNewMode = location.pathname.endsWith('/moi')
  
  // Determine if it's create or edit mode
  const isEditMode = !isNewMode && !!id
  const chamOleId = id ? Number(id) : undefined

  // Validate ID if in edit mode
  if (isEditMode && (!chamOleId || isNaN(chamOleId))) {
    navigate(chamOleConfig.routePath)
    return null
  }

  const handleComplete = () => {
    if (isEditMode && chamOleId) {
      // After edit, go to detail view
      navigate(`${chamOleConfig.routePath}/${chamOleId}`)
    } else {
      // After create, go to list view
      navigate(chamOleConfig.routePath)
    }
  }

  const handleCancel = () => {
    // Check if there's a returnTo query param
    const searchParams = new URLSearchParams(location.search)
    const returnTo = searchParams.get('returnTo')

    if (returnTo === 'detail' && isEditMode && chamOleId) {
      // Return to detail view
      navigate(`${chamOleConfig.routePath}/${chamOleId}`)
    } else {
      // Return to list view
      navigate(chamOleConfig.routePath)
    }
  }

  return (
    <ChamOleFormView
      id={isEditMode ? chamOleId : undefined}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}
