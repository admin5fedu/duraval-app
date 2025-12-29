/**
 * Excel Column Auto-Mapping Utilities
 * 
 * Professional column mapping with fuzzy matching support
 * Supports multiple Vietnamese variations (with/without diacritics)
 */

import type { ExcelColumnType } from '@/shared/types/excel'

export interface ColumnMapping {
  dbField: string
  excelNames: string[] // All possible column name variations
  required?: boolean
  type?: ExcelColumnType
  description?: string
}

export interface MappingResult {
  dbField: string
  excelColumn: string
  confidence: number
  matchedName: string
}

/**
 * Normalize Vietnamese text for comparison
 * Removes diacritics, normalizes spaces, converts to lowercase
 */
export function normalizeColumnName(name: string): string {
  if (!name) return ''
  
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD') // Tách dấu
    .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu
    .replace(/[_\s-]/g, ' ') // Chuẩn hóa khoảng trắng
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []
  const len1 = str1.length
  const len2 = str2.length

  if (len1 === 0) return len2
  if (len2 === 0) return len1

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      )
    }
  }

  return matrix[len1][len2]
}

/**
 * Calculate similarity score between two strings (0-1)
 */
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0
  
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) return 1.0
  
  const distance = levenshteinDistance(longer, shorter)
  return (longer.length - distance) / longer.length
}

/**
 * Find best matching database field for an Excel column
 */
export function findBestMatch(
  excelColumn: string,
  mappings: ColumnMapping[]
): MappingResult | null {
  const normalized = normalizeColumnName(excelColumn)
  
  let bestMatch: MappingResult | null = null
  let bestConfidence = 0

  for (const mapping of mappings) {
    for (const excelName of mapping.excelNames) {
      const normalizedMapping = normalizeColumnName(excelName)
      
      // Exact match
      if (normalized === normalizedMapping) {
        return {
          dbField: mapping.dbField,
          excelColumn,
          confidence: 1.0,
          matchedName: excelName,
        }
      }
      
      // Contains match (one contains the other)
      if (normalized.includes(normalizedMapping) || normalizedMapping.includes(normalized)) {
        const confidence = Math.min(normalized.length, normalizedMapping.length) / Math.max(normalized.length, normalizedMapping.length)
        if (confidence > bestConfidence && confidence >= 0.8) {
          bestMatch = {
            dbField: mapping.dbField,
            excelColumn,
            confidence,
            matchedName: excelName,
          }
          bestConfidence = confidence
        }
      }
      
      // Fuzzy match (Levenshtein distance)
      const similarity = calculateSimilarity(normalized, normalizedMapping)
      if (similarity > bestConfidence && similarity >= 0.7) {
        bestMatch = {
          dbField: mapping.dbField,
          excelColumn,
          confidence: similarity,
          matchedName: excelName,
        }
        bestConfidence = similarity
      }
    }
  }
  
  return bestMatch
}

/**
 * Auto-map all Excel columns to database fields
 * Returns mapping: { excelColumn: dbField }
 */
export function autoMapColumns(
  excelHeaders: string[],
  mappings: ColumnMapping[]
): {
  mapping: Record<string, string>
  unmapped: string[]
  lowConfidence: Array<{ excelColumn: string; dbField: string; confidence: number }>
} {
  const mapping: Record<string, string> = {}
  const unmapped: string[] = []
  const lowConfidence: Array<{ excelColumn: string; dbField: string; confidence: number }> = []

  for (const header of excelHeaders) {
    if (!header || header.trim() === '') continue

    const match = findBestMatch(header, mappings)
    
    if (match) {
      if (match.confidence >= 0.8) {
        mapping[header] = match.dbField
      } else {
        lowConfidence.push({
          excelColumn: header,
          dbField: match.dbField,
          confidence: match.confidence,
        })
      }
    } else {
      unmapped.push(header)
    }
  }

  return { mapping, unmapped, lowConfidence }
}

/**
 * Validate mapping completeness
 * Check if all required fields are mapped
 */
export function validateMapping(
  mapping: Record<string, string>,
  mappings: ColumnMapping[]
): {
  valid: boolean
  missingRequired: string[]
} {
  const requiredFields = mappings
    .filter(m => m.required)
    .map(m => m.dbField)

  const mappedFields = new Set(Object.values(mapping))
  const missingRequired = requiredFields.filter(field => !mappedFields.has(field))

  return {
    valid: missingRequired.length === 0,
    missingRequired,
  }
}

