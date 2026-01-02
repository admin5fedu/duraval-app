"use client"

import { useNavigate } from "react-router-dom"
import { TinhThanhTruocSatNhapTabs } from "../../components/tinh-thanh-truoc-sat-nhap-tabs"
import { QuanHuyenTSNListView } from "../components/quan-huyen-tsn-list-view"
import { quanHuyenTSNConfig } from "../config"

export default function QuanHuyenTSNListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${quanHuyenTSNConfig.routePath}/${id}/sua?returnTo=list`)
  }

  const handleAddNew = () => {
    navigate(`${quanHuyenTSNConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${quanHuyenTSNConfig.routePath}/${id}`)
  }

  return (
    <div className="flex flex-col h-full">
      <TinhThanhTruocSatNhapTabs />
      <div className="flex-1 overflow-hidden">
        <QuanHuyenTSNListView
          onEdit={handleEdit}
          onAddNew={handleAddNew}
          onView={handleView}
        />
      </div>
    </div>
  )
}

