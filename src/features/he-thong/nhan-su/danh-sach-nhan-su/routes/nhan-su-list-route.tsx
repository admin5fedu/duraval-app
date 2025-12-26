/**
 * Nhân Sự List Route
 * 
 * Route component for list view
 */

"use client"

import { useNavigate } from "react-router-dom"
import { NhanSuListView } from "../components/nhan-su-list-view"
import { nhanSuConfig } from "../config"

export default function NhanSuListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${nhanSuConfig.routePath}/${id}/sua`)
  }

  const handleAddNew = () => {
    navigate(`${nhanSuConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${nhanSuConfig.routePath}/${id}`)
  }

  return (
    <NhanSuListView
      onEdit={handleEdit}
      onAddNew={handleAddNew}
      onView={handleView}
    />
  )
}

