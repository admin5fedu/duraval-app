/**
 * Kỳ thi Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { KyThiDetailView } from "../components/ky-thi-detail-view"

export default function KyThiDetailRoute() {
  const params = useParams()
  const navigate = useNavigate()
  
  // Extract id from params
  const id = params.id ? parseInt(params.id, 10) : 0

  if (!id || isNaN(id)) {
    navigate("/cong-viec/ky-thi")
    return null
  }

  const handleEdit = () => {
    navigate(`/cong-viec/ky-thi/${id}/sua?returnTo=detail`)
  }

  const handleBack = () => {
    navigate("/cong-viec/ky-thi")
  }

  return (
    <KyThiDetailView
      id={id}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}

