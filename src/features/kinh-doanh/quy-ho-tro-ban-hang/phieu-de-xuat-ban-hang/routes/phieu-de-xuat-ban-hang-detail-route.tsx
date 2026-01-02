/**
 * Phiếu đề xuất bán hàng Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { PhieuDeXuatBanHangDetailView } from "../components/phieu-de-xuat-ban-hang-detail-view"
import { phieuDeXuatBanHangConfig } from "../config"

export default function PhieuDeXuatBanHangDetailRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    return <div>ID không hợp lệ</div>
  }

  const handleEdit = () => {
    navigate(`${phieuDeXuatBanHangConfig.routePath}/${id}/sua`)
  }

  const handleBack = () => {
    navigate(phieuDeXuatBanHangConfig.routePath)
  }

  return (
    <PhieuDeXuatBanHangDetailView
      id={Number(id)}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}

