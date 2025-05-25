'use client';
import { useState, useEffect } from 'react';
import { EstimationTemplate, EstimationTemplateFormData } from '@/lib/types';
import { dataManager } from '@/lib/data';
import { useToast } from './useToast';

export const useEstimationTemplates = () => {
  const [templates, setTemplates] = useState<EstimationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const data = await dataManager.getEstimationTemplates();
      setTemplates(data);
    } catch (error) {
      showToast('Failed to fetch estimation templates', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const createTemplate = async (templateData: EstimationTemplateFormData): Promise<EstimationTemplate | null> => {
    try {
      const newTemplate = await dataManager.createEstimationTemplate(templateData);
      setTemplates(prev => [...prev, newTemplate]);
      showToast('Estimation template created successfully', 'success');
      return newTemplate;
    } catch (error) {
      showToast('Failed to create estimation template', 'error');
      return null;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<EstimationTemplate>): Promise<EstimationTemplate | null> => {
    try {
      const updatedTemplate = await dataManager.updateEstimationTemplate(id, updates);
      if (updatedTemplate) {
        setTemplates(prev => prev.map(template => template.id === id ? updatedTemplate : template));
        showToast('Estimation template updated successfully', 'success');
      }
      return updatedTemplate;
    } catch (error) {
      showToast('Failed to update estimation template', 'error');
      return null;
    }
  };

  const deleteTemplate = async (id: string): Promise<boolean> => {
    try {
      const success = await dataManager.deleteEstimationTemplate(id);
      if (success) {
        setTemplates(prev => prev.filter(template => template.id !== id));
        showToast('Estimation template deleted successfully', 'success');
      }
      return success;
    } catch (error) {
      showToast('Failed to delete estimation template', 'error');
      return false;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: fetchTemplates,
  };
};
