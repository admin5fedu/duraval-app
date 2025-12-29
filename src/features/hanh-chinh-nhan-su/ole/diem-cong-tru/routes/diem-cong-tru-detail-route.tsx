/**
 * Điểm Cộng Trừ Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { DiemCongTruDetailView } from "../components/diem-cong-tru-detail-view"
import { diemCongTruConfig } from "../config"

export default function DiemCongTruDetailRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    navigate(diemCongTruConfig.routePath)
    return null
  }

  const diemCongTruId = Number(id)
  if (isNaN(diemCongTruId)) {
    navigate(diemCongTruConfig.routePath)
    return null
  }

  const handleEdit = () => {
    navigate(`${diemCongTruConfig.routePath}/${id}/sua?returnTo=detail`)
  }

  const handleBack = () => {
    navigate(diemCongTruConfig.routePath)
  }

  return (
    <DiemCongTruDetailView
      id={diemCongTruId}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}
