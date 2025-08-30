export interface ConvertResponse {
  success: boolean
  message: string
  filename: string
  webp_data: string  // Base64 encoded WebP data
  original_size: number
  converted_size: number
  compression_ratio: number  // Percentage saved
}

export interface ApiError {
  success: boolean
  error: string
  code: string
  timestamp: string
}
