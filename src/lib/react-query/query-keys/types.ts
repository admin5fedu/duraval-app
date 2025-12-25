/**
 * Query Key Types
 */

export type BaseQueryKey = readonly string[]
export type QueryKey = BaseQueryKey | readonly [string, ...unknown[]]

export interface QueryKeyFactory {
  all: () => QueryKey
  list: () => QueryKey
  detail: (id: number | string) => QueryKey
  search?: (query: string) => QueryKey
  [key: string]: ((...args: any[]) => QueryKey) | undefined
}

