/**
 * Custom React Query hooks with automatic cache strategies
 * 
 * These hooks automatically apply the correct cache strategy based on query type,
 * ensuring consistent performance across all modules.
 * 
 * Usage:
 * - useListQuery: For list queries (employees, departments, etc.)
 * - useDetailQuery: For detail queries (single record)
 * - useReferenceQuery: For reference data (dropdowns, lookups, filters)
 * - useRelatedQuery: For related/nested queries
 */

import { useQuery, UseQueryOptions, UseQueryResult } from "@tanstack/react-query"
import { cacheStrategies } from "./cache/strategies"

/**
 * Hook for list queries (employees, departments, etc.)
 * Automatically applies list cache strategy (5 min staleTime, 30 min gcTime)
 * 
 * @example
 * const { data } = useListQuery({
 *   queryKey: ['employees'],
 *   queryFn: getEmployees,
 *   initialData: serverData
 * })
 */
export function useListQuery<TData = unknown, TError = Error>(
  options: Omit<UseQueryOptions<TData, TError>, 'staleTime' | 'gcTime' | 'refetchOnWindowFocus' | 'refetchOnMount'> & {
    initialData?: TData
  }
): UseQueryResult<TData, TError> {
  return useQuery({
    ...options,
    // ⚡ Automatically add initialDataUpdatedAt to prevent background refetch
    initialDataUpdatedAt: options.initialData ? Date.now() : undefined,
    // ⚡ Automatically apply list cache strategy
    ...cacheStrategies.list,
  })
}

/**
 * Hook for detail queries (single record)
 * Automatically applies detail cache strategy (10 min staleTime, 60 min gcTime)
 * 
 * @example
 * const { data } = useDetailQuery({
 *   queryKey: ['employee', id],
 *   queryFn: () => getEmployeeById(id),
 *   initialData: serverData
 * })
 */
export function useDetailQuery<TData = unknown, TError = Error>(
  options: Omit<UseQueryOptions<TData, TError>, 'staleTime' | 'gcTime' | 'refetchOnWindowFocus' | 'refetchOnMount'> & {
    initialData?: TData
  }
): UseQueryResult<TData, TError> {
  return useQuery({
    ...options,
    // ⚡ Automatically add initialDataUpdatedAt to prevent background refetch
    initialDataUpdatedAt: options.initialData ? Date.now() : undefined,
    // ⚡ Automatically apply detail cache strategy
    ...cacheStrategies.detail,
  })
}

/**
 * Hook for reference data queries (dropdowns, lookups, filters, etc.)
 * Automatically applies reference cache strategy (30 min staleTime, 60 min gcTime)
 * 
 * ⚡ Use this for filter queries, dropdown options, lookup data, etc.
 * 
 * @example
 * const { data } = useReferenceQuery({
 *   queryKey: ['chuc-vu-list-for-filter'],
 *   queryFn: getDanhSachChucVu
 * })
 */
export function useReferenceQuery<TData = unknown, TError = Error>(
  options: Omit<UseQueryOptions<TData, TError>, 'staleTime' | 'gcTime' | 'refetchOnWindowFocus' | 'refetchOnMount'>
): UseQueryResult<TData, TError> {
  return useQuery({
    ...options,
    // ⚡ Automatically apply reference cache strategy
    ...cacheStrategies.reference,
  })
}

/**
 * Hook for related/nested queries
 * Automatically applies related cache strategy (5 min staleTime, 30 min gcTime)
 * 
 * @example
 * const { data } = useRelatedQuery({
 *   queryKey: ['employee-relatives', employeeId],
 *   queryFn: () => getRelativesByEmployeeId(employeeId),
 *   initialData: serverData
 * })
 */
export function useRelatedQuery<TData = unknown, TError = Error>(
  options: Omit<UseQueryOptions<TData, TError>, 'staleTime' | 'gcTime' | 'refetchOnWindowFocus' | 'refetchOnMount'> & {
    initialData?: TData
  }
): UseQueryResult<TData, TError> {
  return useQuery({
    ...options,
    // ⚡ Automatically add initialDataUpdatedAt to prevent background refetch
    initialDataUpdatedAt: options.initialData ? Date.now() : undefined,
    // ⚡ Automatically apply related cache strategy
    ...cacheStrategies.related,
  })
}

