/**
 * Nhóm chuyên đề List Route
 * 
 * Route component for list view
 */

"use client"

import { useNavigate } from "react-router-dom"
import { NhomChuyenDeListView } from "../components/nhom-chuyen-de-list-view"
import { nhomChuyenDeConfig } from "../config"
import { CacChuyenDeTabs } from "../../components/cac-chuyen-de-tabs"

export default function NhomChuyenDeListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${nhomChuyenDeConfig.routePath}/${id}/sua?returnTo=list`)
  }

  const handleAddNew = () => {
    navigate(`${nhomChuyenDeConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${nhomChuyenDeConfig.routePath}/${id}`)
  }

  return (
    <div className="flex flex-col h-full">
      <CacChuyenDeTabs />
      <div className="flex-1 overflow-hidden">
        <NhomChuyenDeListView
          onEdit={handleEdit}
          onAddNew={handleAddNew}
          onView={handleView}
        />
      </div>
    </div>
  )
}

