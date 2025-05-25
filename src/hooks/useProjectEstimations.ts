// hooks/useProjectEstimations.ts
'use client';
import { useState, useEffect } from 'react';
import { ProjectEstimation, ProjectEstimationItem, UseProjectEstimationsReturn } from '@/lib/types';
import { dataManager } from '@/lib/data';
import { useToast } from './useToast';

export const useProjectEstimations = (projectId?: string): UseProjectEstimationsReturn => {
  const [estimations, setEstimations] = useState<ProjectEstimation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const fetchEstimations = async (targetProjectId: string) => {
    try {
      setIsLoading(true);
      const data = await dataManager.getProjectEstimations(targetProjectId);
      setEstimations(data);
    } catch (error) {
      console.error('Failed to fetch project estimations:', error);
      showToast('Failed to fetch project estimations', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const createFromTemplate = async (
    projectId: string, 
    templateId: string, 
    name: string
  ): Promise<ProjectEstimation | null> => {
    try {
      setIsLoading(true);
      const newEstimation = await dataManager.createProjectEstimationFromTemplate(
        projectId, 
        templateId, 
        name
      );
      
      setEstimations(prev => [newEstimation, ...prev.map(est => ({ ...est, isActive: false }))]);
      showToast('Estimation created successfully from template', 'success');
      return newEstimation;
    } catch (error) {
      console.error('Failed to create estimation from template:', error);
      showToast('Failed to create estimation from template', 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async (
    estimationId: string, 
    itemId: string, 
    updates: Partial<ProjectEstimationItem>
  ): Promise<ProjectEstimation | null> => {
    try {
      const updatedEstimation = await dataManager.updateProjectEstimationItem(
        estimationId, 
        itemId, 
        updates
      );
      
      setEstimations(prev => 
        prev.map(est => est.id === estimationId ? updatedEstimation : est)
      );
      showToast('Estimation item updated successfully', 'success');
      return updatedEstimation;
    } catch (error) {
      console.error('Failed to update estimation item:', error);
      showToast('Failed to update estimation item', 'error');
      return null;
    }
  };

  const deleteItem = async (
    estimationId: string, 
    itemId: string
  ): Promise<ProjectEstimation | null> => {
    try {
      const updatedEstimation = await dataManager.deleteProjectEstimationItem(
        estimationId, 
        itemId
      );
      
      setEstimations(prev => 
        prev.map(est => est.id === estimationId ? updatedEstimation : est)
      );
      showToast('Estimation item deleted successfully', 'success');
      return updatedEstimation;
    } catch (error) {
      console.error('Failed to delete estimation item:', error);
      showToast('Failed to delete estimation item', 'error');
      return null;
    }
  };

  const setActive = async (projectId: string, estimationId: string): Promise<boolean> => {
    try {
      const success = await dataManager.setActiveProjectEstimation(projectId, estimationId);
      
      if (success) {
        setEstimations(prev => 
          prev.map(est => ({ ...est, isActive: est.id === estimationId }))
        );
        showToast('Active estimation updated successfully', 'success');
      }
      
      return success;
    } catch (error) {
      console.error('Failed to set active estimation:', error);
      showToast('Failed to set active estimation', 'error');
      return false;
    }
  };

  const duplicate = async (estimationId: string, newName: string): Promise<ProjectEstimation | null> => {
    try {
      setIsLoading(true);
      const duplicatedEstimation = await dataManager.duplicateProjectEstimation(estimationId, newName);
      
      setEstimations(prev => [
        duplicatedEstimation, 
        ...prev.map(est => ({ ...est, isActive: false }))
      ]);
      showToast('Estimation duplicated successfully', 'success');
      return duplicatedEstimation;
    } catch (error) {
      console.error('Failed to duplicate estimation:', error);
      showToast('Failed to duplicate estimation', 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEstimation = async (estimationId: string): Promise<boolean> => {
    try {
      const success = await dataManager.deleteProjectEstimation(estimationId);
      
      if (success) {
        setEstimations(prev => prev.filter(est => est.id !== estimationId));
        showToast('Estimation deleted successfully', 'success');
      }
      
      return success;
    } catch (error) {
      console.error('Failed to delete estimation:', error);
      showToast('Failed to delete estimation', 'error');
      return false;
    }
  };

  const refetch = async (targetProjectId: string) => {
    await fetchEstimations(targetProjectId);
  };

  // Auto-fetch estimations when projectId is provided
  useEffect(() => {
    if (projectId) {
      fetchEstimations(projectId);
    }
  }, [projectId]);

  return {
    estimations,
    isLoading,
    createFromTemplate,
    updateItem,
    deleteItem,
    setActive,
    duplicate,
    deleteEstimation,
    refetch,
  };
};