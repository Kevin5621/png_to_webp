'use client'

import { useState } from 'react'
import { Settings, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { CompressionQuality, VideoCompressionSettings } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CompressionSettingsProps {
  readonly settings: VideoCompressionSettings
  readonly onSettingsChange: (settings: VideoCompressionSettings) => void
  readonly disabled?: boolean
}

const qualityOptions: Array<{
  value: CompressionQuality
  label: string
  description: string
  estimatedSize: string
  speed: string
}> = [
  {
    value: 'maximum',
    label: 'Maximum Compression',
    description: 'Smallest file size, lower quality',
    estimatedSize: '~70-85% reduction',
    speed: 'Fast'
  },
  {
    value: 'high',
    label: 'High Compression',
    description: 'Good balance of size and quality',
    estimatedSize: '~60-75% reduction',
    speed: 'Medium'
  },
  {
    value: 'balanced',
    label: 'Balanced',
    description: 'Balanced compression and quality',
    estimatedSize: '~50-65% reduction',
    speed: 'Medium'
  },
  {
    value: 'low',
    label: 'Low Compression',
    description: 'Better quality, larger file size',
    estimatedSize: '~35-50% reduction',
    speed: 'Slow'
  },
  {
    value: 'minimal',
    label: 'Minimal Compression',
    description: 'Highest quality, largest file size',
    estimatedSize: '~20-35% reduction',
    speed: 'Slowest'
  }
]

const audioBitrateOptions = [
  { value: '32k', label: '32 kbps - Very Low' },
  { value: '64k', label: '64 kbps - Low (Default)' },
  { value: '96k', label: '96 kbps - Medium' },
  { value: '128k', label: '128 kbps - High' },
  { value: '192k', label: '192 kbps - Very High' }
]

export function CompressionSettings({ 
  settings, 
  onSettingsChange, 
  disabled = false 
}: CompressionSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const currentQuality = qualityOptions.find(opt => opt.value === settings.quality)
  const currentAudioBitrate = audioBitrateOptions.find(opt => opt.value === (settings.audioBitrate || '64k'))

  const handleQualityChange = (quality: CompressionQuality) => {
    onSettingsChange({
      ...settings,
      quality
    })
  }

  const handleAudioBitrateChange = (audioBitrate: string) => {
    onSettingsChange({
      ...settings,
      audioBitrate
    })
  }

  const resetToDefaults = () => {
    onSettingsChange({
      quality: 'high',
      audioBitrate: '64k'
    })
  }

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className="w-full justify-between"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span>Compression Settings</span>
          <Badge variant="secondary" className="text-xs">
            {currentQuality?.label}
          </Badge>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {isOpen && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              Video Compression Settings
              <Info className="h-3 w-3 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Quality Level</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={disabled}>
                      {currentQuality?.label}
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    {qualityOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => handleQualityChange(option.value)}
                        className="flex flex-col items-start p-3 space-y-1"
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {option.estimatedSize} • {option.speed} encoding
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {currentQuality && (
                <div className="text-xs text-muted-foreground p-3 bg-muted rounded-md space-y-1">
                  <div><strong>Expected reduction:</strong> {currentQuality.estimatedSize}</div>
                  <div><strong>Encoding speed:</strong> {currentQuality.speed}</div>
                  <div><strong>Description:</strong> {currentQuality.description}</div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Audio Quality</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={disabled}>
                      {currentAudioBitrate?.label || '64 kbps - Low (Default)'}
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {audioBitrateOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => handleAudioBitrateChange(option.value)}
                      >
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="text-xs text-muted-foreground p-3 bg-muted rounded-md">
                <div className="flex items-center gap-1 mb-1">
                  <Info className="h-3 w-3" />
                  <strong>Audio Compression Tips:</strong>
                </div>
                <div>Lower bitrates create smaller files but may reduce audio quality. 64k is sufficient for most purposes.</div>
              </div>
            </div>

            <DropdownMenuSeparator />

            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                Higher compression = smaller files but lower quality
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={resetToDefaults}
                disabled={disabled}
              >
                Reset to Defaults
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
