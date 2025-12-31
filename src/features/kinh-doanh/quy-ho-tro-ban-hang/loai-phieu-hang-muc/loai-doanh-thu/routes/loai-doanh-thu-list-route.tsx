/**
 * Loại Doanh Thu List Route
 * 
 * Route component for list view
 */

"use client"

import { useNavigate } from "react-router-dom"
import { LoaiDoanhThuListView } from "../components/loai-doanh-thu-list-view"
import { loaiDoanhThuConfig } from "../config"
import { LoaiPhieuHangMucTabs } from "../../components/loai-phieu-hang-muc-tabs"

export default function LoaiDoanhThuListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    // Add returnTo=list to return to list after save
    navigate(`${loaiDoanhThuConfig.routePath}/${id}/sua?returnTo=list`)
  }

  const handleAddNew = () => {
    navigate(`${loaiDoanhThuConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${loaiDoanhThuConfig.routePath}/${id}`)
  }

  return (
    <div className="flex flex-col h-full">
      <LoaiPhieuHangMucTabs />
      <div className="flex-1 overflow-hidden">
        <LoaiDoanhThuListView
          onEdit={handleEdit}
          onAddNew={handleAddNew}
          onView={handleView}
        />
      </div>
    </div>
  )
}

