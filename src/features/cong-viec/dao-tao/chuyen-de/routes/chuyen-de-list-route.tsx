/**
 * Chuyên đề List Route
 * 
 * Route component for list view
 */

"use client"

import { useNavigate } from "react-router-dom"
import { ChuyenDeListView } from "../components/chuyen-de-list-view"
import { chuyenDeConfig } from "../config"
import { CacChuyenDeTabs } from "../../components/cac-chuyen-de-tabs"

export default function ChuyenDeListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${chuyenDeConfig.routePath}/${id}/sua?returnTo=list`)
  }

  const handleAddNew = () => {
    navigate(`${chuyenDeConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${chuyenDeConfig.routePath}/${id}`)
  }

  return (
    <div className="flex flex-col h-full">
      <CacChuyenDeTabs />
      <div className="flex-1 overflow-hidden">
        <ChuyenDeListView
          onEdit={handleEdit}
          onAddNew={handleAddNew}
          onView={handleView}
        />
      </div>
    </div>
  )
}

