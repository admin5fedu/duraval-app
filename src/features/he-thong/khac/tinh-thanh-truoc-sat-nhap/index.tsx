/**
 * Hệ Thống - Khác - Tỉnh thành trước sát nhập Module
 * Module có 3 tab: Tỉnh thành TSN, Quận huyện TSN, Phường xã TSN
 * 
 * Note: Routes được handle riêng trong routes.tsx
 * File này chỉ dùng cho direct navigation đến module, redirect đến list route
 */

"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function TinhThanhTruocSatNhapPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to list route
    navigate("/he-thong/tinh-thanh-tsn", { replace: true })
  }, [navigate])

  return null
}

