"use client"

import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { sanPhamXuatVat as sanPhamXuatVatQueryKeys } from "@/lib/react-query/query-keys/san-pham-xuat-vat"
import { SanPhamXuatVatAPI } from "../services/san-pham-xuat-vat.api"
import type { SanPhamXuatVat } from "../types"

/**
 * Custom cache strategy for external API data
 * - Cache for 60 minutes (as requested)
 * - Don't refetch on window focus (reduce API calls)
 */
const CACHE_STRATEGY = {
  staleTime: 60 * 60 * 1000, // 60 minutes
  gcTime: 60 * 60 * 1000, // 60 minutes
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: true as const,
}

/**
 * Hook to fetch list of Sản phẩm xuất VAT
 * Uses custom cache strategy (60 minutes) for external API data
 */
export function useSanPhamXuatVat(
  initialData?: SanPhamXuatVat[]
): UseQueryResult<SanPhamXuatVat[], Error> {
  return useQuery<SanPhamXuatVat[], Error>({
    queryKey: sanPhamXuatVatQueryKeys.list(),
    queryFn: async () => {
      return await SanPhamXuatVatAPI.getAll()
    },
    ...(initialData ? {
      initialData: initialData,
      initialDataUpdatedAt: Date.now(),
    } : {}),
    ...CACHE_STRATEGY,
  })
}

/**
 * Hook to fetch single record by index
 * Uses custom cache strategy (60 minutes) for external API data
 */
export function useSanPhamXuatVatById(
  index: number,
  initialData?: SanPhamXuatVat
): UseQueryResult<SanPhamXuatVat | null, Error> {
  return useQuery<SanPhamXuatVat | null, Error>({
    queryKey: sanPhamXuatVatQueryKeys.detail(index),
    queryFn: async () => {
      return await SanPhamXuatVatAPI.getById(index)
    },
    ...(initialData ? {
      initialData: initialData,
      initialDataUpdatedAt: Date.now(),
    } : {}),
    enabled: index > 0, // Only fetch if index is valid
    ...CACHE_STRATEGY,
  })
}

