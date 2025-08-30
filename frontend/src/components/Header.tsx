'use client'

export function Header() {
  return (
    <header className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        PNG to WebP Converter
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Convert your PNG images to WebP format for better web performance. 
        Reduce file size while maintaining high quality.
      </p>
      <div className="mt-4 flex justify-center space-x-6 text-sm text-gray-500">
        <div className="flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Up to 50MB files
        </div>
        <div className="flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          High quality compression
        </div>
        <div className="flex items-center">
          <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
          Fast processing
        </div>
      </div>
    </header>
  )
}
