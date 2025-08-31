 'use client'

import { Header } from '@/components/Header'
import { VideoConverter } from '@/components/VideoConverter'

export default function Mp4ToWebmPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Header />
      <div className="mt-8">
        <VideoConverter />
      </div>
    </main>
  )
}
