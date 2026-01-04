"use client"

import { MucDangKyListView } from "../components"
import { ThietLapKhachBuonTabs } from "../../components/thiet-lap-khach-buon-tabs"

export default function MucDangKyListRoute() {
  return (
    <>
      <ThietLapKhachBuonTabs />
      <MucDangKyListView />
    </>
  )
}

