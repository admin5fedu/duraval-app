/**
 * Chuyên đề Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { ChuyenDeDetailView } from "../components/chuyen-de-detail-view"

export default function ChuyenDeDetailRoute() {
  const params = useParams()
  const navigate = useNavigate()
  
  // Extract id from params
  const id = params.id ? parseInt(params.id, 10) : 0

  if (!id || isNaN(id)) {
    navigate("/cong-viec/chuyen-de")
    return null
  }

  const handleEdit = () => {
    navigate(`/cong-viec/chuyen-de/${id}/sua?returnTo=detail`)
  }

  const handleBack = () => {
    navigate("/cong-viec/chuyen-de")
  }

  return (
    <ChuyenDeDetailView
      id={id}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}

