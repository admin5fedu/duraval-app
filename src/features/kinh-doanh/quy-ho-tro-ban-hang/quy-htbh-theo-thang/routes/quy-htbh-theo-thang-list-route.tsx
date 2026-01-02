/**
 * Quỹ HTBH theo tháng List Route
 * 
 * Route component for list view
 */

"use client"

import { useNavigate } from "react-router-dom"
import { QuyHTBHTheoThangListView } from "../components/quy-htbh-theo-thang-list-view"
import { quyHTBHTheoThangConfig } from "../config"
import { QuyHoTroBanHangTabs } from "../../quy-ho-tro-ban-hang/components/quy-ho-tro-ban-hang-tabs"

export default function QuyHTBHTheoThangListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${quyHTBHTheoThangConfig.routePath}/${id}/sua?returnTo=list`)
  }

  const handleAddNew = () => {
    navigate(`${quyHTBHTheoThangConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${quyHTBHTheoThangConfig.routePath}/${id}`)
  }

  return (
    <div className="flex flex-col h-full">
      <QuyHoTroBanHangTabs />
      <div className="flex-1 overflow-hidden">
        <QuyHTBHTheoThangListView
          onEdit={handleEdit}
          onAddNew={handleAddNew}
          onView={handleView}
        />
      </div>
    </div>
  )
}

