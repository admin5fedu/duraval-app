/**
 * Supabase Storage Utility
 * Upload và quản lý file trên Supabase Storage
 */

import { supabase } from './supabase'

export interface SupabaseUploadResult {
  path: string
  publicUrl: string
  signedUrl?: string
}

/**
 * Upload file lên Supabase Storage
 * @param file File cần upload
 * @param bucket Tên bucket (mặc định: 'duraval_file')
 * @param folder Folder path trong bucket (optional)
 * @returns Promise với upload result
 */
export async function uploadFileToSupabase(
  file: File,
  bucket: string = 'duraval_file',
  folder?: string
): Promise<SupabaseUploadResult> {
  // Validate file size (max 50MB)
  const maxSize = 50 * 1024 * 1024 // 50MB
  if (file.size > maxSize) {
    throw new Error('Kích thước file không được vượt quá 50MB')
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(7)
  const fileName = `${timestamp}-${randomStr}.${fileExt}`
  const filePath = folder ? `${folder}/${fileName}` : fileName

  // Upload file
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Supabase upload error:', error)
    throw new Error(error.message || 'Lỗi khi tải file lên Supabase Storage')
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return {
    path: filePath,
    publicUrl: publicUrl
  }
}

/**
 * Tạo signed URL cho file (bảo mật hơn, có thời hạn)
 * @param bucket Tên bucket
 * @param filePath Đường dẫn file trong bucket
 * @param expiresIn Thời gian hết hạn (giây, mặc định: 1 giờ)
 * @returns Promise với signed URL
 */
export async function getSignedUrl(
  bucket: string,
  filePath: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresIn)

  if (error) {
    throw new Error(error.message || 'Lỗi khi tạo signed URL')
  }

  return data.signedUrl
}

/**
 * Xóa file từ Supabase Storage
 * @param bucket Tên bucket
 * @param filePath Đường dẫn file cần xóa
 */
export async function deleteFileFromSupabase(
  bucket: string,
  filePath: string
): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath])

  if (error) {
    throw new Error(error.message || 'Lỗi khi xóa file')
  }
}

/**
 * Lấy public URL từ file path
 * @param bucket Tên bucket
 * @param filePath Đường dẫn file
 * @returns Public URL
 */
export function getPublicUrl(bucket: string, filePath: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)
  
  return data.publicUrl
}

