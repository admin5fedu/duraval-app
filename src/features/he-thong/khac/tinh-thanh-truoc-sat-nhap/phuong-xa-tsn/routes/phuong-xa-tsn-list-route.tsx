"use client"

import { useNavigate } from "react-router-dom"
import { TinhThanhTruocSatNhapTabs } from "../../components/tinh-thanh-truoc-sat-nhap-tabs"
import { PhuongXaTSNListView } from "../components/phuong-xa-tsn-list-view"
import { phuongXaTSNConfig } from "../config"

export default function PhuongXaTSNListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${phuongXaTSNConfig.routePath}/${id}/sua?returnTo=list`)
  }

  const handleAddNew = () => {
    navigate(`${phuongXaTSNConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${phuongXaTSNConfig.routePath}/${id}`)
  }

  return (
    <div className="flex flex-col h-full">
      <TinhThanhTruocSatNhapTabs />
      <div className="flex-1 overflow-hidden">
        <PhuongXaTSNListView
          onEdit={handleEdit}
          onAddNew={handleAddNew}
          onView={handleView}
        />
      </div>
    </div>
  )
}

