/**
 * Trục Hạt Form Route
 * 
 * Route component for form view (create/edit)
 */

"use client"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { TrucHatFormView } from "../components/truc-hat-form-view"
import { trucHatConfig } from "../config"

export default function TrucHatFormRoute() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  const isNewMode = location.pathname.endsWith('/moi')
  const isEditMode = !isNewMode && !!id
  const trucHatId = id ? Number(id) : undefined

  if (isEditMode && (!trucHatId || isNaN(trucHatId))) {
    navigate(trucHatConfig.routePath)
    return null
  }

  const handleComplete = () => {
    if (isEditMode && trucHatId) {
      navigate(`${trucHatConfig.routePath}/${trucHatId}`)
    } else {
      navigate(trucHatConfig.routePath)
    }
  }

  const handleCancel = () => {
    const searchParams = new URLSearchParams(location.search)
    const returnTo = searchParams.get('returnTo')

    if (returnTo === 'detail' && isEditMode && trucHatId) {
      navigate(`${trucHatConfig.routePath}/${trucHatId}`)
    } else {
      navigate(trucHatConfig.routePath)
    }
  }

  return (
    <TrucHatFormView
      id={isEditMode ? trucHatId : undefined}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}

