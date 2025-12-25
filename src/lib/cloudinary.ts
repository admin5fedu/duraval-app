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

const CLOUDINARY_UPLOAD_URL = CLOUDINARY_CLOUD_NAME 
  ? `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
  : ''

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
  // Note: transformation parameter is not allowed with unsigned upload preset
  // Use transformCloudinaryUrl() helper function to transform URLs when displaying

  try {
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      let errorMessage = 'Lỗi khi tải ảnh lên Cloudinary'
      try {
        const errorData = await response.json()
        errorMessage = errorData.error?.message || errorData.error || errorMessage
      } catch {
        // If JSON parsing fails, try to get text
        try {
          const errorText = await response.text()
          if (errorText) {
            errorMessage = errorText
          }
        } catch {
          // If all else fails, use status text
          errorMessage = response.statusText || errorMessage
        }
      }
      throw new Error(errorMessage)
    }

    const result = await response.json()

    if (!result.secure_url) {
      throw new Error('Không nhận được URL ảnh từ Cloudinary')
    }

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width || 0,
      height: result.height || 0,
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

/**
 * Apply transformation to Cloudinary URL for optimized display
 * @param url Original Cloudinary URL
 * @param transformation Transformation string (e.g., 'w_400,h_400,c_fill,g_face,q_auto,f_auto')
 * @returns Transformed URL
 */
export function transformCloudinaryUrl(
  url: string | null | undefined,
  transformation: string = 'w_400,h_400,c_fill,g_face,q_auto,f_auto'
): string | null | undefined {
  if (!url || !url.includes('cloudinary.com')) {
    return url
  }
  
  // Check if URL already has transformations
  if (url.includes('/upload/') && url.includes('/v')) {
    const parts = url.split('/upload/')
    if (parts.length === 2) {
      // Check if transformation already exists
      const afterUpload = parts[1]
      // If it starts with 'v', no transformation exists yet
      if (afterUpload.startsWith('v')) {
        // Insert transformation before version
        return `${parts[0]}/upload/${transformation}/${afterUpload}`
      } else {
        // Transformation already exists, replace it
        const versionMatch = afterUpload.match(/^(.+)\/(v\d+\/.+)$/)
        if (versionMatch) {
          return `${parts[0]}/upload/${transformation}/${versionMatch[2]}`
        }
      }
    }
  }
  
  return url
}
