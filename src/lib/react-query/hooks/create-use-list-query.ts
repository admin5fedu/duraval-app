"use client"

import { useListQuery } from "../hooks"
import type { UseQueryResult } from "@tanstack/react-query"
import type { QueryKeyFactory } from "../query-keys/types"

/**
 * Configuration for creating list query hooks
 */
export interface CreateUseListQueryConfig<TEntity> {
  /**
   * Query key factory for the module
   */
  queryKeys: QueryKeyFactory

  /**
   * API method to fetch all entities
   */
  api: {
    getAll: () => Promise<TEntity[]>
  }
}

/**
 * Creates a useListQuery hook for a module
 * 
 * Automatically applies list cache strategy and uses the module's query keys.
 * 
 * @example
 * ```ts
 * export const useLichDang = createUseListQuery({
 *   queryKeys: lichDangQueryKeys,
 *   api: { getAll: LichDangAPI.getAll }
 * })
 * 
 * // Usage:
 * const { data, isLoading } = useLichDang(initialData)
 * ```
 */
export function createUseListQuery<TEntity>(
  config: CreateUseListQueryConfig<TEntity>
) {
  return function useListQueryHook(
    initialData?: TEntity[]
  ): UseQueryResult<TEntity[], Error> {
    return useListQuery<TEntity[], Error>({
      queryKey: config.queryKeys.list(),
      queryFn: async () => {
        return await config.api.getAll()
      },
      initialData: initialData,
    })
  }
}

