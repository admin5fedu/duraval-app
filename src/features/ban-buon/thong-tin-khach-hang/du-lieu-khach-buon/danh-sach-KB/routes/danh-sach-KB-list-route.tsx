"use client"

import { DanhSachKBListView } from "../components/danh-sach-KB-list-view"
import { ThongTinKhachHangTabs } from "../../components/thong-tin-khach-hang-tabs"

export default function DanhSachKBListRoute() {
  return (
    <>
      <ThongTinKhachHangTabs />
      <DanhSachKBListView />
    </>
  )
}

