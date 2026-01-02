/**
 * Tỉnh thành SSN Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { TinhThanhSSNDetailView } from "../components/tinh-thanh-ssn-detail-view"

export default function TinhThanhSSNDetailRoute() {
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
    navigate(`/he-thong/tinh-thanh-ssn/${numericId}/sua?returnTo=detail`)
  }

  const handleBack = () => {
    navigate("/he-thong/tinh-thanh-ssn")
  }

  return (
    <TinhThanhSSNDetailView
      id={numericId}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}

