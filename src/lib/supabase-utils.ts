/**
 * Supabase Utility Functions
 * 
 * Helper functions to work with Supabase PromiseLike types
 * Converts PromiseLike to Promise for better TypeScript compatibility
 */


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

