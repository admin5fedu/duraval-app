/**
 * Loại Phiếu List Route
 * 
 * Route component for list view
 */

"use client"

import { useNavigate } from "react-router-dom"
import { LoaiPhieuListView } from "../components/loai-phieu-list-view"
import { loaiPhieuConfig } from "../config"
import { LoaiPhieuHangMucTabs } from "../../components/loai-phieu-hang-muc-tabs"

export default function LoaiPhieuListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    // Add returnTo=list to return to list after save
    navigate(`${loaiPhieuConfig.routePath}/${id}/sua?returnTo=list`)
  }

  const handleAddNew = () => {
    navigate(`${loaiPhieuConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${loaiPhieuConfig.routePath}/${id}`)
  }

  return (
    <div className="flex flex-col h-full">
      <LoaiPhieuHangMucTabs />
      <div className="flex-1 overflow-hidden">
        <LoaiPhieuListView
          onEdit={handleEdit}
          onAddNew={handleAddNew}
          onView={handleView}
        />
      </div>
    </div>
  )
}

