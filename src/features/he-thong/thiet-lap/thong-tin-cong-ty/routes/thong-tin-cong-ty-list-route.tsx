/**
 * Thông Tin Công Ty List Route
 * 
 * Route component for list view
 */

"use client"

import { useNavigate } from "react-router-dom"
import { ThongTinCongTyListView } from "../components/thong-tin-cong-ty-list-view"
import { thongTinCongTyConfig } from "../config"

export default function ThongTinCongTyListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${thongTinCongTyConfig.routePath}/${id}/sua`)
  }

  const handleAddNew = () => {
    navigate(`${thongTinCongTyConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${thongTinCongTyConfig.routePath}/${id}`)
  }

  return (
    <ThongTinCongTyListView
      onEdit={handleEdit}
      onAddNew={handleAddNew}
      onView={handleView}
    />
  )
}

