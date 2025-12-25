/**
 * Cloudinary Upload Utility
 * Client-side upload using unsigned upload preset
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

if (!CLOUDINARY_CLOUD_NAME) {
  console.warn('VITE_CLOUDINARY_CLOUD_NAME is not set')
}

if (!CLOUDINARY_UPLOAD_PRESET) {
  console.warn('VITE_CLOUDINARY_UPLOAD_PRESET is not set')
}

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

export interface CloudinaryUploadResult {
  secure_url: string
  public_id: string
  width: number
  height: number
}

/**
 * Upload image to Cloudinary using unsigned upload preset
 * @param file File to upload
 * @param folder Optional folder path in Cloudinary
 * @returns Promise with upload result
 */
export async function uploadImageToCloudinary(
  file: File,
  folder: string = 'avatars'
): Promise<CloudinaryUploadResult> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Cloudinary configuration is missing. Please check your .env file.')
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File phải là định dạng ảnh (jpg, jpeg, png, gif, webp)')
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    throw new Error('Kích thước file không được vượt quá 10MB')
  }

  // Create FormData
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  formData.append('folder', folder)
  formData.append('transformation', 'w_400,h_400,c_fill,g_face,q_auto,f_auto')

  try {
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }))
      throw new Error(error.error || 'Lỗi khi tải ảnh lên Cloudinary')
    }

    const result = await response.json()

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Lỗi không xác định khi tải ảnh lên')
  }
}

/**
 * Delete image from Cloudinary
 * Note: This requires server-side implementation with API key/secret
 * For now, we'll just return a promise that resolves
 * @param publicId Public ID of the image to delete
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  // This would require server-side implementation
  // For now, we'll just log it
  console.log('Delete image from Cloudinary:', publicId)
  // In production, you would call your backend API to delete the image
}

/**
 * Extract public_id from Cloudinary URL
 */
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    const match = url.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp)/i)
    return match ? match[1] : null
  } catch {
    return null
  }
}
