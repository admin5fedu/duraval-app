/**
 * Phản Hồi Khách Hàng List Route
 * 
 * Route component for list view
 */

"use client"

import { useNavigate } from "react-router-dom"
import { PhanHoiKhachHangListView } from "../components/phan-hoi-khach-hang-list-view"
import { phanHoiKhachHangConfig } from "../config"

export default function PhanHoiKhachHangListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${phanHoiKhachHangConfig.routePath}/${id}/sua`)
  }

  const handleAddNew = () => {
    navigate(`${phanHoiKhachHangConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${phanHoiKhachHangConfig.routePath}/${id}`)
  }

  return (
    <PhanHoiKhachHangListView
      onEdit={handleEdit}
      onAddNew={handleAddNew}
      onView={handleView}
    />
  )
}

