/**
 * Phiếu đề xuất bán hàng List Route
 * 
 * Route component for list view
 */

"use client"

import { useNavigate } from "react-router-dom"
import { PhieuDeXuatBanHangListView } from "../components/phieu-de-xuat-ban-hang-list-view"
import { phieuDeXuatBanHangConfig } from "../config"

export default function PhieuDeXuatBanHangListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${phieuDeXuatBanHangConfig.routePath}/${id}/sua?returnTo=list`)
  }

  const handleAddNew = () => {
    navigate(`${phieuDeXuatBanHangConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${phieuDeXuatBanHangConfig.routePath}/${id}`)
  }

  return (
    <PhieuDeXuatBanHangListView
      onEdit={handleEdit}
      onAddNew={handleAddNew}
      onView={handleView}
    />
  )
}

