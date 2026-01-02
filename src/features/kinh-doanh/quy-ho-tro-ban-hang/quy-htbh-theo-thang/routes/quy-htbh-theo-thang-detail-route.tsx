/**
 * Quỹ HTBH theo tháng Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { QuyHTBHTheoThangDetailView } from "../components/quy-htbh-theo-thang-detail-view"
import { quyHTBHTheoThangConfig } from "../config"

export default function QuyHTBHTheoThangDetailRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    return <div>ID không hợp lệ</div>
  }

  const handleEdit = () => {
    navigate(`${quyHTBHTheoThangConfig.routePath}/${id}/sua`)
  }

  const handleBack = () => {
    navigate(quyHTBHTheoThangConfig.routePath)
  }

  return (
    <QuyHTBHTheoThangDetailView
      id={Number(id)}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}

