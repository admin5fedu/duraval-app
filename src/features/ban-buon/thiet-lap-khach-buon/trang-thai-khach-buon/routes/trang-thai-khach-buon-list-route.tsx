/**
 * Trạng Thái Khách Buôn List Route
 * 
 * Route component for list view
 */

"use client"

import { useNavigate } from "react-router-dom"
import { TrangThaiKhachBuonListView } from "../components/trang-thai-khach-buon-list-view"
import { trangThaiKhachBuonConfig } from "../config"
import { ThietLapKhachBuonTabs } from "../../components/thiet-lap-khach-buon-tabs"

export default function TrangThaiKhachBuonListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${trangThaiKhachBuonConfig.routePath}/${id}/sua?returnTo=list`)
  }

  const handleAddNew = () => {
    navigate(`${trangThaiKhachBuonConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${trangThaiKhachBuonConfig.routePath}/${id}`)
  }

  return (
    <div className="flex flex-col h-full">
      <ThietLapKhachBuonTabs />
      <div className="flex-1 overflow-hidden">
        <TrangThaiKhachBuonListView
          onEdit={handleEdit}
          onAddNew={handleAddNew}
          onView={handleView}
        />
      </div>
    </div>
  )
}

