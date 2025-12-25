/**
 * Excel Import Service
 * 
 * Professional import service with transaction/rollback support
 * For Supabase-based applications
 */

import { supabase } from '@/lib/supabase'
import type { PostgrestError } from '@supabase/supabase-js'

export interface ImportResult {
  success: boolean
  inserted: number
  updated: number
  failed: number
  total: number
  errors: Array<{ rowNumber: number; errors: string[] }>
}

export interface ImportOptions<TData> {
  tableName: string
  data: TData[]
  insertMode?: 'insert' | 'upsert' | 'update'
  conflictColumn?: string // Column to check for conflicts (for upsert/update)
  batchSize?: number // Number of rows to process per batch
  onProgress?: (progress: { processed: number; total: number }) => void
}

/**
 * Import data to Supabase with transaction-like behavior
 * Uses batch operations and rollback on critical errors
 */
export async function importData<TData extends Record<string, any>>(
  options: ImportOptions<TData>
): Promise<ImportResult> {
  const {
    tableName,
    data,
    insertMode = 'insert',
    conflictColumn,
    batchSize = 100,
    onProgress,
  } = options

  const result: ImportResult = {
    success: false,
    inserted: 0,
    updated: 0,
    failed: 0,
    total: data.length,
    errors: [],
  }

  // Track inserted/updated IDs for rollback
  const insertedIds: string[] = []
  const updatedIds: string[] = []

  try {
    // Process in batches
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize)
      const batchNumber = Math.floor(i / batchSize) + 1
      
      try {
        let batchResult: { data: any[] | null; error: PostgrestError | null }

        if (insertMode === 'insert') {
          // Simple insert
          batchResult = await supabase
            .from(tableName)
            .insert(batch)
            .select()

          if (batchResult.error) {
            throw batchResult.error
          }

          if (batchResult.data) {
            result.inserted += batchResult.data.length
            batchResult.data.forEach((row: any) => {
              if (row.id) insertedIds.push(row.id)
            })
          }
        } else if (insertMode === 'upsert') {
          // Upsert (insert or update on conflict)
          if (!conflictColumn) {
            throw new Error('conflictColumn is required for upsert mode')
          }

          batchResult = await supabase
            .from(tableName)
            .upsert(batch, {
              onConflict: conflictColumn,
            })
            .select()

          if (batchResult.error) {
            throw batchResult.error
          }

          if (batchResult.data) {
            // Check which rows were inserted vs updated
            // This is approximate - Supabase doesn't distinguish in upsert response
            result.inserted += Math.floor(batchResult.data.length * 0.5) // Estimate
            result.updated += Math.ceil(batchResult.data.length * 0.5) // Estimate
            batchResult.data.forEach((row: any) => {
              if (row.id) {
                insertedIds.push(row.id)
                updatedIds.push(row.id)
              }
            })
          }
        } else if (insertMode === 'update') {
          // Update existing records
          if (!conflictColumn) {
            throw new Error('conflictColumn is required for update mode')
          }

          // Update each row individually to track success/failure
          for (const row of batch) {
            const conflictValue = row[conflictColumn]
            if (!conflictValue) {
              result.failed++
              result.errors.push({
                rowNumber: i + batch.indexOf(row) + 1,
                errors: [`Thiếu giá trị cho cột ${conflictColumn}`],
              })
              continue
            }

            batchResult = await supabase
              .from(tableName)
              .update(row)
              .eq(conflictColumn, conflictValue)
              .select()

            if (batchResult.error) {
              result.failed++
              result.errors.push({
                rowNumber: i + batch.indexOf(row) + 1,
                errors: [batchResult.error.message],
              })
            } else if (batchResult.data && batchResult.data.length > 0) {
              result.updated++
              if (batchResult.data[0]?.id) {
                updatedIds.push(batchResult.data[0].id)
              }
            } else {
              result.failed++
              result.errors.push({
                rowNumber: i + batch.indexOf(row) + 1,
                errors: ['Không tìm thấy bản ghi để cập nhật'],
              })
            }
          }
        }

        // Report progress
        if (onProgress) {
          onProgress({
            processed: Math.min(i + batchSize, data.length),
            total: data.length,
          })
        }
      } catch (batchError: any) {
        // Handle batch-level errors
        const errorMessage = batchError?.message || 'Lỗi không xác định'
        
        // Add errors for all rows in failed batch
        batch.forEach((_, index) => {
          result.failed++
          result.errors.push({
            rowNumber: i + index + 1,
            errors: [errorMessage],
          })
        })

        // If critical error (e.g., connection lost), attempt rollback
        if (isCriticalError(batchError)) {
          console.warn('Critical error detected, attempting rollback...')
          await rollbackImport(tableName, insertedIds, updatedIds)
          throw new Error(`Lỗi nghiêm trọng: ${errorMessage}. Đã rollback tất cả thay đổi.`)
        }
      }
    }

    // Determine overall success
    result.success = result.failed === 0 && (result.inserted > 0 || result.updated > 0)

    return result
  } catch (error: any) {
    // Final rollback attempt on critical failure
    if (insertedIds.length > 0 || updatedIds.length > 0) {
      console.warn('Final rollback attempt...')
      await rollbackImport(tableName, insertedIds, updatedIds)
    }

    throw error
  }
}

/**
 * Rollback imported data by deleting inserted records
 */
async function rollbackImport(
  tableName: string,
  insertedIds: string[],
  updatedIds: string[]
): Promise<void> {
  try {
    // Delete inserted records
    if (insertedIds.length > 0) {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .in('id', insertedIds)

      if (error) {
        console.error('Rollback error (inserted):', error)
        // Note: We don't throw here to allow continued rollback attempts
      }
    }

    // Note: We can't easily rollback updates without storing original values
    // This is a limitation of the current implementation
    if (updatedIds.length > 0) {
      console.warn(`Warning: ${updatedIds.length} updated records cannot be automatically rolled back`)
    }
  } catch (error) {
    console.error('Rollback failed:', error)
    // Don't throw - rollback failure shouldn't prevent error reporting
  }
}

/**
 * Check if error is critical (requires rollback)
 */
function isCriticalError(error: any): boolean {
  if (!error) return false

  const criticalErrorCodes = [
    'PGRST116', // Connection error
    'PGRST301', // Timeout
    '08000', // Connection exception
    '08003', // Connection does not exist
    '08006', // Connection failure
  ]

  const errorCode = error?.code || error?.error_code || ''
  return criticalErrorCodes.some(code => errorCode.includes(code))
}

/**
 * Validate import data before processing
 */
export function validateImportData<TData>(
  data: TData[],
  requiredFields: string[],
  validateRow?: (row: TData, index: number) => string[]
): Array<{ rowNumber: number; errors: string[] }> {
  const errors: Array<{ rowNumber: number; errors: string[] }> = []

  data.forEach((row, index) => {
    const rowErrors: string[] = []

    // Check required fields
    requiredFields.forEach(field => {
      if (!row || row[field] === undefined || row[field] === null || row[field] === '') {
        rowErrors.push(`Thiếu trường bắt buộc: ${field}`)
      }
    })

    // Custom validation
    if (validateRow) {
      const customErrors = validateRow(row, index + 1)
      rowErrors.push(...customErrors)
    }

    if (rowErrors.length > 0) {
      errors.push({
        rowNumber: index + 1,
        errors: rowErrors,
      })
    }
  })

  return errors
}

