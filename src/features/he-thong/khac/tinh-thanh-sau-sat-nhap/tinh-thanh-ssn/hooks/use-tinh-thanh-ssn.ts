"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { tinhThanhSSN as tinhThanhSSNQueryKeys } from "@/lib/react-query/query-keys/tinh-thanh-ssn"
import { TinhThanhSSNAPI } from "../services/tinh-thanh-ssn.api"
import type { TinhThanhSSN } from "../schema"

/**
 * Hook to fetch list of tỉnh thành SSN
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useTinhThanhSSN = createUseListQuery<TinhThanhSSN>({
    queryKeys: tinhThanhSSNQueryKeys,
    api: { getAll: TinhThanhSSNAPI.getAll },
})

/**
 * Hook to fetch single tỉnh thành SSN by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useTinhThanhSSNById = createUseDetailQuery<TinhThanhSSN>({
    queryKeys: tinhThanhSSNQueryKeys,
    api: { getById: TinhThanhSSNAPI.getById },
})

