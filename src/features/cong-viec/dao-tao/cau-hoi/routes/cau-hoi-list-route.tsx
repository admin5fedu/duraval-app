/**
 * Câu hỏi List Route
 * 
 * Route component for list view
 */

"use client"

import { useNavigate } from "react-router-dom"
import { CauHoiListView } from "../components/cau-hoi-list-view"
import { cauHoiConfig } from "../config"
import { CacChuyenDeTabs } from "../../components/cac-chuyen-de-tabs"

export default function CauHoiListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${cauHoiConfig.routePath}/${id}/sua?returnTo=list`)
  }

  const handleAddNew = () => {
    navigate(`${cauHoiConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${cauHoiConfig.routePath}/${id}`)
  }

  return (
    <div className="flex flex-col h-full">
      <CacChuyenDeTabs />
      <div className="flex-1 overflow-hidden">
        <CauHoiListView
          onEdit={handleEdit}
          onAddNew={handleAddNew}
          onView={handleView}
        />
      </div>
    </div>
  )
}

