/**
 * Phiếu Hành Chính Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { PhieuHanhChinhDetailView } from "../components/phieu-hanh-chinh-detail-view"
import { phieuHanhChinhConfig } from "../config"

export default function PhieuHanhChinhDetailRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    navigate(phieuHanhChinhConfig.routePath)
    return null
  }

  const phieuId = Number(id)
  if (isNaN(phieuId)) {
    navigate(phieuHanhChinhConfig.routePath)
    return null
  }

  const handleEdit = () => {
    navigate(`${phieuHanhChinhConfig.routePath}/${id}/sua`)
  }

  const handleBack = () => {
    navigate(phieuHanhChinhConfig.routePath)
  }

  return (
    <PhieuHanhChinhDetailView
      id={phieuId}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}
