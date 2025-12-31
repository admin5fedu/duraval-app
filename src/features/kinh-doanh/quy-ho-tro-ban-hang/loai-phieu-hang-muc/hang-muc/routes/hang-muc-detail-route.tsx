/**
 * Hạng Mục Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { HangMucDetailView } from "../components/hang-muc-detail-view"
import { hangMucConfig } from "../config"

export default function HangMucDetailRoute() {
  const params = useParams<{ id: string }>()
  const navigate = useNavigate()
  const id = params.id ? parseInt(params.id, 10) : undefined

  if (!id || isNaN(id)) {
    navigate(hangMucConfig.routePath)
    return null
  }

  const handleEdit = () => {
    // Navigate to edit with returnTo=detail to return to detail after save
    navigate(`${hangMucConfig.routePath}/${id}/sua?returnTo=detail`)
  }

  const handleBack = () => {
    navigate(hangMucConfig.routePath)
  }

  return (
    <HangMucDetailView
      id={id}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}

