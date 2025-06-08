"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { dataManager } from "@/lib/data";
import { useToast } from "@/hooks/useToast";
import { useEstimationTemplates } from "@/hooks/useEstimationTemplates";
import { useLineItems } from "@/hooks/useLineItems";
import {
  Project,
  TabItem,
  TableColumn,
  EstimationTemplate,
  LineItem,
  ProjectEstimation,
  ProjectEstimationItem,
  TimelineEvent,
} from "@/lib/types";
import {
  ArrowLeft,
  Edit,
  MoreHorizontal,
  Download,
  Plus,
  FileText,
  MapPin,
  User,
  Building,
  Eye,
  Trash2,
  Save,
  X,
  Check,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import TemplateViewModal from "@/components/templates/TemplateViewModal";

const ActionLoadingOverlay: React.FC<{
  isVisible: boolean;
  message: string;
}> = ({ isVisible, message }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex items-center space-x-3 min-w-[200px]">
        <LoadingSpinner size="md" />
        <span className="text-gray-700 font-medium">{message}</span>
      </div>
    </div>
  );
};

// Confirmation Modal Component
const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  isLoading?: boolean;
}> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  isLoading = false,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    size="sm"
    footer={
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={onConfirm} disabled={isLoading}>
          {isLoading && <LoadingSpinner size="sm" />}
          {confirmText}
        </Button>
      </div>
    }
  >
    <div className="flex items-start space-x-3">
      <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
      <p className="text-gray-700">{message}</p>
    </div>
  </Modal>
);

