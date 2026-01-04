/**
 * Trạng Thái Khách Buôn Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { TrangThaiKhachBuonDetailView } from "../components/trang-thai-khach-buon-detail-view"
import { trangThaiKhachBuonConfig } from "../config"

export default function TrangThaiKhachBuonDetailRoute() {
  const params = useParams<{ id: string }>()
  const navigate = useNavigate()
  const id = params.id ? parseInt(params.id, 10) : undefined

  if (!id || isNaN(id)) {
    navigate(trangThaiKhachBuonConfig.routePath)
    return null
  }

  const handleEdit = () => {
    navigate(`${trangThaiKhachBuonConfig.routePath}/${id}/sua?returnTo=detail`)
  }

  const handleBack = () => {
    navigate(trangThaiKhachBuonConfig.routePath)
  }

  return (
    <TrangThaiKhachBuonDetailView
      id={id}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}

