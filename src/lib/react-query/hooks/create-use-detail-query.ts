"use client"

import { useDetailQuery } from "../hooks"
import type { UseQueryResult } from "@tanstack/react-query"
import type { QueryKeyFactory } from "../query-keys/types"

/**
 * Configuration for creating detail query hooks
 */
export interface CreateUseDetailQueryConfig<TEntity> {
  /**
   * Query key factory for the module
   */
  queryKeys: QueryKeyFactory

  /**
   * API method to fetch entity by ID
   */
  api: {
    getById: (id: number) => Promise<TEntity | null>
  }
}

/**
 * Creates a useDetailQuery hook for a module
 * 
 * Automatically applies detail cache strategy and uses the module's query keys.
 * 
 * @example
 * ```ts
 * export const useLichDangById = createUseDetailQuery({
 *   queryKeys: lichDangQueryKeys,
 *   api: { getById: LichDangAPI.getById }
 * })
 * 
 * // Usage:
 * const { data, isLoading } = useLichDangById(id, initialData)
 * ```
 */
export function createUseDetailQuery<TEntity>(
  config: CreateUseDetailQueryConfig<TEntity>
) {
  return function useDetailQueryHook(
    id: number,
    initialData?: TEntity
  ): UseQueryResult<TEntity | null, Error> {
    return useDetailQuery<TEntity | null, Error>({
      queryKey: config.queryKeys.detail(id),
      queryFn: async () => {
        return await config.api.getById(id)
      },
      enabled: !!id,
      initialData: initialData,
    })
  }
}

