'use client'

import { ImageConverter } from '@/components/ImageConverter'
import { Header } from '@/components/Header'

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Header />
      <div className="mt-8">
        <ImageConverter />
      </div>
    </main>
  )
}