// Inline Edit Form Component
const InlineEditForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSave: () => Promise<void>;
  isSaving?: boolean;
}> = ({ isOpen, onClose, title, children, onSave, isSaving = false }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    size="md"
    footer={
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>
    }
  >
    {children}
  </Modal>
);

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { templates } = useEstimationTemplates();
  const { lineItems } = useLineItems();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEstimationModalOpen, setIsEstimationModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<EstimationTemplate | null>(null);
  const [projectEstimations, setProjectEstimations] = useState<
    ProjectEstimation[]
  >([]);
  const [currentEstimation, setCurrentEstimation] =
    useState<ProjectEstimation | null>(null);
  const [showEstimationDetails, setShowEstimationDetails] = useState(false);
  const [editingEstimation, setEditingEstimation] =
    useState<ProjectEstimationItem | null>(null);

  // Inline editing states
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isSavingInline, setIsSavingInline] = useState(false);
  const [showStatusConfirmation, setShowStatusConfirmation] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    oldStatus: Project["status"];
    newStatus: Project["status"];
  } | null>(null);

  const [deletingEstimation, setDeletingEstimation] =
    useState<ProjectEstimation | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [viewingEstimation, setViewingEstimation] =
    useState<ProjectEstimation | null>(null);

  // Action loading states
  const [actionLoading, setActionLoading] = useState({
    isVisible: false,
    message: "",
  });

  // Form data states
  const [clientFormData, setClientFormData] = useState({
    clientName: "",
    clientAddress: "",
    phoneNumber: "",
  });

  const [projectFormData, setProjectFormData] = useState({
    name: "",
    projectType: "",
    numberOfFloors: "",
    projectDuration: 1,
    estimatedBudget: 0,
    projectAddress: "",
    agreementDate: "",
  });

  const [statusFormData, setStatusFormData] =
    useState<Project["status"]>("New");

  const projectId = params.id as string;

  // Project type options
  const projectTypeOptions = [
    { value: "Residential", label: "Residential" },
    { value: "Commercial", label: "Commercial" },
    { value: "Industrial", label: "Industrial" },
    { value: "Institutional", label: "Institutional" },
    { value: "Interior Fit-out", label: "Interior Fit-out" },
    { value: "Other", label: "Other" },
  ];

  // Status options
  const statusOptions = [
    { value: "New", label: "New" },
    { value: "Under Construction", label: "Under Construction" },
    { value: "Opportunity Lost", label: "Opportunity Lost" },
    { value: "On Hold", label: "On Hold" },
    { value: "Completed", label: "Completed" },
  ];

  // Helper function to show action loading
  const showActionLoading = (message: string) => {
    setActionLoading({ isVisible: true, message });
  };

  const hideActionLoading = () => {
    setActionLoading({ isVisible: false, message: "" });
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        const projectData: any = await dataManager.getProject(projectId);
        setProject(projectData);

        setClientFormData({
          clientName: projectData.clientName,
          clientAddress: projectData.clientAddress,
          phoneNumber: projectData.phoneNumber || "",
        });

        setProjectFormData({
          name: projectData.name,
          projectType: projectData.projectType,
          numberOfFloors: projectData.numberOfFloors.toString(),
          projectDuration: projectData.projectDuration,
          estimatedBudget: projectData.estimatedBudget,
          projectAddress: projectData.projectAddress || "",
          agreementDate: projectData.agreementDate,
        });

        setStatusFormData(projectData.status);

        // Fetch project estimations
        const estimations = await dataManager.getProjectEstimations(projectId);
        setProjectEstimations(estimations);

        // Set current active estimation
        const activeEstimation =
          estimations.find((est) => est.isActive) || estimations[0];
        setCurrentEstimation(activeEstimation || null);
      } catch (error) {
        console.error("Failed to fetch project:", error);
        showToast("Failed to load project details", "error");
        router.push("/dashboard/projects");
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId, showToast, router]);

  const deleteEstimation = async (estimationId: string) => {
    if (!estimationId || projectEstimations.length <= 1) {
      showToast("Cannot delete the last estimation", "error");
      return;
    }

    const estimationToDelete = projectEstimations.find(
      (est) => est.id === estimationId
    );
    if (!estimationToDelete) return;

    showActionLoading("Deleting estimation...");

    try {
      await dataManager.deleteProjectEstimation(estimationId);

      // Update local state
      const updatedEstimations = projectEstimations.filter(
        (est) => est.id !== estimationId
      );
      setProjectEstimations(updatedEstimations);

      // If we deleted the current estimation, set a new current one
      if (currentEstimation?.id === estimationId) {
        const newCurrent =
          updatedEstimations.find((est) => est.isActive) ||
          updatedEstimations[0];
        setCurrentEstimation(newCurrent || null);
      }

      showToast("Estimation deleted successfully", "success");

      // Add timeline event
      await addTimelineEvent({
        title: `Estimation Deleted: ${estimationToDelete.name}`,
        description: `Estimation with ${estimationToDelete.items.length} items has been removed`,
        date: new Date().toISOString(),
        status: "completed",
      });
    } catch (error) {
      showToast("Failed to delete estimation", "error");
    } finally {
      hideActionLoading();
      setShowDeleteConfirmation(false);
      setDeletingEstimation(null);
    }
  };

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

  // Add timeline event helper
  const addTimelineEvent = async (event: Omit<TimelineEvent, "id">) => {
    if (!project) return;

    try {
      const newEvent: TimelineEvent = {
        ...event,
        id: `timeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      const updatedTimeline = [...project.timeline, newEvent].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Update local state immediately
      const updatedProject = { ...project, timeline: updatedTimeline };
      setProject(updatedProject);

      // Save to backend
      await dataManager.updateProject(project.id, {
        timeline: updatedTimeline,
      });
    } catch (error) {
      console.error("Failed to add timeline event:", error);
    }
  };

  const handleSaveClientInfo = async () => {
    if (!project) return;

    setIsSavingInline(true);
    showActionLoading("Updating client information...");

    try {
      const updatedProject = await dataManager.updateProject(
        project.id,
        clientFormData
      );

      if (updatedProject) {
        // Update local state immediately
        setProject((prev) => (prev ? { ...prev, ...clientFormData } : null));
        setIsEditingClient(false);

        await addTimelineEvent({
          title: "Client Information Updated",
          description: "Client details have been modified",
          date: new Date().toISOString(),
          status: "completed",
        });
      }
    } catch (error) {
      showToast("Failed to update client information", "error");
    } finally {
      setIsSavingInline(false);
      hideActionLoading();
    }
  };

  // Handle project details save
  const handleSaveProjectDetails = async () => {
    if (!project) return;

    // Convert numberOfFloors string back to number for API
    const dataToSave = {
      ...projectFormData,
      numberOfFloors: parseInt(projectFormData.numberOfFloors) || 1,
    };

    setIsSavingInline(true);
    showActionLoading("Updating project details...");

    try {
      const updatedProject = await dataManager.updateProject(
        project.id,
        dataToSave
      );

      if (updatedProject) {
        // Update local state immediately
        setProject((prev) => (prev ? { ...prev, ...dataToSave } : null));
        setIsEditingProject(false);
        showToast("Project details updated successfully", "success");

        // Add timeline event
        await addTimelineEvent({
          title: "Project Details Updated",
          description: "Project information has been modified",
          date: new Date().toISOString(),
          status: "completed",
        });
      }
    } catch (error) {
      showToast("Failed to update project details", "error");
    } finally {
      setIsSavingInline(false);
      hideActionLoading();
    }
  };

  // Handle status change with confirmation
  const handleStatusChange = (newStatus: Project["status"]) => {
    if (!project || newStatus === project.status) return;

    // Update dropdown immediately for better UX
    setStatusFormData(newStatus);

    // Show confirmation for the actual save
    setPendingStatusChange({
      oldStatus: project.status,
      newStatus: newStatus,
    });
    setShowStatusConfirmation(true);
  };

  const confirmStatusChange = async () => {
    if (!project || !pendingStatusChange) return;

    setIsSavingInline(true);
    showActionLoading("Updating project status...");

    try {
      const updatedProject = await dataManager.updateProject(project.id, {
        status: pendingStatusChange.newStatus,
      });

      if (updatedProject) {
        // Update local state immediately
        setProject((prev) =>
          prev ? { ...prev, status: pendingStatusChange.newStatus } : null
        );
        showToast(
          `Project status changed to ${pendingStatusChange.newStatus}`,
          "success"
        );

        // Add timeline event for status change
        await addTimelineEvent({
          title: `Status Changed: ${pendingStatusChange.oldStatus} → ${pendingStatusChange.newStatus}`,
          description: `Project status updated from ${pendingStatusChange.oldStatus} to ${pendingStatusChange.newStatus}`,
          date: new Date().toISOString(),
          status: "completed",
        });
      }
    } catch (error) {
      showToast("Failed to update project status", "error");
      // Revert dropdown to original status on error
      setStatusFormData(project.status);
      // Revert local project state too
      setProject((prev) => (prev ? { ...prev, status: project.status } : null));
    } finally {
      setIsSavingInline(false);
      hideActionLoading();
      setShowStatusConfirmation(false);
      setPendingStatusChange(null);
    }
  };

  const createEstimationFromTemplate = async (template: EstimationTemplate) => {
    if (!project) return;

    showActionLoading("Creating estimation from template...");

    try {
      showToast("Creating estimation from template...", "info");

      const newEstimation =
        await dataManager.createProjectEstimationFromTemplate(
          project.id,
          template.id,
          `${template.name} - Version ${projectEstimations.length + 1}`
        );

      // Update local state immediately
      setProjectEstimations((prev) => [...prev, newEstimation]);
      setCurrentEstimation(newEstimation);
      showToast("Estimation created successfully", "success");
      setIsEstimationModalOpen(false);
      setSelectedTemplate(null);

      // Add timeline event
      await addTimelineEvent({
        title: `New Estimation Created: ${newEstimation.name}`,
        description: `Estimation based on ${template.name} template with ${newEstimation.items.length} items`,
        date: new Date().toISOString(),
        status: "completed",
      });
    } catch (error) {
      showToast("Failed to create estimation", "error");
    } finally {
      hideActionLoading();
    }
  };

  const updateEstimationItem = async (
    itemId: string,
    updates: Partial<ProjectEstimationItem>
  ) => {
    if (!currentEstimation) return;

    showActionLoading("Updating estimation item...");

    try {
      const updatedEstimation = await dataManager.updateProjectEstimationItem(
        currentEstimation.id,
        itemId,
        updates
      );

      // Update local state immediately
      setCurrentEstimation(updatedEstimation);
      setProjectEstimations((prev) =>
        prev.map((est) =>
          est.id === updatedEstimation.id ? updatedEstimation : est
        )
      );
      showToast("Estimation item updated successfully", "success");
    } catch (error) {
      showToast("Failed to update estimation item", "error");
    } finally {
      hideActionLoading();
    }
  };

  const deleteEstimationItem = async (itemId: string) => {
    if (!currentEstimation) return;

    showActionLoading("Deleting estimation item...");

    try {
      const updatedEstimation = await dataManager.deleteProjectEstimationItem(
        currentEstimation.id,
        itemId
      );

      // Update local state immediately
      setCurrentEstimation(updatedEstimation);
      setProjectEstimations((prev) =>
        prev.map((est) =>
          est.id === updatedEstimation.id ? updatedEstimation : est
        )
      );
      showToast("Estimation item deleted successfully", "success");
    } catch (error) {
      showToast("Failed to delete estimation item", "error");
    } finally {
      hideActionLoading();
    }
  };

  const setActiveEstimation = async (estimationId: string) => {
    showActionLoading("Setting active estimation...");

    try {
      await dataManager.setActiveProjectEstimation(projectId, estimationId);

      // Update local state immediately
      setProjectEstimations((prev) =>
        prev.map((est) => ({ ...est, isActive: est.id === estimationId }))
      );

      const newActive = projectEstimations.find(
        (est) => est.id === estimationId
      );
      setCurrentEstimation(newActive || null);
      showToast("Active estimation updated", "success");
    } catch (error) {
      showToast("Failed to update active estimation", "error");
    } finally {
      hideActionLoading();
    }
  };

  const generateAgreement = async () => {
    if (!project) return;

    showActionLoading("Generating agreement document...");

    try {
      showToast("Generating agreement...", "info");
      const agreementContent = await dataManager.generateProjectAgreement(
        project.id,
        "AG001"
      );

      // Create and open agreement in new window
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Agreement - ${project.name}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
                h2 { color: #1e40af; margin-top: 30px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background-color: #f8fafc; font-weight: bold; }
                .signatures { display: flex; justify-content: space-between; margin-top: 60px; }
                .signatures > div { width: 45%; text-align: center; padding: 20px 0; border-top: 1px solid #333; }
              </style>
            </head>
            <body>
              ${agreementContent}
              <div style="margin-top: 30px; text-align: center;">
                <button onclick="window.print()" style="background: #2563eb; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">Print</button>
                <button onclick="window.close()" style="background: #6b7280; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Close</button>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        showToast("Agreement generated successfully", "success");

        // Add timeline event
        await addTimelineEvent({
          title: "Agreement Generated",
          description: "Project agreement document has been generated",
          date: new Date().toISOString(),
          status: "completed",
        });
      }
    } catch (error) {
      console.error("Failed to generate agreement:", error);
      showToast("Failed to generate agreement", "error");
    } finally {
      hideActionLoading();
    }
  };

  // Enhanced Overview Tab with inline editing
  const OverviewTab = () => {
    const getMostRecentEstimation = () => {
      if (!projectEstimations.length) return null;
      const activeEstimation = projectEstimations.find((est) => est.isActive);
      if (activeEstimation) return activeEstimation;
      return projectEstimations.reduce((latest, current) =>
        new Date(current.updatedDate) > new Date(latest.updatedDate)
          ? current
          : latest
      );
    };

    const mostRecentEstimation = getMostRecentEstimation();
    const hasEstimations = projectEstimations.length > 0;

    const handleCreateEstimationShortcut = () => {
      setActiveTab("estimations");
      setTimeout(() => {
        setIsEstimationModalOpen(true);
      }, 100);
    };

    return (
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Client Information with inline edit */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Client Information
                </h3>
              </div>
              <button
                onClick={() => setIsEditingClient(true)}
                className="text-blue-600 cursor-pointer hover:text-blue-800 text-sm font-medium flex items-center transition-colors"
                disabled={isSavingInline}
              >
                {isSavingInline ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Edit className="h-3 w-3 mr-1" />
                )}
                Edit
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Client Name
                </label>
                <p className="text-gray-900 font-medium">
                  {clientFormData?.clientName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Address
                </label>
                <p className="text-gray-900">{clientFormData?.clientAddress}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Phone Number
                </label>

                <p className="text-gray-900">
                  {clientFormData?.phoneNumber
                    ? clientFormData.phoneNumber
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Project Details with inline edit */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Project Details
                </h3>
              </div>
              <button
                onClick={() => setIsEditingProject(true)}
                className="text-blue-600 cursor-pointer hover:text-blue-800 text-sm font-medium flex items-center transition-colors"
                disabled={isSavingInline}
              >
                {isSavingInline ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Edit className="h-3 w-3 mr-1" />
                )}
                Edit
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-gray-500">
                  Date Created
                </label>
                <p className="text-gray-900">
                  {project?.dateCreated &&
                    new Date(project.dateCreated).toLocaleDateString("en-GB")}
                </p>
              </div>

              {/* Smart Agreement Date Section */}
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <label className="text-sm font-medium text-gray-500">
                    Agreement Date
                  </label>
                  {hasEstimations && mostRecentEstimation && (
                    <div className="ml-2 group relative">
                      <div className="h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center cursor-help">
                        <span className="text-xs text-blue-600 font-bold">
                          i
                        </span>
                      </div>
                      <div className="absolute left-0 top-6 z-10 invisible group-hover:visible bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg min-w-max">
                        {mostRecentEstimation.name}
                        <br />
                        Last updated:{" "}
                        {new Date(
                          mostRecentEstimation.updatedDate
                        ).toLocaleDateString("en-GB")}
                        <div className="absolute -top-1 left-3 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-gray-900"></div>
                      </div>
                    </div>
                  )}
                </div>

                {hasEstimations && mostRecentEstimation ? (
                  <div className="text-right">
                    <p className="text-gray-900 font-medium">
                      {new Date(
                        mostRecentEstimation.updatedDate
                      ).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                ) : (
                  <div className="text-right">
                    <button
                      onClick={handleCreateEstimationShortcut}
                      className="text-[0.8rem] cursor-pointer text-blue-600 hover:text-blue-800 hover:underline mt-1 transition-colors"
                    >
                      Create an estimate
                    </button>
                    <span className="text-[0.8rem] cursor-pointer mt-1 transition-colors">
                      {" "}
                      to see agreement date
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <label className="text-sm font-medium text-gray-500">
                  Project Type
                </label>
                <Badge variant="secondary">
                  {projectFormData?.projectType}
                </Badge>
              </div>

              {/* Status with inline edit */}
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-500">
                  Status
                </label>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={getStatusBadgeVariant(project?.status || "New")}
                  >
                    {statusFormData}
                  </Badge>
                  <select
                    value={statusFormData}
                    onChange={(e) =>
                      handleStatusChange(e.target.value as Project["status"])
                    }
                    className="text-xs bg-transparent border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[140px]"
                    disabled={isSavingInline}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Timeline - Enhanced with better sorting */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Project Timeline
          </h3>
          <div className="space-y-4">
            {/* Display only actual timeline events, not dynamically generated ones */}
            {(project?.timeline || [])
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .map((event) => (
                <div key={event.id} className="flex items-start space-x-4">
                  <div
                    className={`flex-shrink-0 w-3 h-3 rounded-full mt-1 ${
                      event.status === "completed"
                        ? "bg-green-500"
                        : event.status === "in-progress"
                        ? "bg-blue-500"
                        : "bg-gray-300"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        {event.title}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}

            {/* Show message if no timeline events */}
            {(!project?.timeline || project.timeline.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No timeline events yet</p>
                <p className="text-xs mt-1">
                  Timeline events will appear as you make changes to the project
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const convertEstimationToTemplate = (
    estimation: ProjectEstimation
  ): EstimationTemplate => {
    return {
      id: estimation.id,
      name: estimation.name,
      clientName: clientFormData.clientName,
      category: "Project Estimation",
      itemsCount: estimation.items.length,
      lastModified: estimation.updatedDate,
      items: estimation.items.map((item) => ({
        id: item.id,
        lineItemId: item.lineItemId,
        quantity: item.quantity,
      })),
    };
  };

  const EstimationsTab = () => {
    return (
      <div className="p-6 space-y-4">
        {/* Estimation Version Control */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Project Estimations
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Manage versioned cost estimations for this project
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEstimationModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create from Template
              </Button>
            </div>
          </div>

          {/* Estimation Versions */}
          {projectEstimations.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                Estimation Versions ({projectEstimations.length})
              </h4>
              <div className="space-y-3">
                {projectEstimations.map((estimation) => (
                  <div
                    key={estimation.id}
                    className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                      estimation.isActive
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : "border-gray-200 bg-gray-50 opacity-75 hover:opacity-100"
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-3">
                        <h5
                          className={`font-medium ${
                            estimation.isActive
                              ? "text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {estimation.name}
                        </h5>
                        {estimation.isActive && (
                          <Badge variant="info">Active</Badge>
                        )}
                      </div>
                      <p
                        className={`text-sm ${
                          estimation.isActive
                            ? "text-gray-600"
                            : "text-gray-500"
                        }`}
                      >
                        Created:{" "}
                        {new Date(estimation.createdDate).toLocaleDateString(
                          "en-GB"
                        )}{" "}
                        • Updated:{" "}
                        {new Date(estimation.updatedDate).toLocaleDateString(
                          "en-GB"
                        )}{" "}
                        • {estimation.items.length} items
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`text-lg font-semibold ${
                          estimation.isActive
                            ? "text-green-600"
                            : "text-green-500"
                        }`}
                      >
                        ₹{estimation.totalAmount.toLocaleString("en-IN")}
                      </span>
                      <div className="flex items-center space-x-2">
                        {!estimation.isActive && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveEstimation(estimation.id)}
                            className="text-xs"
                          >
                            Set Active
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingEstimation(estimation)}
                          className="text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>

                        {/* Delete Button - Only show if more than 1 estimation exists */}
                        {projectEstimations.length > 1 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setDeletingEstimation(estimation);
                              setShowDeleteConfirmation(true);
                            }}
                            className="text-xs text-red-600 hover:bg-red-50 border-red-200"
                            title="Delete Estimation"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {projectEstimations.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Estimations Yet
              </h3>
              <p className="text-gray-500 mb-6">
                Create your first estimation using a template
              </p>
              <Button onClick={() => setIsEstimationModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Estimation
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Agreements Tab Content
  const AgreementsTab = () => (
    <div className="p-6 space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Project Agreements
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Generate and manage project contracts
            </p>
          </div>
          <Button size="sm" onClick={generateAgreement}>
            <Download className="h-4 w-4 mr-2" />
            Generate Agreement
          </Button>
        </div>

        <div className="space-y-4">
          {/* Agreement Templates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">
                  Construction Agreement
                </h4>
                <Badge variant="secondary">Standard</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Standard construction contract with terms and conditions
              </p>
              <Button size="sm" variant="outline" onClick={generateAgreement}>
                <Eye className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 opacity-60">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">
                  Renovation Contract
                </h4>
                <Badge variant="secondary">Renovation</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Specialized contract for renovation projects
              </p>
              <Button size="sm" variant="outline" disabled>
                <Eye className="h-4 w-4 mr-2" />
                Coming Soon
              </Button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 opacity-60">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">
                  Interior Agreement
                </h4>
                <Badge variant="secondary">Interior</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Interior design and execution agreement
              </p>
              <Button size="sm" variant="outline" disabled>
                <Eye className="h-4 w-4 mr-2" />
                Coming Soon
              </Button>
            </div>
          </div>

          {/* Agreement History */}
          <div className="mt-8">
            <h4 className="text-md font-medium text-gray-900 mb-4">
              Agreement History
            </h4>
            <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg mb-2">No agreements generated yet</p>
              <p className="text-sm">
                Generate your first agreement using templates above
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <DashboardLayout title="Loading...">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout title="Project Not Found">
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Project Not Found
          </h3>
          <p className="text-gray-500 mb-6">
            The requested project could not be found.
          </p>
          <Button onClick={() => router.push("/dashboard/projects")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const tabs: TabItem[] = [
    {
      id: "overview",
      label: "Overview",
      content: <OverviewTab />,
    },
    {
      id: "estimations",
      label: "Estimations",
      content: <EstimationsTab />,
      badge: projectEstimations.length || 0,
    },
    {
      id: "agreements",
      label: "Agreements",
      content: <AgreementsTab />,
    },
  ];

  const handleCreateEstimationShortcut = () => {
    setActiveTab("estimations");
    setTimeout(() => {
      setIsEstimationModalOpen(true);
    }, 100);
  };

  return (
    <>
      {/* Action Loading Overlay */}
      <ActionLoadingOverlay
        isVisible={actionLoading.isVisible}
        message={actionLoading.message}
      />

      <DashboardLayout
        title={project.name}
        subtitle={`${project.id} • Created ${new Date(
          project.dateCreated
        ).toLocaleDateString("en-GB")}`}
        headerActions={
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/projects")}
              className="hidden sm:flex"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
            <Button
              onClick={handleCreateEstimationShortcut}
              variant="outline"
              className="bg-blue-500 text-white"
            >
              Go to Estimations
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Project Status Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <Badge
                  variant={getStatusBadgeVariant(project.status)}
                  className="text-sm px-3 py-1"
                >
                  {statusFormData}
                </Badge>
                <span className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleDateString("en-GB")}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {clientFormData.clientName}
                </div>
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  {projectFormData.projectType}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Back Button */}
          <div className="sm:hidden">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/projects")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 pt-4">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>
      </DashboardLayout>

      {/* Client Information Inline Edit Modal */}
      <InlineEditForm
        isOpen={isEditingClient}
        onClose={() => setIsEditingClient(false)}
        title="Edit Client Information"
        onSave={handleSaveClientInfo}
        isSaving={isSavingInline}
      >
        <div className="space-y-4">
          <Input
            label="Client Name *"
            value={clientFormData.clientName}
            onChange={(e) =>
              setClientFormData((prev) => ({
                ...prev,
                clientName: e.target.value,
              }))
            }
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Client Address *
            </label>
            <textarea
              value={clientFormData.clientAddress}
              onChange={(e) =>
                setClientFormData((prev) => ({
                  ...prev,
                  clientAddress: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>

          <Input
            label="Phone Number"
            type="tel"
            value={clientFormData.phoneNumber}
            onChange={(e) =>
              setClientFormData((prev) => ({
                ...prev,
                phoneNumber: e.target.value,
              }))
            }
          />
        </div>
      </InlineEditForm>

      {/* Project Details Inline Edit Modal */}
      <InlineEditForm
        isOpen={isEditingProject}
        onClose={() => setIsEditingProject(false)}
        title="Edit Project Details"
        onSave={handleSaveProjectDetails}
        isSaving={isSavingInline}
      >
        <div className="space-y-4">
          <Input
            label="Project Name *"
            value={projectFormData.name}
            onChange={(e) =>
              setProjectFormData((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Project Type *"
              value={projectFormData.projectType}
              onChange={(e) =>
                setProjectFormData((prev) => ({
                  ...prev,
                  projectType: e.target.value,
                }))
              }
              options={projectTypeOptions}
            />
          </div>
        </div>
      </InlineEditForm>

      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setDeletingEstimation(null);
        }}
        onConfirm={() =>
          deletingEstimation && deleteEstimation(deletingEstimation.id)
        }
        title="Delete Estimation"
        message={
          deletingEstimation
            ? `Are you sure you want to delete "${deletingEstimation.name}"? This action cannot be undone and will permanently remove all ${deletingEstimation.items.length} items in this estimation.`
            : ""
        }
        confirmText="Delete Estimation"
        isLoading={isSavingInline}
      />

      {/* Reuse TemplateViewModal for Estimation Details */}
      <TemplateViewModal
        isOpen={!!viewingEstimation}
        onClose={() => setViewingEstimation(null)}
        template={
          viewingEstimation
            ? convertEstimationToTemplate(viewingEstimation)
            : null
        }
        lineItems={lineItems}
      />

      {/* Status Change Confirmation Modal */}
      <ConfirmationModal
        isOpen={showStatusConfirmation}
        onClose={() => {
          setShowStatusConfirmation(false);
          setPendingStatusChange(null);
          // Revert dropdown to original status if cancelled
          if (project) {
            setStatusFormData(project.status);
          }
        }}
        onConfirm={confirmStatusChange}
        title="Confirm Status Change"
        message={
          pendingStatusChange
            ? `Are you sure you want to change the project status from "${pendingStatusChange.oldStatus}" to "${pendingStatusChange.newStatus}"?`
            : ""
        }
        confirmText="Change Status"
        isLoading={isSavingInline}
      />

      {/* Template Selection Modal */}
      <Modal
        isOpen={isEstimationModalOpen}
        onClose={() => setIsEstimationModalOpen(false)}
        title="Create Estimation from Template"
        size="lg"
        showFullscreenToggle={true}
        footer={
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => setIsEstimationModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedTemplate &&
                createEstimationFromTemplate(selectedTemplate)
              }
              disabled={!selectedTemplate}
            >
              Create Estimation
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <p className="text-gray-600">
            Select an estimation template to create a new versioned estimation
            for this project.
          </p>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedTemplate?.id === template.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {template.name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {template.itemsCount} items • {template.category} • Last
                      modified:{" "}
                      {new Date(template.lastModified).toLocaleDateString(
                        "en-GB"
                      )}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="radio"
                      name="template"
                      checked={selectedTemplate?.id === template.id}
                      onChange={() => setSelectedTemplate(template)}
                      className="text-blue-600"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {templates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No estimation templates available.</p>
              <p className="text-sm mt-1">
                Create templates in the Configurations section.
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* Edit Estimation Item Modal */}
      {editingEstimation && (
        <Modal
          isOpen={!!editingEstimation}
          onClose={() => setEditingEstimation(null)}
          title="Edit Estimation Item"
          size="md"
          showFullscreenToggle={true}
        >
          <EstimationItemForm
            item={editingEstimation}
            lineItems={lineItems}
            onSave={(updates) => {
              updateEstimationItem(editingEstimation.id, updates);
              setEditingEstimation(null);
            }}
            onCancel={() => setEditingEstimation(null)}
          />
        </Modal>
      )}
    </>
  );
}

// Estimation Item Form Component
const EstimationItemForm: React.FC<{
  item: ProjectEstimationItem;
  lineItems: LineItem[];
  onSave: (updates: Partial<ProjectEstimationItem>) => void;
  onCancel: () => void;
}> = ({ item, lineItems, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    quantity: item.quantity,
    rate: item.rate,
    notes: item.notes || "",
  });

  const lineItem = lineItems.find((li) => li.id === item.lineItemId);
  const calculatedAmount = formData.quantity * formData.rate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      amount: calculatedAmount,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900">{lineItem?.name}</h4>
        <p className="text-sm text-gray-600">
          {lineItem?.category} • {lineItem?.unit}
        </p>
        <p className="text-xs text-gray-500 mt-1">{lineItem?.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Quantity"
          type="number"
          value={formData.quantity.toString()}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              quantity: parseFloat(e.target.value) || 0,
            }))
          }
          required
          min="0"
          step="0.01"
        />

        <Input
          label="Rate (₹)"
          type="number"
          value={formData.rate.toString()}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              rate: parseFloat(e.target.value) || 0,
            }))
          }
          required
          min="0"
          step="0.01"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Add any notes or specifications..."
        />
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            Calculated Amount:
          </span>
          <span className="text-lg font-bold text-blue-600">
            ₹{calculatedAmount.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </form>
  );
};
