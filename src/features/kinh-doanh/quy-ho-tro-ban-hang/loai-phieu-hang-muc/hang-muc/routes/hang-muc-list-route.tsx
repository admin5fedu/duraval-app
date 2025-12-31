/**
 * Hạng Mục List Route
 * 
 * Route component for list view
 */

"use client"

import { useNavigate } from "react-router-dom"
import { HangMucListView } from "../components/hang-muc-list-view"
import { hangMucConfig } from "../config"
import { LoaiPhieuHangMucTabs } from "../../components/loai-phieu-hang-muc-tabs"

export default function HangMucListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    // Add returnTo=list to return to list after save
    navigate(`${hangMucConfig.routePath}/${id}/sua?returnTo=list`)
  }

  const handleAddNew = () => {
    navigate(`${hangMucConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${hangMucConfig.routePath}/${id}`)
  }

  return (
    <div className="flex flex-col h-full">
      <LoaiPhieuHangMucTabs />
      <div className="flex-1 overflow-hidden">
        <HangMucListView
          onEdit={handleEdit}
          onAddNew={handleAddNew}
          onView={handleView}
        />
      </div>
    </div>
  )
}

