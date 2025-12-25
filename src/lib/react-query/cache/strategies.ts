/**
 * Cache strategies for ERP application
 * 
 * Different cache strategies for different types of data:
 * - List queries: Frequently accessed, moderate staleness tolerance
 * - Detail queries: Less frequently accessed, higher staleness tolerance
 * - Related/nested queries: Moderate staleness tolerance
 */

export const cacheStrategies = {
  /**
   * Strategy for list queries (employees, departments, etc.)
   * - Data is fresh for 5 minutes (ERP data doesn't change frequently)
   * - Cache persists for 30 minutes when unused (aggressive caching for ERP)
   * - Don't refetch on window focus (reduce API calls)
   */
  list: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (increased for ERP)
    refetchOnWindowFocus: false, // Disabled for ERP to reduce API calls
    refetchOnMount: false, // Don't refetch if data is fresh
    refetchOnReconnect: 'always',
  },

  /**
   * Strategy for detail queries (single employee, department, etc.)
   * - Data is fresh for 10 minutes (details change less frequently)
   * - Cache persists for 60 minutes when unused (aggressive caching for ERP)
   * - Don't refetch on window focus (reduce API calls)
   */
  detail: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes (increased for ERP)
    refetchOnWindowFocus: false, // Disabled for ERP to reduce API calls
    refetchOnMount: false,
    refetchOnReconnect: 'always',
  },

  /**
   * Strategy for related/nested queries (relatives, etc.)
   * - Data is fresh for 5 minutes
   * - Cache persists for 30 minutes when unused (aggressive caching for ERP)
   * - Don't refetch on window focus (reduce API calls)
   */
  related: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (increased for ERP)
    refetchOnWindowFocus: false, // Disabled for ERP to reduce API calls
    refetchOnMount: false,
    refetchOnReconnect: 'always',
  },

  /**
   * Strategy for reference data (dropdowns, lookups, etc.)
   * - Data is fresh for 30 minutes (rarely changes)
   * - Cache persists for 1 hour when unused
   * - Less aggressive refetching
   */
  reference: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: 'always',
  },
} as const

/**
 * Default query options for the application
 */
export const defaultQueryOptions = {
  // Default to list strategy
  ...cacheStrategies.list,
  
  // Retry configuration
  retry: 2,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  
  // Network mode
  networkMode: 'online' as const,
}

/**
 * Default mutation options
 */
export const defaultMutationOptions = {
  // Retry mutations once on failure
  retry: 1,
  
  // Network mode for mutations
  networkMode: 'online' as const,
}

