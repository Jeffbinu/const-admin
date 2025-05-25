'use client';
import { useState, useEffect } from 'react';
import { Agreement } from '@/lib/types';
import { dataManager } from '@/lib/data';
import { useToast } from './useToast';

export const useAgreements = () => {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const fetchAgreements = async () => {
    try {
      setIsLoading(true);
      const data = await dataManager.getAgreements();
      setAgreements(data);
    } catch (error) {
      showToast('Failed to fetch agreements', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateAgreement = async (id: string, updates: Partial<Agreement>): Promise<Agreement | null> => {
    try {
      const updatedAgreement = await dataManager.updateAgreement(id, updates);
      if (updatedAgreement) {
        setAgreements(prev => prev.map(agreement => agreement.id === id ? updatedAgreement : agreement));
        showToast('Agreement updated successfully', 'success');
      }
      return updatedAgreement;
    } catch (error) {
      showToast('Failed to update agreement', 'error');
      return null;
    }
  };

  const deleteAgreement = async (id: string): Promise<boolean> => {
    try {
      const success = await dataManager.deleteAgreement(id);
      if (success) {
        setAgreements(prev => prev.filter(agreement => agreement.id !== id));
        showToast('Agreement deleted successfully', 'success');
      }
      return success;
    } catch (error) {
      showToast('Failed to delete agreement', 'error');
      return false;
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, []);

  return {
    agreements,
    isLoading,
    updateAgreement,
    deleteAgreement,
    refetch: fetchAgreements,
  };
};