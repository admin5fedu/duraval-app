/**
 * Loại Doanh Thu Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { LoaiDoanhThuDetailView } from "../components/loai-doanh-thu-detail-view"
import { loaiDoanhThuConfig } from "../config"

export default function LoaiDoanhThuDetailRoute() {
  const params = useParams<{ id: string }>()
  const navigate = useNavigate()
  const id = params.id ? parseInt(params.id, 10) : undefined

  if (!id || isNaN(id)) {
    navigate(loaiDoanhThuConfig.routePath)
    return null
  }

  const handleEdit = () => {
    // Navigate to edit with returnTo=detail to return to detail after save
    navigate(`${loaiDoanhThuConfig.routePath}/${id}/sua?returnTo=detail`)
  }

  const handleBack = () => {
    navigate(loaiDoanhThuConfig.routePath)
  }

  return (
    <LoaiDoanhThuDetailView
      id={id}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}

