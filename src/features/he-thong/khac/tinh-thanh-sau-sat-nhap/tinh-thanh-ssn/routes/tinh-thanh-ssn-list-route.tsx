/**
 * Tỉnh thành SSN List Route
 * 
 * Route component for list view
 */

"use client"

import { useNavigate } from "react-router-dom"
import { TinhThanhSSNListView } from "../components/tinh-thanh-ssn-list-view"
import { tinhThanhSSNConfig } from "../config"
import { TinhThanhSauSatNhapTabs } from "../../components/tinh-thanh-sau-sat-nhap-tabs"

export default function TinhThanhSSNListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${tinhThanhSSNConfig.routePath}/${id}/sua?returnTo=list`)
  }

  const handleAddNew = () => {
    navigate(`${tinhThanhSSNConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${tinhThanhSSNConfig.routePath}/${id}`)
  }

  return (
    <div className="flex flex-col h-full">
      <TinhThanhSauSatNhapTabs />
      <div className="flex-1 overflow-hidden">
        <TinhThanhSSNListView
          onEdit={handleEdit}
          onAddNew={handleAddNew}
          onView={handleView}
        />
      </div>
    </div>
  )
}

