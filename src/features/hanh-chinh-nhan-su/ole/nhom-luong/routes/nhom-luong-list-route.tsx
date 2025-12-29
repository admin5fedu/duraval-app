/**
 * Nhóm Lương List Route
 * 
 * Route component for list view
 */

"use client"

import { useNavigate } from "react-router-dom"
import { NhomLuongListView } from "../components/nhom-luong-list-view"
import { nhomLuongConfig } from "../config"

export default function NhomLuongListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${nhomLuongConfig.routePath}/${id}/sua`)
  }

  const handleAddNew = () => {
    navigate(`${nhomLuongConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${nhomLuongConfig.routePath}/${id}`)
  }

  return (
    <NhomLuongListView
      onEdit={handleEdit}
      onAddNew={handleAddNew}
      onView={handleView}
    />
  )
}

