/**
 * Phòng Ban Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { PhongBanDetailView } from "../components/phong-ban-detail-view"
import { phongBanConfig } from "../config"

export default function PhongBanDetailRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    navigate(phongBanConfig.routePath)
    return null
  }

  const phongBanId = Number(id)
  if (isNaN(phongBanId)) {
    navigate(phongBanConfig.routePath)
    return null
  }

  const handleEdit = () => {
    navigate(`${phongBanConfig.routePath}/${id}/sua`)
  }

  const handleBack = () => {
    navigate(phongBanConfig.routePath)
  }

  return (
    <PhongBanDetailView
      id={phongBanId}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}

