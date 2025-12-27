/**
 * Chi Nhánh Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { ChiNhanhDetailView } from "../components/chi-nhanh-detail-view"
import { chiNhanhConfig } from "../config"

export default function ChiNhanhDetailRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    navigate(chiNhanhConfig.routePath)
    return null
  }

  const chiNhanhId = Number(id)
  if (isNaN(chiNhanhId)) {
    navigate(chiNhanhConfig.routePath)
    return null
  }

  const handleEdit = () => {
    navigate(`${chiNhanhConfig.routePath}/${id}/sua`)
  }

  const handleBack = () => {
    navigate(chiNhanhConfig.routePath)
  }

  return (
    <ChiNhanhDetailView
      id={chiNhanhId}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}

