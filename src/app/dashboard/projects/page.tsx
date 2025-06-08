"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import DataTable, { TableColumn } from "@/components/ui/DataTable"; // Updated import to get TableColumn from DataTable
import { useProjects } from "@/hooks/useProjects";
import { Project, ProjectFormData } from "@/lib/types"; // Removed TableColumn from here
import { Plus, Edit, Trash2, Calendar, MapPin, DollarSign } from "lucide-react";
import ProjectForm from "@/components/forms/ProjectForm";

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, isLoading, createProject, updateProject, deleteProject } =
    useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const getStatusBadgeVariant = (status: Project["status"]) => {
    switch (status) {
      case "New":
        return "info";
      case "Under Construction":
        return "warning";
      case "Completed":
        return "success";
      case "On Hold":
        return "destructive";
      case "Opportunity Lost":
        return "secondary";
      default:
        return "default";
    }
  };

  const columns: TableColumn<Project>[] = [
    {
      id: "name",
      header: "Project Details",
      accessor: "name",
      sortable: true,
      filterable: true,
      render: (value, row) => (
        <div className="cursor-pointer">
          <div className="font-medium text-gray-900 hover:text-blue-600">
            {value}
          </div>
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
      id: "dateCreated",
      header: "Date",
      accessor: "dateCreated",
      sortable: true,
      render: (value) => (
        <div className="text-sm text-gray-900">
          {new Date(value).toLocaleDateString("en-GB")}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessor: "status",
      sortable: true,
      filterable: true,
      render: (value) => (
        <Badge variant={getStatusBadgeVariant(value)}>{value}</Badge>
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
    if (userConfirmation === "DELETE") {
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
          handleEditProject(project);
        }}
        title="Edit Project"
        className="hover:bg-green-50 h-8 w-8"
      >
        <Edit className="h-4 w-4" />
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
      {/* Projects Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col h-full">
        <div className="p-6 flex-1 flex flex-col min-h-0">
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
            enableColumnFilters={true}
            enableColumnVisibility={true}
          />
        </div>
      </div>

      {/* Add/Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          editingProject
            ? `Edit Project - ${editingProject.name}`
            : "Add New Project"
        }
        size="2xl"
        custom_class="h-[90vh] "
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
