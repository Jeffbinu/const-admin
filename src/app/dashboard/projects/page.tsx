'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';
import { useProjects } from '@/hooks/useProjects';
import { Project, TableColumn, ProjectFormData } from '@/lib/types';
import { Plus, Edit, Trash2, Eye, Calendar, MapPin, DollarSign } from 'lucide-react';
import ProjectForm from '@/components/forms/ProjectForm';

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, isLoading, createProject, updateProject, deleteProject } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const getStatusBadgeVariant = (status: Project['status']) => {
    switch (status) {
      case 'New':
        return 'info';
      case 'Under Construction':
        return 'warning';
      case 'Completed':
        return 'success';
      case 'On Hold':
        return 'destructive';
      case 'Opportunity':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const columns: TableColumn<Project>[] = [
    {
      id: 'name',
      header: 'Project Details',
      accessor: 'name',
      sortable: true,
      filterable: true,
      render: (value, row) => (
        <div className="cursor-pointer">
          <div className="font-medium text-gray-900 hover:text-blue-600">{value}</div>
          <div className="text-sm text-gray-500">{row.id}</div>
          <div className="text-xs text-gray-400 mt-1 flex items-center space-x-2">
            <span className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {row.projectType}
            </span>
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {row.projectDuration}m
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'clientName',
      header: 'Client',
      accessor: 'clientName',
      sortable: true,
      filterable: true,
      render: (value, row) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-500 truncate max-w-xs">
            {row.clientAddress}
          </div>
        </div>
      ),
    },
    {
      id: 'dateCreated',
      header: 'Timeline',
      accessor: 'dateCreated',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className="text-gray-900">
            Created: {new Date(value).toLocaleDateString('en-GB')}
          </div>
          <div className="text-gray-500">
            Agreement: {new Date(row.agreementDate).toLocaleDateString('en-GB')}
          </div>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      sortable: true,
      filterable: true,
      render: (value) => (
        <Badge variant={getStatusBadgeVariant(value)}>
          {value}
        </Badge>
      ),
    },
    {
      id: 'estimatedBudget',
      header: 'Budget',
      accessor: 'estimatedBudget',
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 flex items-center">
            <DollarSign className="h-3 w-3 mr-1" />
            ₹{value.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-gray-500">
            Estimated cost
          </div>
        </div>
      ),
    },
  ];

  const handleRowClick = (project: Project) => {
    router.push(`/dashboard/projects/${project.id}`);
  };

  const handleCreateProject = async (formData: ProjectFormData) => {
    setIsFormLoading(true);
    try {
      if (editingProject) {
        const updatedProject = await updateProject(editingProject.id, formData);
        if (updatedProject) {
          setIsModalOpen(false);
          setEditingProject(null);
        }
      } else {
        const newProject = await createProject(formData);
        if (newProject) {
          setIsModalOpen(false);
        }
      }
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = async (project: Project) => {
    const confirmMessage = `⚠️ Delete Project\n\nProject: "${project.name}"\nClient: ${project.clientName}\n\nThis will permanently delete:\n• All project data\n• Estimation versions\n• Agreement versions\n• Timeline history\n\nType "DELETE" to confirm:`;
    
    const userConfirmation = window.prompt(confirmMessage);
    if (userConfirmation === 'DELETE') {
      await deleteProject(project.id);
    } else if (userConfirmation !== null) {
      alert('Deletion cancelled. Please type "DELETE" exactly to confirm.');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const renderActions = (project: Project) => (
    <div className="flex items-center space-x-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/dashboard/projects/${project.id}`);
        }}
        title="View Project Details"
        className="hover:bg-blue-50 h-8 w-8"
      >
        <Eye className="h-4 w-4 text-blue-600" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          handleEditProject(project);
        }}
        title="Edit Project"
        className="hover:bg-green-50 h-8 w-8"
      >
        <Edit className="h-4 w-4 text-green-600" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteProject(project);
        }}
        title="Delete Project"
        className="hover:bg-red-50 h-8 w-8"
      >
        <Trash2 className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  );

  return (
    <DashboardLayout
      title="Projects"
      subtitle="Manage all your construction projects with complete version control"
      headerActions={
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Project Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">New</p>
                <p className="text-lg font-bold text-blue-900">
                  {projects.filter(p => p.status === 'New').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-600">In Progress</p>
                <p className="text-lg font-bold text-yellow-900">
                  {projects.filter(p => p.status === 'Under Construction').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-lg font-bold text-green-900">
                  {projects.filter(p => p.status === 'Completed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Opportunity</p>
                <p className="text-lg font-bold text-purple-900">
                  {projects.filter(p => p.status === 'Opportunity').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-indigo-600">Total Value</p>
                <p className="text-lg font-bold text-indigo-900">
                  ₹{projects.reduce((sum, p) => sum + p.estimatedBudget, 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <DataTable
              data={projects}
              columns={columns}
              onRowClick={handleRowClick}
              actions={renderActions}
              loading={isLoading}
              emptyMessage="No projects found. Create your first project to get started with construction management."
              searchable
              sortable
              filterable
              pagination
              pageSize={10}
            />
          </div>
        </div>
      </div>

      {/* Add/Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProject ? `Edit Project - ${editingProject.name}` : "Add New Project"}
        size="lg"
      >
        <ProjectForm
          onSubmit={handleCreateProject}
          onCancel={handleCloseModal}
          initialData={editingProject || undefined}
          isLoading={isFormLoading}
        />
      </Modal>
    </DashboardLayout>
  );
}