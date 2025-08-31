 'use client'

import { useState, useCallback } from 'react'
import {
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2,
  CloudUpload,
  FileVideo,
  MoreHorizontal,
  Check
} from 'lucide-react'
import {
  convertVideo,
  type VideoCompressionSettings
} from '@/lib/api'
import { ConvertResponse } from '@/lib/types'
import {
  useFileUpload,
  formatBytes,
  type FileWithPreview
} from '@/hooks/use-file-upload'
import { useConversionHistory } from '@/hooks/use-conversion-history'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { CompressionSettings } from '@/components/CompressionSettings'
import { cn } from '@/lib/utils'

interface FileUploadItem extends FileWithPreview {
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
  result?: ConvertResponse
}

export function VideoConverter() {
  const [uploadFiles, setUploadFiles] = useState<FileUploadItem[]>([])
  const [isConverting, setIsConverting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [globalProgress, setGlobalProgress] = useState(0)
  const [compressionSettings, setCompressionSettings] = useState<VideoCompressionSettings>({
    quality: 'high',
    audioBitrate: '64k'
  })

  const {
    history,
    selectedItems: selectedHistoryItems,
    addToHistory,
    removeFromHistory,
    removeMultipleFromHistory,
    clearHistory,
    toggleSelection: toggleHistorySelection,
    selectAll: selectAllHistory,
    deselectAll: deselectAllHistory,
    downloadItem,
    downloadMultiple,
  } = useConversionHistory()

  const [
    { isDragging, errors },
    {
      removeFile,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    maxFiles: 20,
    maxSize: 200 * 1024 * 1024, // 200MB
    accept: 'video/mp4',
    multiple: true,
    onFilesChange: (newFiles) => {
      const newUploadFiles = newFiles.map((file): FileUploadItem => {
        const existingFile = uploadFiles.find(existing => existing.id === file.id)
        if (existingFile) {
          return { ...existingFile, ...file }
        }
        return {
          ...file,
          progress: 0,
          status: 'pending',
        }
      })
      setUploadFiles(newUploadFiles)
    },
  })

  const convertSingleFile = useCallback(async (file: File): Promise<ConvertResponse> => {
    return await convertVideo(file, compressionSettings)
  }, [compressionSettings])

  const convertAllFiles = useCallback(async () => {
    if (uploadFiles.length === 0) return

    setIsConverting(true)
    setGlobalProgress(0)

    try {
      setUploadFiles(prev => prev.map(file => ({
        ...file,
        status: 'uploading' as const,
        progress: 0,
        error: undefined,
      })))

      for (let i = 0; i < uploadFiles.length; i++) {
        const fileItem = uploadFiles[i]
        try {
          setUploadFiles(prev => prev.map(f => 
            f.id === fileItem.id 
              ? { ...f, status: 'uploading' as const, progress: 50 }
              : f
          ))

          const result = await convertSingleFile(fileItem.file)

          setUploadFiles(prev => prev.map(f => 
            f.id === fileItem.id 
              ? { ...f, status: 'completed' as const, progress: 100, result }
              : f
          ))

          addToHistory(result)

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Conversion failed'
          setUploadFiles(prev => prev.map(f => 
            f.id === fileItem.id 
              ? { ...f, status: 'error' as const, progress: 0, error: errorMessage }
              : f
          ))
        }

        setGlobalProgress(((i + 1) / uploadFiles.length) * 100)
      }

    } finally {
      setIsConverting(false)
      setGlobalProgress(0)
    }
  }, [uploadFiles, convertSingleFile, addToHistory])

  const removeUploadFile = useCallback((fileId: string) => {
    setUploadFiles(prev => prev.filter(file => file.id !== fileId))
    removeFile(fileId)
    setSelectedFiles(prev => {
      const newSet = new Set(prev)
      newSet.delete(fileId)
      return newSet
    })
  }, [removeFile])

  const removeSelectedFiles = useCallback(() => {
    const idsToRemove = Array.from(selectedFiles)
    setUploadFiles(prev => prev.filter(file => !selectedFiles.has(file.id)))
    idsToRemove.forEach(id => removeFile(id))
    setSelectedFiles(new Set())
  }, [selectedFiles, removeFile])

  const toggleFileSelection = useCallback((fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fileId)) {
        newSet.delete(fileId)
      } else {
        newSet.add(fileId)
      }
      return newSet
    })
  }, [])

  const selectAllFiles = useCallback(() => {
    setSelectedFiles(new Set(uploadFiles.map(file => file.id)))
  }, [uploadFiles])

  const deselectAllFiles = useCallback(() => {
    setSelectedFiles(new Set())
  }, [])

  const downloadCompletedFiles = useCallback(() => {
    uploadFiles
      .filter(file => file.status === 'completed' && file.result)
      .forEach((file, index) => {
        setTimeout(() => {
          const link = document.createElement('a')
          // The API returns converted data in result.webp_data; use video/webm MIME when downloading
          link.href = `data:video/webm;base64,${file.result!.webp_data}`
          link.download = file.result!.filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }, index * 100)
      })
  }, [uploadFiles])

  const retryFailedFiles = useCallback(() => {
    setUploadFiles(prev => prev.map(file => 
      file.status === 'error' 
        ? { ...file, status: 'pending' as const, progress: 0, error: undefined }
        : file
    ))
  }, [])

  const renderProgressCell = (fileItem: FileUploadItem) => {
    if (fileItem.status === 'uploading') {
      return <Progress value={fileItem.progress} className="w-20" />
    }
    if (fileItem.status === 'completed') {
      return <Progress value={100} className="w-20" />
    }
    return <div className="w-20 h-2 bg-muted rounded" />
  }

  const getFileIcon = () => <FileVideo className="h-4 w-4" />

  const completedFiles = uploadFiles.filter(file => file.status === 'completed')
  const failedFiles = uploadFiles.filter(file => file.status === 'error')

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>MP4 to WebM Converter</CardTitle>
        </CardHeader>
        <CardContent>
          <CompressionSettings
            settings={compressionSettings}
            onSettingsChange={setCompressionSettings}
            disabled={isConverting}
          />

          <Separator className="my-4" />

          <div
            className={cn(
              'relative rounded-lg border border-dashed p-8 text-center transition-colors cursor-pointer',
              isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50',
              isConverting && 'pointer-events-none opacity-50'
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={openFileDialog}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                openFileDialog()
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Upload files"
          >
            <input {...getInputProps()} className="sr-only" />

            <div className="flex flex-col items-center gap-4">
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full bg-muted transition-colors',
                  isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25',
                )}
              >
                {isConverting ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                ) : (
                  <Upload className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {isConverting 
                    ? 'Converting files...' 
                    : 'Drop MP4 files here or click to browse'
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  Maximum file size: 200MB • Maximum files: 20
                </p>
              </div>

              {isConverting && (
                <div className="w-full max-w-xs">
                  <Progress value={globalProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1 text-center">
                    {Math.round(globalProgress)}% complete
                  </p>
                </div>
              )}
            </div>
          </div>

          {uploadFiles.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedFiles.size === uploadFiles.length && uploadFiles.length > 0}
                  onCheckedChange={(checked: boolean) => {
                    if (checked) {
                      selectAllFiles()
                    } else {
                      deselectAllFiles()
                    }
                  }}
                />
                <span className="text-sm text-muted-foreground">
                  {selectedFiles.size > 0 ? `${selectedFiles.size} selected` : `${uploadFiles.length} files`}
                </span>
              </div>

              <div className="flex gap-2">
                {selectedFiles.size > 0 && (
                  <Button 
                    onClick={removeSelectedFiles} 
                    variant="outline" 
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove Selected
                  </Button>
                )}
                {failedFiles.length > 0 && (
                  <Button onClick={retryFailedFiles} variant="outline" size="sm">
                    Retry Failed
                  </Button>
                )}
                {completedFiles.length > 0 && (
                  <Button onClick={downloadCompletedFiles} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download All
                  </Button>
                )}
                <Button 
                  onClick={convertAllFiles} 
                  disabled={isConverting || uploadFiles.length === 0}
                  className="min-w-[120px]"
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <CloudUpload className="h-4 w-4 mr-1" />
                      Convert All
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {uploadFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Queue ({uploadFiles.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedFiles.size === uploadFiles.length && uploadFiles.length > 0}
                      onCheckedChange={(checked: boolean) => {
                        if (checked) {
                          selectAllFiles()
                        } else {
                          deselectAllFiles()
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadFiles.map((fileItem) => (
                  <TableRow key={fileItem.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedFiles.has(fileItem.id)}
                        onCheckedChange={() => toggleFileSelection(fileItem.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFileIcon()}
                        <span className="font-medium">{fileItem.file.name}</span>
                        {fileItem.status === 'error' && (
                          <Badge variant="destructive" className="text-xs">
                            Error
                          </Badge>
                        )}
                        {fileItem.status === 'completed' && (
                          <Badge variant="default" className="text-xs bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Done
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatBytes(fileItem.file.size)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {fileItem.status === 'uploading' && (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        )}
                        {fileItem.status === 'completed' && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {fileItem.status === 'error' && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="capitalize text-sm">
                          {fileItem.status === 'uploading' ? 'Converting' : fileItem.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {renderProgressCell(fileItem)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {fileItem.status === 'completed' && fileItem.result && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a')
                              link.href = `data:video/webm;base64,${fileItem.result!.webp_data}`
                              link.download = fileItem.result!.filename
                              document.body.appendChild(link)
                              link.click()
                              document.body.removeChild(link)
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUploadFile(fileItem.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Conversion History ({history.length})</CardTitle>
              <div className="flex items-center gap-2">
                {selectedHistoryItems.size > 0 && (
                  <>
                    <Button
                      onClick={() => downloadMultiple(Array.from(selectedHistoryItems))}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download Selected
                    </Button>
                    <Button
                      onClick={() => removeMultipleFromHistory(Array.from(selectedHistoryItems))}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete Selected
                    </Button>
                  </>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={selectAllHistory}>
                      <Check className="h-4 w-4 mr-2" />
                      Select All
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={deselectAllHistory}>
                      Deselect All
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={clearHistory}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All History
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedHistoryItems.size === history.length && history.length > 0}
                      onCheckedChange={(checked: boolean) => {
                        if (checked) {
                          selectAllHistory()
                        } else {
                          deselectAllHistory()
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Filename</TableHead>
                  <TableHead>Original Size</TableHead>
                  <TableHead>WebM Size</TableHead>
                  <TableHead>Savings</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedHistoryItems.has(item.id)}
                        onCheckedChange={() => toggleHistorySelection(item.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFileIcon()}
                        <span className="font-medium">{item.filename}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatBytes(item.originalSize)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatBytes(item.convertedSize)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {item.compressionRatio.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadItem(item)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromHistory(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
