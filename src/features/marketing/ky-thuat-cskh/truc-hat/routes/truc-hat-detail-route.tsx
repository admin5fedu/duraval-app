/**
 * Trục Hạt Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { TrucHatDetailView } from "../components/truc-hat-detail-view"
import { trucHatConfig } from "../config"

export default function TrucHatDetailRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    navigate(trucHatConfig.routePath)
    return null
  }

  const trucHatId = Number(id)
  if (isNaN(trucHatId)) {
    navigate(trucHatConfig.routePath)
    return null
  }

  const handleEdit = () => {
    navigate(`${trucHatConfig.routePath}/${id}/sua?returnTo=detail`)
  }

  const handleBack = () => {
    navigate(trucHatConfig.routePath)
  }

  return (
    <TrucHatDetailView
      id={trucHatId}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}

