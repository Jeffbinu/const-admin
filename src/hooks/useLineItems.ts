'use client';
import { useState, useEffect } from 'react';
import { LineItem, LineItemFormData } from '@/lib/types';
import { dataManager } from '@/lib/data';
import { useToast } from './useToast';

export const useLineItems = () => {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const fetchLineItems = async () => {
    try {
      setIsLoading(true);
      const data = await dataManager.getLineItems();
      setLineItems(data);
    } catch (error) {
      showToast('Failed to fetch line items', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const createLineItem = async (itemData: LineItemFormData): Promise<LineItem | null> => {
    try {
      const newItem = await dataManager.createLineItem(itemData);
      setLineItems(prev => [...prev, newItem]);
      showToast('Line item created successfully', 'success');
      return newItem;
    } catch (error) {
      showToast('Failed to create line item', 'error');
      return null;
    }
  };

  const updateLineItem = async (id: string, updates: Partial<LineItem>): Promise<LineItem | null> => {
    try {
      const updatedItem = await dataManager.updateLineItem(id, updates);
      if (updatedItem) {
        setLineItems(prev => prev.map(item => item.id === id ? updatedItem : item));
        showToast('Line item updated successfully', 'success');
      }
      return updatedItem;
    } catch (error) {
      showToast('Failed to update line item', 'error');
      return null;
    }
  };

  const deleteLineItem = async (id: string): Promise<boolean> => {
    try {
      const success = await dataManager.deleteLineItem(id);
      if (success) {
        setLineItems(prev => prev.filter(item => item.id !== id));
        showToast('Line item deleted successfully', 'success');
      }
      return success;
    } catch (error) {
      showToast('Failed to delete line item', 'error');
      return false;
    }
  };

  useEffect(() => {
    fetchLineItems();
  }, []);

  return {
    lineItems,
    isLoading,
    createLineItem,
    updateLineItem,
    deleteLineItem,
    refetch: fetchLineItems,
  };
};
