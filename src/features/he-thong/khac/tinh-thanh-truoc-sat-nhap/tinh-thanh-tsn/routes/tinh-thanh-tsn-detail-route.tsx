/**
 * Tỉnh thành TSN Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { TinhThanhTSNDetailView } from "../components/tinh-thanh-tsn-detail-view"

export default function TinhThanhTSNDetailRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    return <div>ID không hợp lệ</div>
  }

  const numericId = parseInt(id, 10)
  if (isNaN(numericId)) {
    return <div>ID không hợp lệ</div>
  }

  const handleEdit = () => {
    navigate(`/he-thong/tinh-thanh-tsn/${numericId}/sua?returnTo=detail`)
  }

  const handleBack = () => {
    navigate("/he-thong/tinh-thanh-tsn")
  }

  return (
    <TinhThanhTSNDetailView
      id={numericId}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}

