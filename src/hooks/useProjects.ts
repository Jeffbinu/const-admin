'use client';
import { useState, useEffect } from 'react';
import { Project, ProjectFormData } from '@/lib/types';
import { dataManager } from '@/lib/data';
import { useToast } from './useToast';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await dataManager.getProjects();
      setProjects(data);
    } catch (error) {
      showToast('Failed to fetch projects', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (projectData: ProjectFormData): Promise<Project | null> => {
    try {
      const newProject = await dataManager.createProject({
        ...projectData,
        status: 'New'
      });
      setProjects(prev => [...prev, newProject]);
      showToast('Project created successfully', 'success');
      return newProject;
    } catch (error) {
      showToast('Failed to create project', 'error');
      return null;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>): Promise<Project | null> => {
    try {
      const updatedProject = await dataManager.updateProject(id, updates);
      if (updatedProject) {
        setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
        showToast('Project updated successfully', 'success');
      }
      return updatedProject;
    } catch (error) {
      showToast('Failed to update project', 'error');
      return null;
    }
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    try {
      const success = await dataManager.deleteProject(id);
      if (success) {
        setProjects(prev => prev.filter(p => p.id !== id));
        showToast('Project deleted successfully', 'success');
      }
      return success;
    } catch (error) {
      showToast('Failed to delete project', 'error');
      return false;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  };
};
