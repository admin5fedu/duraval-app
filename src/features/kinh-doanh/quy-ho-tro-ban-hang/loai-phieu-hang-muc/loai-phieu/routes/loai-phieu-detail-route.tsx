/**
 * Loại Phiếu Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { LoaiPhieuDetailView } from "../components/loai-phieu-detail-view"
import { loaiPhieuConfig } from "../config"

export default function LoaiPhieuDetailRoute() {
  const params = useParams<{ id: string }>()
  const navigate = useNavigate()
  const id = params.id ? parseInt(params.id, 10) : undefined

  if (!id || isNaN(id)) {
    navigate(loaiPhieuConfig.routePath)
    return null
  }

  const handleEdit = () => {
    // Navigate to edit with returnTo=detail to return to detail after save
    navigate(`${loaiPhieuConfig.routePath}/${id}/sua?returnTo=detail`)
  }

  const handleBack = () => {
    navigate(loaiPhieuConfig.routePath)
  }

  return (
    <LoaiPhieuDetailView
      id={id}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}
