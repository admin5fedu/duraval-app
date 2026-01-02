import { useQuery } from "@tanstack/react-query"
import { TongQuanQuyHTBHAPI } from "../services/tong-quan-quy-htbh.api"
import { TongQuanQuyHTBHTransform } from "../services/tong-quan-quy-htbh-transform"
import { TongQuanQuyHTBHData } from "../types"

/**
 * Hook để fetch và transform dữ liệu tổng quan quỹ HTBH
 */
export function useTongQuanQuyHTBH(nam: number) {
  return useQuery<TongQuanQuyHTBHData[]>({
    queryKey: ["tong-quan-quy-htbh", nam],
    queryFn: async () => {
      const { quyData, doanhSoData } = await TongQuanQuyHTBHAPI.getCombinedData(nam)
      return TongQuanQuyHTBHTransform.transform(quyData, doanhSoData)
    },
    staleTime: 30000, // 30 seconds
  })
}

