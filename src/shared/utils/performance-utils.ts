import { ComponentType, useMemo, useCallback, memo } from 'react'

/**
 * Performance Utilities
 * 
 * Utilities để tối ưu performance: memoization, lazy loading, preloading
 */

// ============================================================================
// Memoization Helpers
// ============================================================================

/**
 * Memoize component với shallow comparison
 */
export function memoizeComponent<P extends object>(
  Component: ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) {
  return memo(Component, areEqual)
}

/**
 * Memoize value với dependency array
 */
export function useMemoizedValue<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, deps)
}

/**
 * Memoize callback với dependency array
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps) as T
}

// ============================================================================
// Code Splitting Utilities
// ============================================================================

/**
 * Preload component để cải thiện perceived performance
 */
export function preloadComponent(importFn: () => Promise<any>) {
  if (typeof window !== 'undefined') {
    // Preload on idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        importFn()
      })
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        importFn()
      }, 100)
    }
  }
}

/**
 * Preload route component khi user hovers over link
 */
export function preloadRouteOnHover(
  importFn: () => Promise<any>,
  delay: number = 100
) {
  let timeoutId: NodeJS.Timeout | null = null

  return {
    onMouseEnter: () => {
      timeoutId = setTimeout(() => {
        importFn()
      }, delay)
    },
    onMouseLeave: () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    },
  }
}

// ============================================================================
// Debounce & Throttle
// ============================================================================

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return function debounced(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

// ============================================================================
// Batch Updates
// ============================================================================

/**
 * Batch multiple state updates
 */
export function batchUpdates(updates: (() => void)[]) {
  // React 18 automatically batches updates, but this can be useful for
  // non-React state updates or for explicit batching
  updates.forEach((update) => update())
}

