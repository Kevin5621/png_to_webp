'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { convertImage } from '@/lib/api'
import { ConvertResponse } from '@/lib/types'

export function ImageConverter() {
  const [isConverting, setIsConverting] = useState(false)
  const [result, setResult] = useState<ConvertResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsConverting(true)
    setError(null)
    setResult(null)

    try {
      const response = await convertImage(file)
      setResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed')
    } finally {
      setIsConverting(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  })

  const downloadWebP = () => {
    if (!result) return

    const link = document.createElement('a')
    link.href = `data:image/webp;base64,${result.webp_data}`
    link.download = result.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isConverting ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          {isConverting ? (
            <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin" />
          ) : (
            <Upload className="w-12 h-12 mx-auto text-gray-400" />
          )}
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isConverting ? 'Converting...' : 'Drop your PNG image here'}
            </h3>
            <p className="text-gray-500 mt-1">
              {isConverting 
                ? 'Please wait while we process your image' 
                : 'or click to browse files (max 50MB)'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-4">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-700 font-semibold">Conversion Successful!</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Original Size</p>
              <p className="text-lg font-semibold">{formatFileSize(result.original_size)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">WebP Size</p>
              <p className="text-lg font-semibold">{formatFileSize(result.converted_size)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Size Reduction</p>
              <p className="text-lg font-semibold text-green-600">
                {result.compression_ratio.toFixed(1)}%
              </p>
            </div>
          </div>

          <button
            onClick={downloadWebP}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <Download className="w-5 h-5 mr-2" />
            Download WebP Image
          </button>
        </div>
      )}
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
