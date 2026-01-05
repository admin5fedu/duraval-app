/**
 * API service for Sản phẩm xuất VAT
 * Fetches data from Google Apps Script API with retry logic and error handling
 */

import type { SanPhamXuatVatRaw, SanPhamXuatVat } from "../types"
import { sanPhamXuatVatRawSchema, transformSanPhamXuatVat } from "../schema"
import { z } from "zod"

const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyw6nou2-DE_e749bLj69pZFOH7I9E_CUOAZQTFQdmbv9Fuq8TRMEebxLEHZcDzF3Cr2w/exec"

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second
const TIMEOUT = 30000 // 30 seconds

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = TIMEOUT
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeout}ms`)
    }
    throw error
  }
}

/**
 * Fetch data from Google Apps Script API with retry logic
 */
async function fetchWithRetry(
  url: string,
  retries: number = MAX_RETRIES
): Promise<SanPhamXuatVatRaw[]> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // ⚠️ Important: Don't add custom headers to avoid CORS preflight request
      // Google Apps Script web apps don't handle preflight requests well
      // Simple GET request without headers works better
      // Note: Google Apps Script web app must be deployed with:
      // - Execute as: Me
      // - Who has access: Anyone
      const response = await fetchWithTimeout(url, {
        method: "GET",
        mode: "cors", // Explicitly request CORS
        credentials: "omit", // Don't send cookies to avoid CORS issues
        cache: "no-cache", // Don't cache to get fresh data
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Validate data structure
      if (!Array.isArray(data)) {
        // Check if data is wrapped in an object (e.g., { data: [...] })
        if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
          return data.data.map((item: any) => sanPhamXuatVatRawSchema.parse(item))
        }
        throw new Error("Invalid data format: expected array")
      }

      // Parse and validate each item
      // Ensure each item is a plain object, not nested
      const validatedData = data.map((item: any) => {
        // If item is wrapped, unwrap it
        if (item && typeof item === 'object' && 'data' in item) {
          item = item.data
        }
        return sanPhamXuatVatRawSchema.parse(item)
      })

      return validatedData
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry on the last attempt
      if (attempt < retries) {
        const delay = RETRY_DELAY * Math.pow(2, attempt) // Exponential backoff
        console.warn(
          `Failed to fetch data (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay}ms...`,
          lastError.message
        )
        await sleep(delay)
      }
    }
  }

  // All retries failed
  throw new Error(
    `Failed to fetch data after ${retries + 1} attempts: ${lastError?.message || "Unknown error"}`
  )
}

/**
 * API service for Sản phẩm xuất VAT
 */
export class SanPhamXuatVatAPI {
  /**
   * Get all records from Google Apps Script API
   * Transforms raw data to normalized format with auto-generated index
   */
  static async getAll(): Promise<SanPhamXuatVat[]> {
    try {
      const rawData = await fetchWithRetry(GOOGLE_APPS_SCRIPT_URL)

      // Transform and add index
      // Ensure all values are primitives (no nested objects) to prevent React rendering errors
      return rawData.map((item, index) => {
        // Type assertion: schema transform ensures correct types
        const transformed = transformSanPhamXuatVat(item as z.infer<typeof sanPhamXuatVatRawSchema>, index + 1)
        
        // Double-check: ensure no nested objects in the transformed data
        return {
          index: typeof transformed.index === 'number' ? transformed.index : index + 1,
          ma_hang: String(transformed.ma_hang || ''),
          ten_hang_hoa: String(transformed.ten_hang_hoa || ''),
          dvt: String(transformed.dvt || ''),
          so_luong_ton: typeof transformed.so_luong_ton === 'number' ? transformed.so_luong_ton : 0,
          gia_xuat: typeof transformed.gia_xuat === 'number' ? transformed.gia_xuat : 0,
          thue_suat: transformed.thue_suat !== null && typeof transformed.thue_suat === 'number' ? transformed.thue_suat : null,
          loai_san_pham: transformed.loai_san_pham !== null ? String(transformed.loai_san_pham) : null,
        }
      })
    } catch (error) {
      console.error("Lỗi khi tải danh sách sản phẩm xuất VAT:", error)
      throw error
    }
  }

  /**
   * Get record by index (auto-generated row number)
   */
  static async getById(index: number): Promise<SanPhamXuatVat | null> {
    try {
      const allData = await this.getAll()
      const item = allData.find((item) => item.index === index)
      return item || null
    } catch (error) {
      console.error(`Lỗi khi tải chi tiết sản phẩm xuất VAT (index: ${index}):`, error)
      throw error
    }
  }
}

