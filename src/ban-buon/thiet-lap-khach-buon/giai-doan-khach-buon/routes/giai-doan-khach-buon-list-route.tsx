/**
 * Giai Đoạn Khách Buôn List Route
 * 
 * Route component for list view
 */

"use client"

import { useNavigate } from "react-router-dom"
import { GiaiDoanKhachBuonListView } from "../components/giai-doan-khach-buon-list-view"
import { giaiDoanKhachBuonConfig } from "../config"

export default function GiaiDoanKhachBuonListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${giaiDoanKhachBuonConfig.routePath}/${id}/sua?returnTo=list`)
  }

  const handleAddNew = () => {
    navigate(`${giaiDoanKhachBuonConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${giaiDoanKhachBuonConfig.routePath}/${id}`)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <GiaiDoanKhachBuonListView
          onEdit={handleEdit}
          onAddNew={handleAddNew}
          onView={handleView}
        />
      </div>
    </div>
  )
}

