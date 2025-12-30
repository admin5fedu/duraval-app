"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { PhanQuyenAPI } from "@/features/he-thong/thiet-lap/phan-quyen/services/phan-quyen.api"
import { useAuthStore } from "@/shared/stores/auth-store"
import { diemCongTruConfig } from "../config"

/**
 * Hook để kiểm tra quyền quản trị cho module Điểm cộng trừ
 */
export function useCheckQuyenQuanTri() {
  const { employee } = useAuthStore()
  const moduleId = diemCongTruConfig.moduleName // "diem-cong-tru"

  // Fetch phân quyền theo chuc_vu_id nếu có
  const { data: phanQuyenList } = useQuery({
    queryKey: ["phan-quyen", "chuc-vu", employee?.chuc_vu_id],
    queryFn: () => {
      if (!employee?.chuc_vu_id) return []
      return PhanQuyenAPI.getByChucVuId(employee.chuc_vu_id)
    },
    enabled: !!employee?.chuc_vu_id,
  })

  // Kiểm tra xem có quyền quản trị không
  const hasQuyenQuanTri = React.useMemo(() => {
    if (!phanQuyenList || !moduleId) return false

    const phanQuyen = phanQuyenList.find((pq) => pq.module_id === moduleId)
    return phanQuyen?.quyen?.quan_tri === true
  }, [phanQuyenList, moduleId])

  return hasQuyenQuanTri
}

