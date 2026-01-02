/**
 * Phường xã SNN List Route
 * 
 * Route component for list view
 */

"use client"

import { useNavigate } from "react-router-dom"
import { PhuongXaSNNListView } from "../components/phuong-xa-snn-list-view"
import { phuongXaSNNConfig } from "../config"
import { TinhThanhSauSatNhapTabs } from "../../components/tinh-thanh-sau-sat-nhap-tabs"

export default function PhuongXaSNNListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${phuongXaSNNConfig.routePath}/${id}/sua?returnTo=list`)
  }

  const handleAddNew = () => {
    navigate(`${phuongXaSNNConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${phuongXaSNNConfig.routePath}/${id}`)
  }

  return (
    <div className="flex flex-col h-full">
      <TinhThanhSauSatNhapTabs />
      <div className="flex-1 overflow-hidden">
        <PhuongXaSNNListView
          onEdit={handleEdit}
          onAddNew={handleAddNew}
          onView={handleView}
        />
      </div>
    </div>
  )
}

