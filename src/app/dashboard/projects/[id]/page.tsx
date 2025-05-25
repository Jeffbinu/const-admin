"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import DataTable from "@/components/ui/DataTable";
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
} from "@/lib/types";
import {
  ArrowLeft,
  Edit,
  MoreHorizontal,
  Download,
  Plus,
  FileText,
  Calendar,
  MapPin,
  User,
  Building,
  Clock,
  DollarSign,
  Eye,
  Trash2,
  History,
  Save,
  X,
} from "lucide-react";
import ProjectEditModal from "@/components/ui/ProjectEditModal";

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
  const [isProjectEditModalOpen, setIsProjectEditModalOpen] = useState(false);

  const projectId = params.id as string;

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        const projectData = await dataManager.getProject(projectId);
        setProject(projectData);

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
      case "Opportunity":
        return "secondary";
      default:
        return "default";
    }
  };

  const handleProjectUpdate = async (updates: Partial<Project>) => {
    try {
      const updatedProject = await dataManager.updateProject(
        project!.id,
        updates
      );
      if (updatedProject) {
        setProject(updatedProject);
        showToast("Project updated successfully", "success");
        setIsProjectEditModalOpen(false);
      }
    } catch (error) {
      showToast("Failed to update project", "error");
    }
  };

  const createEstimationFromTemplate = async (template: EstimationTemplate) => {
    if (!project) return;

    try {
      showToast("Creating estimation from template...", "info");

      const newEstimation =
        await dataManager.createProjectEstimationFromTemplate(
          project.id,
          template.id,
          `${template.name} - Version ${projectEstimations.length + 1}`
        );

      setProjectEstimations((prev) => [...prev, newEstimation]);
      setCurrentEstimation(newEstimation);
      showToast("Estimation created successfully", "success");
      setIsEstimationModalOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      showToast("Failed to create estimation", "error");
    }
  };

  const updateEstimationItem = async (
    itemId: string,
    updates: Partial<ProjectEstimationItem>
  ) => {
    if (!currentEstimation) return;

    try {
      const updatedEstimation = await dataManager.updateProjectEstimationItem(
        currentEstimation.id,
        itemId,
        updates
      );

      setCurrentEstimation(updatedEstimation);
      setProjectEstimations((prev) =>
        prev.map((est) =>
          est.id === updatedEstimation.id ? updatedEstimation : est
        )
      );
      showToast("Estimation item updated successfully", "success");
    } catch (error) {
      showToast("Failed to update estimation item", "error");
    }
  };

  const deleteEstimationItem = async (itemId: string) => {
    if (!currentEstimation) return;

    try {
      const updatedEstimation = await dataManager.deleteProjectEstimationItem(
        currentEstimation.id,
        itemId
      );

      setCurrentEstimation(updatedEstimation);
      setProjectEstimations((prev) =>
        prev.map((est) =>
          est.id === updatedEstimation.id ? updatedEstimation : est
        )
      );
      showToast("Estimation item deleted successfully", "success");
    } catch (error) {
      showToast("Failed to delete estimation item", "error");
    }
  };

  const setActiveEstimation = async (estimationId: string) => {
    try {
      await dataManager.setActiveProjectEstimation(projectId, estimationId);

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
    }
  };

  const generateAgreement = async () => {
    if (!project) return;

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
      }
    } catch (error) {
      console.error("Failed to generate agreement:", error);
      showToast("Failed to generate agreement", "error");
    }
  };

  // Overview Tab Content
  const OverviewTab = () => (
    <div className="p-6 space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Floors</p>
              <p className="text-2xl font-bold text-blue-900">
                {project?.numberOfFloors}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Duration</p>
              <p className="text-2xl font-bold text-green-900">
                {project?.projectDuration}m
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">
                Current Estimate
              </p>
              <p className="text-xl font-bold text-purple-900">
                ₹
                {currentEstimation?.totalAmount?.toLocaleString("en-IN") ||
                  "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-600">Started</p>
              <p className="text-sm font-bold text-yellow-900">
                {project?.dateCreated &&
                  new Date(project.dateCreated).toLocaleDateString("en-GB")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Client Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-6">
            <User className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Client Information
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Client Name
              </label>
              <p className="text-gray-900 font-medium">{project?.clientName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                <MapPin className="h-4 w-4 inline mr-1" />
                Address
              </label>
              <p className="text-gray-900">{project?.clientAddress}</p>
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-6">
            <FileText className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Project Details
            </h3>
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
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-500">
                Agreement Date
              </label>
              <p className="text-gray-900">
                {project?.agreementDate &&
                  new Date(project.agreementDate).toLocaleDateString("en-GB")}
              </p>
            </div>
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-500">
                Project Type
              </label>
              <Badge variant="secondary">{project?.projectType}</Badge>
            </div>
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-500">
                Status
              </label>
              <Badge variant={getStatusBadgeVariant(project?.status || "New")}>
                {project?.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Project Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Project Timeline
        </h3>
        <div className="space-y-4">
          {project?.timeline.map((event) => (
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
        </div>
      </div>
    </div>
  );

  // Enhanced Estimations Tab Content
  const EstimationsTab = () => {
    const estimationItemColumns: TableColumn<ProjectEstimationItem>[] = [
      {
        id: "itemName",
        header: "Item Details",
        accessor: (item) => {
          const lineItem = lineItems.find((li) => li.id === item.lineItemId);
          return lineItem?.name || "Unknown Item";
        },
        sortable: true,
        filterable: true,
        render: (value, row) => {
          const lineItem = lineItems.find((li) => li.id === row.lineItemId);
          return (
            <div>
              <div className="font-medium text-gray-900">{value}</div>
              <div className="text-sm text-gray-500">{lineItem?.category}</div>
              <div className="text-xs text-gray-400">{lineItem?.unit}</div>
            </div>
          );
        },
      },
      {
        id: "quantity",
        header: "Quantity",
        accessor: "quantity",
        sortable: true,
        render: (value, row) => (
          <div className="text-center">
            <span className="font-medium">{value}</span>
          </div>
        ),
      },
      {
        id: "rate",
        header: "Rate (₹)",
        accessor: "rate",
        sortable: true,
        render: (value) => (
          <div className="text-right font-medium">
            ₹{value.toLocaleString("en-IN")}
          </div>
        ),
      },
      {
        id: "amount",
        header: "Amount (₹)",
        accessor: "amount",
        sortable: true,
        render: (value) => (
          <div className="text-right font-semibold text-green-600">
            ₹{value.toLocaleString("en-IN")}
          </div>
        ),
      },
      {
        id: "notes",
        header: "Notes",
        accessor: "notes",
        render: (value) => (
          <div className="text-sm text-gray-600 max-w-xs truncate">
            {value || "-"}
          </div>
        ),
      },
    ];

    const renderEstimationItemActions = (item: ProjectEstimationItem) => (
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setEditingEstimation(item)}
          title="Edit Item"
          className="hover:bg-blue-50 h-8 w-8"
        >
          <Edit className="h-4 w-4 text-blue-600" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteEstimationItem(item.id)}
          title="Delete Item"
          className="hover:bg-red-50 h-8 w-8"
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    );

    return (
      <div className="p-6 space-y-6">
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
              {currentEstimation && (
                <Button size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Current
                </Button>
              )}
            </div>
          </div>

          {/* Estimation Versions */}
          {projectEstimations.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                Estimation Versions
              </h4>
              <div className="space-y-3">
                {projectEstimations.map((estimation) => (
                  <div
                    key={estimation.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      estimation.isActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-3">
                        <h5 className="font-medium text-gray-900">
                          {estimation.name}
                        </h5>
                        {estimation.isActive && (
                          <Badge variant="info">Active</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Created:{" "}
                        {new Date(estimation.createdDate).toLocaleDateString(
                          "en-GB"
                        )}{" "}
                        • Updated:{" "}
                        {new Date(estimation.updatedDate).toLocaleDateString(
                          "en-GB"
                        )}{" "}
                        •{estimation.items.length} items
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-semibold text-green-600">
                        ₹{estimation.totalAmount.toLocaleString("en-IN")}
                      </span>
                      <div className="flex items-center space-x-2">
                        {!estimation.isActive && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveEstimation(estimation.id)}
                          >
                            Set Active
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCurrentEstimation(estimation);
                            setShowEstimationDetails(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Estimation Details */}
          {currentEstimation && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-semibold text-gray-900">
                  Current Estimation: {currentEstimation.name}
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setShowEstimationDetails(!showEstimationDetails)
                  }
                >
                  {showEstimationDetails ? "Hide Details" : "Show Details"}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center mb-4">
                <div>
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {currentEstimation.items.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Materials Cost</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹
                    {(currentEstimation.totalAmount * 0.7).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Labor Cost</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ₹
                    {(currentEstimation.totalAmount * 0.3).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ₹{currentEstimation.totalAmount.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {showEstimationDetails && (
                <div className="mt-6">
                  <DataTable
                    data={currentEstimation.items}
                    columns={estimationItemColumns}
                    actions={renderEstimationItemActions}
                    emptyMessage="No items in this estimation"
                    searchable
                    sortable
                    pagination
                    pageSize={10}
                  />
                </div>
              )}
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
    <div className="p-6 space-y-6">
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
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600" />
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
      badge: currentEstimation?.items.length || 0,
    },
    {
      id: "agreements",
      label: "Agreements",
      content: <AgreementsTab />,
    },
  ];

  return (
    <>
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
              variant="outline"
              onClick={() => setIsProjectEditModalOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
            <Button variant="outline">
              <MoreHorizontal className="h-4 w-4" />
              More Actions
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Project Status Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <Badge
                  variant={getStatusBadgeVariant(project.status)}
                  className="text-sm px-3 py-1"
                >
                  {project.status}
                </Badge>
                <span className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleDateString("en-GB")}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {project.clientName}
                </div>
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  {project.projectType}
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

      {/* Template Selection Modal */}
      <Modal
        isOpen={isEstimationModalOpen}
        onClose={() => setIsEstimationModalOpen(false)}
        title="Create Estimation from Template"
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-gray-600">
            Select an estimation template to create a new versioned estimation
            for this project.
          </p>

          <div className="space-y-3">
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
                    <Badge variant="secondary">{template.category}</Badge>
                    <input
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

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
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
        </div>
      </Modal>

      {/* Edit Estimation Item Modal */}
      {editingEstimation && (
        <Modal
          isOpen={!!editingEstimation}
          onClose={() => setEditingEstimation(null)}
          title="Edit Estimation Item"
          size="md"
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

      {/* Enhanced Project Edit Modal */}
      {project && (
        <ProjectEditModal
          isOpen={isProjectEditModalOpen}
          onClose={() => setIsProjectEditModalOpen(false)}
          project={project}
          onSave={handleProjectUpdate}
          isLoading={false}
        />
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity
          </label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                quantity: parseFloat(e.target.value) || 0,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rate (₹)
          </label>
          <input
            type="number"
            value={formData.rate}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                rate: parseFloat(e.target.value) || 0,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
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
