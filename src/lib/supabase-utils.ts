/**
 * Supabase Utility Functions
 * 
 * Helper functions to work with Supabase PromiseLike types
 * Converts PromiseLike to Promise for better TypeScript compatibility
 */

import type { PostgrestQueryBuilder } from '@supabase/postgrest-js'
import type { ColumnFiltersState } from '@tanstack/react-table'

/**
 * Convert Supabase PromiseLike to Promise
 * 
 * @example
 * ```ts
 * const data = await toPromise(
 *   supabase.from('table').select('*')
 * )
 * ```
 */
export async function toPromise<T>(
  promiseLike: PromiseLike<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> {
  return Promise.resolve(promiseLike)
}

/**
 * Execute Supabase query and return data, throwing on error
 * 
 * @example
 * ```ts
 * const data = await queryData(
 *   supabase.from('table').select('*')
 * )
 * ```
 */
export async function queryData<T>(
  query: PromiseLike<{ data: T | null; error: any }>
): Promise<T> {
  const result = await toPromise(query)
  if (result.error) {
    throw new Error(result.error.message || 'Query failed')
  }
  return result.data as T
}

/**
 * Execute Supabase query and return data or null
 * 
 * @example
 * ```ts
 * const data = await queryDataOrNull(
 *   supabase.from('table').select('*').single()
 * )
 * ```
 */
export async function queryDataOrNull<T>(
  query: PromiseLike<{ data: T | null; error: any }>
): Promise<T | null> {
  const result = await toPromise(query)
  if (result.error) {
    // PGRST116 = not found, return null instead of throwing
    if (result.error.code === 'PGRST116') {
      return null
    }
    throw new Error(result.error.message || 'Query failed')
  }
  return result.data
}

/**
 * Pagination result type
 */
export interface PaginationResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Fetch all records recursively from Supabase (bypasses 1000 row limit)
 * 
 * This function automatically handles pagination to fetch all records
 * regardless of the Supabase default limit of 1000 rows.
 * 
 * @param queryBuilder - Supabase query builder (e.g., supabase.from('table').select('*'))
 * @param pageSize - Number of records per batch (default: 1000, max supported by Supabase)
 * @returns Array of all records
 * 
 * @example
 * ```ts
 * const allRecords = await fetchAllRecursive(
 *   supabase.from('var_tsn_tinh_thanh').select('*').order('id')
 * )
 * ```
 */
export async function fetchAllRecursive<T = any>(
  queryBuilder: PostgrestQueryBuilder<any, any, any, any, unknown>,
  pageSize: number = 1000
): Promise<T[]> {
  const allData: T[] = []
  let from = 0
  let hasMore = true

  while (hasMore) {
    const { data, error } = await (queryBuilder as any).range(from, from + pageSize - 1)

    if (error) {
      throw new Error(error.message || 'Failed to fetch data')
    }

    if (!data || data.length === 0) {
      hasMore = false
      break
    }

    allData.push(...(data as T[]))

    // If we got less than pageSize, we've reached the end
    if (data.length < pageSize) {
      hasMore = false
    } else {
      from += pageSize
    }
  }

  return allData
}

/**
 * Fetch paginated records from Supabase
 * 
 * @param queryBuilder - Supabase query builder
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of records per page
 * @param filters - Optional column filters to apply before pagination
 * @returns Pagination result with data and metadata
 * 
 * @example
 * ```ts
 * // Basic pagination
 * const result = await fetchPaginated(
 *   supabase.from('var_tsn_tinh_thanh').select('*', { count: 'exact' }).order('id'),
 *   1,
 *   50
 * )
 * 
 * // With filters
 * const result = await fetchPaginated(
 *   supabase.from('var_tsn_phuong_xa').select('*', { count: 'exact' }).order('id'),
 *   1,
 *   50,
 *   [{ id: 'ma_tinh_thanh', value: 'HN' }]
 * )
 * ```
 */
export async function fetchPaginated<T = any>(
  queryBuilder: PostgrestQueryBuilder<any, any, any, any, unknown>,
  page: number,
  pageSize: number,
  filters?: ColumnFiltersState
): Promise<PaginationResult<T>> {
  // Apply filters first
  const query = applyFilters(queryBuilder, filters)
  
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await (query as any).range(from, to)

  if (error) {
    throw new Error(error.message || 'Failed to fetch paginated data')
  }

  const total = count || 0
  const totalPages = Math.ceil(total / pageSize)

  return {
    data: (data || []) as T[],
    total,
    page,
    pageSize,
    totalPages,
  }
}

/**
 * Virtual column mappings for filters
 * Maps virtual column IDs to their actual database columns
 */
const VIRTUAL_COLUMN_MAPPINGS: Record<string, string[]> = {
  // Virtual column "tinh_thanh" maps to ma_tinh_thanh and ten_tinh_thanh
  'tinh_thanh': ['ma_tinh_thanh', 'ten_tinh_thanh'],
  // Virtual column "quan_huyen" maps to ma_quan_huyen and ten_quan_huyen
  'quan_huyen': ['ma_quan_huyen', 'ten_quan_huyen'],
}

/**
 * Parse combined filter value (e.g., "27 - Nghệ An") into parts
 * Returns { ma, ten } or null if format doesn't match
 */
function parseCombinedValue(value: string): { ma: string; ten: string } | null {
  const parts = value.split(' - ')
  if (parts.length >= 2) {
    return { ma: parts[0].trim(), ten: parts.slice(1).join(' - ').trim() }
  }
  return null
}

/**
 * Apply column filters to Supabase query
 * 
 * Converts TanStack Table ColumnFiltersState to Supabase query filters
 * Supports: exact match (.eq), array match (.in), and text search (.ilike)
 * Also handles virtual columns by mapping them to actual database columns
 * 
 * @param queryBuilder - Supabase query builder
 * @param filters - Column filters from TanStack Table
 * @returns Query builder with filters applied
 * 
 * @example
 * ```ts
 * const query = applyFilters(
 *   supabase.from('var_tsn_phuong_xa').select('*'),
 *   [
 *     { id: 'ma_tinh_thanh', value: 'HN' },
 *     { id: 'ten_tinh_thanh', value: ['Hà Nội', 'TP.HCM'] },
 *     { id: 'tinh_thanh', value: ['27 - Nghệ An'] } // Virtual column
 *   ]
 * )
 * ```
 */
export function applyFilters(
  queryBuilder: PostgrestQueryBuilder<any, any, any, any, unknown>,
  filters?: ColumnFiltersState
): PostgrestQueryBuilder<any, any, any, any, unknown> {
  if (!filters || filters.length === 0) {
    return queryBuilder
  }

  let query: any = queryBuilder

  filters.forEach(filter => {
    const { id, value } = filter

    if (value === null || value === undefined || value === '') {
      return // Skip empty filters
    }

    // Check if this is a virtual column that needs mapping
    const mappedColumns = VIRTUAL_COLUMN_MAPPINGS[id]
    
    if (mappedColumns) {
      // Handle virtual column: map to actual columns
      const actualValues = Array.isArray(value) ? value : [value]
      
      // Collect all ma and ten values from combined format
      const maValues: string[] = []
      const tenValues: string[] = []
      
      actualValues.forEach((val: string) => {
        const parsed = parseCombinedValue(val)
        if (parsed) {
          maValues.push(parsed.ma)
          tenValues.push(parsed.ten)
        } else {
          // If value doesn't match "ma - ten" format, search in both columns
          maValues.push(val)
          tenValues.push(val)
        }
      })
      
      // Apply filters to mapped columns using OR logic
      // Filter by ma_tinh_thanh OR ten_tinh_thanh matching any of the values
      if (maValues.length > 0 || tenValues.length > 0) {
        const orConditions: string[] = []
        
        mappedColumns.forEach(mappedCol => {
          if (mappedCol.includes('ma_') && maValues.length > 0) {
            // Use .in() for ma columns
            const uniqueMaValues = [...new Set(maValues)]
            if (uniqueMaValues.length === 1) {
              orConditions.push(`${mappedCol}.eq.${uniqueMaValues[0]}`)
            } else {
              // For multiple values, we need to use OR with multiple .eq conditions
              uniqueMaValues.forEach(ma => {
                orConditions.push(`${mappedCol}.eq.${ma}`)
              })
            }
          } else if (mappedCol.includes('ten_') && tenValues.length > 0) {
            // Use .ilike() for ten columns (text search)
            const uniqueTenValues = [...new Set(tenValues)]
            uniqueTenValues.forEach(ten => {
              orConditions.push(`${mappedCol}.ilike.%${ten}%`)
            })
          }
        })
        
        if (orConditions.length > 0) {
          // Use .or() to combine conditions
          query = query.or(orConditions.join(','))
        }
      }
    } else {
      // Handle regular (non-virtual) columns
      // Handle array values (multiple selections)
      if (Array.isArray(value)) {
        if (value.length > 0) {
          // Use .in() for array values
          query = query.in(id, value)
        }
      } else if (typeof value === 'string') {
        // For string values, use .ilike() for text search
        query = query.ilike(id, `%${value}%`)
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        // Single value - use .eq() for exact match
        query = query.eq(id, value)
      } else if (typeof value === 'object' && 'value' in value) {
        // Handle filter value objects (from TanStack Table)
        const filterValue = (value as any).value
        if (Array.isArray(filterValue)) {
          if (filterValue.length > 0) {
            query = query.in(id, filterValue)
          }
        } else {
          query = query.eq(id, filterValue)
        }
      }
    }
  })

  return query
}

/**
 * Search records with pagination support
 * 
 * Supports searching across multiple fields using Supabase's or() method.
 * 
 * @param queryBuilder - Supabase query builder
 * @param searchTerm - Search term
 * @param searchFields - Fields to search in (can be single field or array)
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of records per page
 * @param filters - Optional column filters to apply before searching
 * @returns Pagination result with filtered data
 * 
 * @example
 * ```ts
 * // Single field
 * const result = await searchRecords(
 *   supabase.from('var_tsn_quan_huyen').select('*', { count: 'exact' }),
 *   'Ba Đình',
 *   'ten_quan_huyen',
 *   1,
 *   20
 * )
 * 
 * // Multiple fields with filters
 * const result = await searchRecords(
 *   supabase.from('var_tsn_phuong_xa').select('*', { count: 'exact' }),
 *   'Ba Đình',
 *   ['ten_phuong_xa', 'ma_phuong_xa'],
 *   1,
 *   20,
 *   [{ id: 'ma_tinh_thanh', value: 'HN' }]
 * )
 * ```
 */
export async function searchRecords<T = any>(
  queryBuilder: PostgrestQueryBuilder<any, any, any, any, unknown>,
  searchTerm: string,
  searchFields: string | string[],
  page: number = 1,
  pageSize: number = 20,
  filters?: ColumnFiltersState
): Promise<PaginationResult<T>> {
  // Apply column filters first
  let query: any = applyFilters(queryBuilder, filters)

  // Apply search filter if search term is provided
  if (searchTerm && searchTerm.trim() && searchFields) {
    const fields = Array.isArray(searchFields) ? searchFields : [searchFields]
    
    if (fields.length === 1) {
      // Single field - use ilike directly
      query = query.ilike(fields[0], `%${searchTerm}%`)
    } else {
      // Multiple fields - use or() with ilike conditions
      // Format: "field1.ilike.%term%,field2.ilike.%term%"
      const orConditions = fields.map(field => `${field}.ilike.%${searchTerm}%`).join(',')
      query = query.or(orConditions)
    }
  }

  return fetchPaginated<T>(query, page, pageSize)
}

