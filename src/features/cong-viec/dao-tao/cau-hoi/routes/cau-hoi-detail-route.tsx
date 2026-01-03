/**
 * Câu hỏi Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { CauHoiDetailView } from "../components/cau-hoi-detail-view"

export default function CauHoiDetailRoute() {
  const params = useParams()
  const navigate = useNavigate()
  
  // Extract id from params
  const id = params.id ? parseInt(params.id, 10) : 0

  if (!id || isNaN(id)) {
    navigate("/cong-viec/cau-hoi")
    return null
  }

  const handleEdit = () => {
    navigate(`/cong-viec/cau-hoi/${id}/sua?returnTo=detail`)
  }

  const handleBack = () => {
    navigate("/cong-viec/cau-hoi")
  }

  return (
    <CauHoiDetailView
      id={id}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}

