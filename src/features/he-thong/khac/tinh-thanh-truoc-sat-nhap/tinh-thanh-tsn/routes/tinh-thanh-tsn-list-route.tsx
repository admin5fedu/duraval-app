/**
 * Tỉnh thành TSN List Route
 * 
 * Route component for list view
 */

"use client"

import { useNavigate } from "react-router-dom"
import { TinhThanhTSNListView } from "../components/tinh-thanh-tsn-list-view"
import { tinhThanhTSNConfig } from "../config"
import { TinhThanhTruocSatNhapTabs } from "../../components/tinh-thanh-truoc-sat-nhap-tabs"

export default function TinhThanhTSNListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${tinhThanhTSNConfig.routePath}/${id}/sua?returnTo=list`)
  }

  const handleAddNew = () => {
    navigate(`${tinhThanhTSNConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${tinhThanhTSNConfig.routePath}/${id}`)
  }

  return (
    <div className="flex flex-col h-full">
      <TinhThanhTruocSatNhapTabs />
      <div className="flex-1 overflow-hidden">
        <TinhThanhTSNListView
          onEdit={handleEdit}
          onAddNew={handleAddNew}
          onView={handleView}
        />
      </div>
    </div>
  )
}

