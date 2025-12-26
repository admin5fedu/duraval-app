/**
 * Initialize Enum System
 * 
 * Call this function once at app startup to initialize
 * the enum color registry with default colors
 */

import { initializeDefaultEnumColors } from "./enum-color-registry"

/**
 * Initialize the enum system
 * Should be called once at app startup
 */
export function initializeEnumSystem(): void {
  // Initialize default enum colors
  initializeDefaultEnumColors()
  
  // Future: Could add other initialization logic here
  // - Load custom enum configs from API
  // - Load user preferences
  // - etc.
}

