/**
 * Phản Hồi Khách Hàng Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { PhanHoiKhachHangDetailView } from "../components/phan-hoi-khach-hang-detail-view"
import { phanHoiKhachHangConfig } from "../config"

export default function PhanHoiKhachHangDetailRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    navigate(phanHoiKhachHangConfig.routePath)
    return null
  }

  const phanHoiId = Number(id)
  if (isNaN(phanHoiId)) {
    navigate(phanHoiKhachHangConfig.routePath)
    return null
  }

  const handleEdit = () => {
    navigate(`${phanHoiKhachHangConfig.routePath}/${id}/sua?returnTo=detail`)
  }

  const handleBack = () => {
    navigate(phanHoiKhachHangConfig.routePath)
  }

  return (
    <PhanHoiKhachHangDetailView
      id={phanHoiId}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}

