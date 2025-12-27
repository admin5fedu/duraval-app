/**
 * Người Thân Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { NguoiThanDetailView } from "../components/nguoi-than-detail-view"
import { nguoiThanConfig } from "../config"

export default function NguoiThanDetailRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    navigate(nguoiThanConfig.routePath)
    return null
  }

  const nguoiThanId = Number(id)
  if (isNaN(nguoiThanId)) {
    navigate(nguoiThanConfig.routePath)
    return null
  }

  const handleEdit = () => {
    navigate(`${nguoiThanConfig.routePath}/${id}/sua`)
  }

  const handleBack = () => {
    navigate(nguoiThanConfig.routePath)
  }

  return (
    <NguoiThanDetailView
      id={nguoiThanId}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}

