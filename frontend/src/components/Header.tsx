'use client'

import { usePathname } from 'next/navigation'
import { HealthCheck } from './HealthCheck'
import { Navigation } from './Navigation'

export function Header() {
  const pathname = usePathname()
  
  const getPageInfo = () => {
    if (pathname === '/mp4-to-webm') {
      return {
        title: 'MP4 to WebM Converter',
        description: 'Convert your MP4 videos to WebM format for better web performance. Reduce file size while maintaining high quality.',
        features: [
          { label: 'Up to 200MB files', color: 'bg-green-500' },
          { label: 'VP9/Opus encoding', color: 'bg-blue-500' },
          { label: 'Optimized processing', color: 'bg-purple-500' },
        ]
      }
    }
    
    return {
      title: 'PNG to WebP Converter',
      description: 'Convert your PNG images to WebP format for better web performance. Reduce file size while maintaining high quality.',
      features: [
        { label: 'Up to 50MB files', color: 'bg-green-500' },
        { label: 'High quality compression', color: 'bg-blue-500' },
        { label: 'Fast processing', color: 'bg-purple-500' },
      ]
    }
  }

  const pageInfo = getPageInfo()

  return (
    <header className="text-center">
      <div className="mb-6 flex justify-center">
        <Navigation />
      </div>
      
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        {pageInfo.title}
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        {pageInfo.description}
      </p>
      <div className="mt-4 flex justify-center space-x-6 text-sm text-gray-500">
        {pageInfo.features.map((feature) => (
          <div key={feature.label} className="flex items-center">
            <span className={`w-2 h-2 ${feature.color} rounded-full mr-2`}></span>
            {feature.label}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <HealthCheck />
      </div>
    </header>
  )
}
