import axios from 'axios'
import { ConvertResponse, ApiError, BatchConvertResponse } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for large file uploads
})

/**
 * Convert PNG image to WebP format
 * @param file - PNG file to convert
 * @returns Promise<ConvertResponse> - Conversion result with WebP data
 */
export async function convertImage(file: File): Promise<ConvertResponse> {
  if (!file.type.includes('png')) {
    throw new Error('Only PNG files are supported')
  }

  const formData = new FormData()
  formData.append('image', file)

  try {
    console.log('🚀 Sending request to:', `${API_BASE_URL}/api/convert`)
    console.log('📁 File size:', file.size, 'bytes')
    
    const response = await api.post<ConvertResponse>('/api/convert', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    console.log('✅ Response received:', response.status)
    return response.data
  } catch (error) {
    console.error('❌ Request failed:', error)
    
    if (axios.isAxiosError(error)) {
      console.error('📡 Axios error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      })
      
      const errorData = error.response?.data as ApiError | undefined
      
      if (errorData && !errorData.success) {
        throw new Error(errorData.error)
      }
      
      if (error.response?.status === 413) {
        throw new Error('File size too large. Maximum allowed size is 50MB.')
      }
      
      if (error.response && error.response.status >= 500) {
        throw new Error('Server error occurred. Please try again later.')
      }
      
      // Network errors (no response received)
      if (!error.response) {
        throw new Error(`Network error: ${error.message}. Check if backend is running on ${API_BASE_URL}`)
      }
      
      throw new Error(error.message || 'Network error occurred')
    }
    
    throw new Error('An unexpected error occurred')
  }
}

/**
 * Video compression quality levels
 */
export type CompressionQuality = 'maximum' | 'high' | 'balanced' | 'low' | 'minimal'

/**
 * Video compression settings
 */
export interface VideoCompressionSettings {
  quality: CompressionQuality
  audioBitrate?: string
}

/**
 * Handle video conversion API errors
 */
function handleVideoConversionError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const errorData = error.response?.data as ApiError | undefined
    if (errorData && !errorData.success) {
      throw new Error(errorData.error)
    }
    if (error.response?.status === 413) {
      throw new Error('File size too large. Maximum allowed size is 200MB.')
    }
    if (!error.response) {
      throw new Error(`Network error: ${error.message}. Check if backend is running on ${API_BASE_URL}`)
    }
    throw new Error(error.message || 'Network error occurred')
  }
  throw new Error('An unexpected error occurred')
}

/**
 * Create FormData for video conversion
 */
function createVideoFormData(file: File, settings?: VideoCompressionSettings): FormData {
  const formData = new FormData()
  formData.append('video', file)
  
  if (settings) {
    console.log('📋 Adding compression settings:', settings)
    formData.append('quality', settings.quality)
    console.log('  ✓ Added quality:', settings.quality)
    if (settings.audioBitrate) {
      formData.append('audio_bitrate', settings.audioBitrate)
      console.log('  ✓ Added audio_bitrate:', settings.audioBitrate)
    }
  }
  
  return formData
}

/**
 * Convert MP4 video to WebM format
 * @param file - MP4 file to convert
 * @param settings - Optional compression settings
 * @returns Promise<ConvertResponse> - Conversion result with WebM data (base64)
 */
export async function convertVideo(
  file: File, 
  settings?: VideoCompressionSettings
): Promise<ConvertResponse> {
  if (!file.type.includes('mp4') && !file.name.toLowerCase().endsWith('.mp4')) {
    throw new Error('Only MP4 files are supported')
  }

  const formData = createVideoFormData(file, settings)

  try {
    const response = await api.post<ConvertResponse>('/api/convert-video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5 minutes timeout for video conversion
    })

    return response.data
  } catch (error) {
    handleVideoConversionError(error)
  }
}

/**
 * Convert multiple PNG images to WebP format
 * @param files - Array of PNG files to convert
 * @param onProgress - Optional callback for progress updates
 * @returns Promise<BatchConvertResponse> - Batch conversion results
 */
export async function convertMultipleImages(
  files: File[],
  onProgress?: (current: number, total: number) => void
): Promise<BatchConvertResponse> {
  const results: ConvertResponse[] = []
  const errors: string[] = []
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    onProgress?.(i + 1, files.length)
    
    try {
      const result = await convertImage(file)
      results.push(result)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      errors.push(`${file.name}: ${errorMessage}`)
    }
  }
  
  return {
    success: true,
    message: `Converted ${results.length} of ${files.length} files`,
    results,
    total_files: files.length,
    successful_conversions: results.length,
    failed_conversions: errors.length,
    errors,
  }
}

/**
 * Check if the backend service is healthy
 * @returns Promise<boolean> - Service health status
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await api.get('/health')
    return response.data.status === 'healthy'
  } catch {
    return false
  }
}
