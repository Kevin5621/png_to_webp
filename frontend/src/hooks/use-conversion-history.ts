'use client';

import { useState, useCallback, useEffect } from 'react';
import { ConvertResponse } from '@/lib/types';

export interface ConversionHistoryItem {
  id: string;
  filename: string;
  originalSize: number;
  convertedSize: number;
  compressionRatio: number;
  webpData: string;
  timestamp: Date;
  selected?: boolean;
}

const STORAGE_KEY = 'png-to-webp-history';

export function useConversionHistory() {
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const historyWithDates = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setHistory(historyWithDates);
      }
    } catch (error) {
      console.error('Failed to load conversion history:', error);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save conversion history:', error);
    }
  }, [history]);

  const addToHistory = useCallback((result: ConvertResponse) => {
    const historyItem: ConversionHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      filename: result.filename,
      originalSize: result.original_size,
      convertedSize: result.converted_size,
      compressionRatio: result.compression_ratio,
      webpData: result.webp_data,
      timestamp: new Date(),
    };

    setHistory(prev => [historyItem, ...prev]);
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const removeMultipleFromHistory = useCallback((ids: string[]) => {
    setHistory(prev => prev.filter(item => !ids.includes(item.id)));
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      ids.forEach(id => newSet.delete(id));
      return newSet;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setSelectedItems(new Set());
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedItems(new Set(history.map(item => item.id)));
  }, [history]);

  const deselectAll = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const downloadItem = useCallback((item: ConversionHistoryItem) => {
    const link = document.createElement('a');
    link.href = `data:image/webp;base64,${item.webpData}`;
    link.download = item.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const downloadMultiple = useCallback((ids: string[]) => {
    const itemsToDownload = history.filter(item => ids.includes(item.id));
    
    itemsToDownload.forEach((item, index) => {
      setTimeout(() => {
        downloadItem(item);
      }, index * 100); // Small delay between downloads
    });
  }, [history, downloadItem]);

  return {
    history,
    selectedItems,
    addToHistory,
    removeFromHistory,
    removeMultipleFromHistory,
    clearHistory,
    toggleSelection,
    selectAll,
    deselectAll,
    downloadItem,
    downloadMultiple,
  };
}
