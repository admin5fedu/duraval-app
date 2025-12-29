/**
 * Nhóm Điểm Cộng Trừ Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { NhomDiemCongTruDetailView } from "../components/nhom-diem-cong-tru-detail-view"
import { nhomDiemCongTruConfig } from "../config"

export default function NhomDiemCongTruDetailRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    navigate(nhomDiemCongTruConfig.routePath)
    return null
  }

  const nhomDiemId = Number(id)
  if (isNaN(nhomDiemId)) {
    navigate(nhomDiemCongTruConfig.routePath)
    return null
  }

  const handleEdit = () => {
    navigate(`${nhomDiemCongTruConfig.routePath}/${id}/sua?returnTo=detail`)
  }

  const handleBack = () => {
    navigate(nhomDiemCongTruConfig.routePath)
  }

  return (
    <NhomDiemCongTruDetailView
      id={nhomDiemId}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}
