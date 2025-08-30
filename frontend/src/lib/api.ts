import axios from 'axios'
import { ConvertResponse, ApiError } from './types'

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
