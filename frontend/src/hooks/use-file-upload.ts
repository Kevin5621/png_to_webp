'use client';

import { useState, useCallback, useRef } from 'react';

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface FileWithPreview extends FileMetadata {
  file: File;
  preview?: string;
}

export interface FileUploadOptions {
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  multiple?: boolean;
  initialFiles?: FileMetadata[];
  onFilesChange?: (files: FileWithPreview[]) => void;
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function useFileUpload(options: FileUploadOptions) {
  const {
    maxFiles = 10,
    maxSize = 50 * 1024 * 1024, // 50MB
    accept = '*',
    multiple = true,
    initialFiles = [],
    onFilesChange,
  } = options;

  const [files, setFiles] = useState<FileWithPreview[]>(() => {
    return initialFiles.map(file => ({
      ...file,
      file: new File([], file.name, { type: file.type }),
      preview: file.url,
    }));
  });
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback((newFiles: File[]): File[] => {
    const validFiles: File[] = [];
    const newErrors: string[] = [];

    for (const file of newFiles) {
      // Check file count
      if (files.length + validFiles.length >= maxFiles) {
        newErrors.push(`Maximum ${maxFiles} files allowed`);
        break;
      }

      // Check file size
      if (file.size > maxSize) {
        newErrors.push(`File "${file.name}" is too large. Maximum size is ${formatBytes(maxSize)}`);
        continue;
      }

      // Check file type
      if (accept !== '*' && !accept.split(',').some(type => file.type.includes(type.trim()))) {
        newErrors.push(`File "${file.name}" is not an accepted file type`);
        continue;
      }

      // Check for duplicates
      const isDuplicate = files.some(existingFile => 
        existingFile.name === file.name && existingFile.size === file.size
      );
      if (isDuplicate) {
        newErrors.push(`File "${file.name}" is already added`);
        continue;
      }

      validFiles.push(file);
    }

    setErrors(newErrors);
    return validFiles;
  }, [files, maxFiles, maxSize, accept]);

  const addFiles = useCallback((newFiles: File[]) => {
    const validFiles = validateFiles(newFiles);
    
    if (validFiles.length > 0) {
      const filesWithPreview: FileWithPreview[] = validFiles.map(file => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        let preview: string | undefined;

        // Create preview for images
        if (file.type.startsWith('image/')) {
          preview = URL.createObjectURL(file);
        }

        return {
          id,
          name: file.name,
          size: file.size,
          type: file.type,
          file,
          preview,
        };
      });

      const updatedFiles = [...files, ...filesWithPreview];
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
    }
  }, [files, validateFiles, onFilesChange]);

  const removeFile = useCallback((fileId: string) => {
    const updatedFiles = files.filter(file => {
      if (file.id === fileId) {
        // Clean up preview URL
        if (file.preview && file.preview.startsWith('blob:')) {
          URL.revokeObjectURL(file.preview);
        }
        return false;
      }
      return true;
    });
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  }, [files, onFilesChange]);

  const removeFiles = useCallback((fileIds: string[]) => {
    const updatedFiles = files.filter(file => {
      if (fileIds.includes(file.id)) {
        // Clean up preview URL
        if (file.preview && file.preview.startsWith('blob:')) {
          URL.revokeObjectURL(file.preview);
        }
        return false;
      }
      return true;
    });
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  }, [files, onFilesChange]);

  const clearFiles = useCallback(() => {
    // Clean up preview URLs
    files.forEach(file => {
      if (file.preview && file.preview.startsWith('blob:')) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    setErrors([]);
    onFilesChange?.([]);
  }, [files, onFilesChange]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, [addFiles]);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [addFiles]);

  const getInputProps = useCallback(() => ({
    ref: fileInputRef,
    type: 'file' as const,
    multiple,
    accept,
    onChange: handleFileInputChange,
  }), [multiple, accept, handleFileInputChange]);

  return [
    {
      files,
      isDragging,
      errors,
    },
    {
      addFiles,
      removeFile,
      removeFiles,
      clearFiles,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] as const;
}
