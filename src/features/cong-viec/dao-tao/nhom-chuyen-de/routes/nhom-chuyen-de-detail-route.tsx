/**
 * Nhóm chuyên đề Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { NhomChuyenDeDetailView } from "../components/nhom-chuyen-de-detail-view"

export default function NhomChuyenDeDetailRoute() {
  const params = useParams()
  const navigate = useNavigate()
  
  // Extract id from params
  const id = params.id ? parseInt(params.id, 10) : 0

  if (!id || isNaN(id)) {
    navigate("/cong-viec/nhom-chuyen-de")
    return null
  }

  const handleEdit = () => {
    navigate(`/cong-viec/nhom-chuyen-de/${id}/sua?returnTo=detail`)
  }

  const handleBack = () => {
    navigate("/cong-viec/nhom-chuyen-de")
  }

  return (
    <NhomChuyenDeDetailView
      id={id}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}

