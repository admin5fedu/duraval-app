/**
 * Utility functions to sanitize data and prevent rendering objects as React children
 */

/**
 * Sanitize a value to ensure it can be safely rendered in React
 * Converts objects to strings or extracts the actual value
 */
export function sanitizeValue(value: any): string | number | null | undefined {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return null
  }

  // Handle primitives - convert boolean to string
  if (typeof value === 'string' || typeof value === 'number') {
    return value
  }
  if (typeof value === 'boolean') {
    return String(value)
  }

  // Handle arrays - join them
  if (Array.isArray(value)) {
    return value.map(item => sanitizeValue(item)).join(', ')
  }

  // Handle objects - try to extract meaningful value
  if (typeof value === 'object') {
    // If object has a 'value' property, use that
    if ('value' in value && (typeof value.value === 'string' || typeof value.value === 'number')) {
      return value.value
    }
    
    // If object has a 'data' property, try to extract from it
    if ('data' in value) {
      return sanitizeValue(value.data)
    }
    
    // Otherwise, stringify (for debugging)
    try {
      return JSON.stringify(value)
    } catch {
      return '[Object]'
    }
  }

  // Fallback: convert to string
  return String(value)
}

/**
 * Sanitize an entire data object to ensure all values are safe to render
 */
export function sanitizeDataObject<T extends Record<string, any>>(data: T): T {
  const sanitized = {} as T
  
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key]
      
      // Skip React elements and functions
      if (React.isValidElement(value) || typeof value === 'function') {
        sanitized[key] = value
        continue
      }
      
      // Sanitize the value
      sanitized[key] = sanitizeValue(value) as any
    }
  }
  
  return sanitized
}

// Import React for isValidElement check
import React from 'react'

