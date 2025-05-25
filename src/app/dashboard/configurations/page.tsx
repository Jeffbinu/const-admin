// app/dashboard/configurations/page.tsx
'use client';
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import DataTable from '@/components/ui/DataTable';
import { useLineItems } from '@/hooks/useLineItems';
import { useEstimationTemplates } from '@/hooks/useEstimationTemplates';
import { 
  LineItem, 
  EstimationTemplate, 
  Agreement,
  TableColumn, 
  TabItem,
  LineItemFormData,
  EstimationTemplateFormData
} from '@/lib/types';
import { Plus, Edit, Trash2, FileText, Eye } from 'lucide-react';
import LineItemForm from '@/components/forms/LineItemForm';
import EstimationTemplateForm from '@/components/forms/EstimationTemplateForm';
import { useAgreements } from '@/hooks/useAggrements';

export default function ConfigurationsPage() {
  const [activeTab, setActiveTab] = useState('line-items');
  const [isLineItemModalOpen, setIsLineItemModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [editingLineItem, setEditingLineItem] = useState<LineItem | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EstimationTemplate | null>(null);

  const { 
    lineItems, 
    isLoading: lineItemsLoading, 
    createLineItem, 
    updateLineItem,
    deleteLineItem 
  } = useLineItems();
  
  const { 
    templates, 
    isLoading: templatesLoading, 
    createTemplate,
    updateTemplate,
    deleteTemplate
  } = useEstimationTemplates();

  const {
    agreements,
    isLoading: agreementsLoading,
    updateAgreement,
    deleteAgreement
  } = useAgreements();

  // Line Items Tab Configuration
  const lineItemColumns: TableColumn<LineItem>[] = [
    {
      id: 'id',
      header: 'Item ID',
      accessor: 'id',
      render: (value) => (
        <span className="font-mono text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      id: 'name',
      header: 'Item Name',
      accessor: 'name',
      sortable: true,
      filterable: true,
      render: (value, row) => (
        <div>
          <span className="font-medium text-gray-900">{value}</span>
          {row.description && (
            <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
              {row.description}
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      accessor: 'category',
      sortable: true,
      filterable: true,
      render: (value) => {
        const categoryColors = {
          'Building Materials': 'bg-orange-100 text-orange-800',
          'Labor': 'bg-green-100 text-green-800',
          'Equipment': 'bg-purple-100 text-purple-800',
          'Other': 'bg-gray-100 text-gray-800'
        };
        return (
          <Badge 
            variant="secondary" 
            className={categoryColors[value as keyof typeof categoryColors] || categoryColors.Other}
          >
            {value}
          </Badge>
        );
      },
    },
    {
      id: 'unit',
      header: 'Unit',
      accessor: 'unit',
      sortable: true,
      render: (value) => (
        <span className="text-gray-700 bg-gray-50 px-2 py-1 rounded text-sm">
          {value}
        </span>
      ),
    },
    {
      id: 'rate',
      header: 'Rate (₹)',
      accessor: 'rate',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-green-600">
          ₹{value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
  ];

  // Line Item Handlers
  const handleCreateLineItem = async (formData: LineItemFormData) => {
    setIsFormLoading(true);
    try {
      if (editingLineItem) {
        const updatedItem = await updateLineItem(editingLineItem.id, formData);
        if (updatedItem) {
          setIsLineItemModalOpen(false);
          setEditingLineItem(null);
        }
      } else {
        const newItem = await createLineItem(formData);
        if (newItem) {
          setIsLineItemModalOpen(false);
        }
      }
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleEditLineItem = (item: LineItem) => {
    setEditingLineItem(item);
    setIsLineItemModalOpen(true);
  };

  const handleDeleteLineItem = async (item: LineItem) => {
    const confirmMessage = `⚠️ Delete Line Item\n\nAre you sure you want to delete "${item.name}"?\n\n• This will remove the item from all estimation templates\n• This action cannot be undone\n• Projects using this item may be affected\n\nType "DELETE" to confirm this action.`;
    
    const userConfirmation = window.prompt(confirmMessage);
    if (userConfirmation === 'DELETE') {
      await deleteLineItem(item.id);
    } else if (userConfirmation !== null) {
      alert('Deletion cancelled. Please type "DELETE" exactly to confirm.');
    }
  };

  const handleCloseLineItemModal = () => {
    setIsLineItemModalOpen(false);
    setEditingLineItem(null);
  };

  const renderLineItemActions = (item: LineItem) => (
    <div className="flex items-center space-x-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          handleEditLineItem(item);
        }}
        title="Edit Line Item"
        className="hover:bg-blue-50 h-8 w-8"
      >
        <Edit className="h-4 w-4 text-blue-600" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteLineItem(item);
        }}
        title="Delete Line Item"
        className="hover:bg-red-50 h-8 w-8"
      >
        <Trash2 className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  );

  const LineItemsTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Estimation Line Items</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage materials, labor, equipment, and other items used in project cost estimations
          </p>
        </div>
        <Button onClick={() => setIsLineItemModalOpen(true)} className="w-fit">
          <Plus className="h-4 w-4 mr-2" />
          Add Line Item
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText className="h-5 w-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-600">Building Materials</p>
              <p className="text-lg font-bold text-orange-900">
                {lineItems.filter(item => item.category === 'Building Materials').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">Labor</p>
              <p className="text-lg font-bold text-green-900">
                {lineItems.filter(item => item.category === 'Labor').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-600">Equipment</p>
              <p className="text-lg font-bold text-purple-900">
                {lineItems.filter(item => item.category === 'Equipment').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Total Items</p>
              <p className="text-lg font-bold text-blue-900">{lineItems.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <DataTable
            data={lineItems}
            columns={lineItemColumns}
            actions={renderLineItemActions}
            loading={lineItemsLoading}
            emptyMessage="No line items found. Add your first line item to get started with project estimations."
            searchable
            sortable
            filterable
            pagination
            pageSize={10}
          />
        </div>
      </div>
    </div>
  );

  // Estimation Templates Tab Configuration
  const templateColumns: TableColumn<EstimationTemplate>[] = [
    {
      id: 'name',
      header: 'Template Name',
      accessor: 'name',
      sortable: true,
      filterable: true,
      render: (value, row) => (
        <div>
          <span className="font-medium text-gray-900">{value}</span>
          <p className="text-xs text-gray-500 mt-1">
            ID: {row.id}
          </p>
        </div>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      accessor: 'category',
      sortable: true,
      filterable: true,
      render: (value) => {
        const categoryColors = {
          'Residential': 'bg-blue-100 text-blue-800',
          'Commercial': 'bg-green-100 text-green-800',
          'Renovation': 'bg-orange-100 text-orange-800'
        };
        return (
          <Badge 
            variant="secondary"
            className={categoryColors[value as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'}
          >
            {value}
          </Badge>
        );
      },
    },
    {
      id: 'itemsCount',
      header: 'Line Items',
      accessor: 'itemsCount',
      sortable: true,
      render: (value) => (
        <div className="text-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {value} items
          </span>
        </div>
      ),
    },
    {
      id: 'lastModified',
      header: 'Last Modified',
      accessor: 'lastModified',
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          <span className="text-gray-700">
            {new Date(value).toLocaleDateString('en-GB')}
          </span>
          <p className="text-xs text-gray-500">
            {new Date(value).toLocaleDateString('en-GB', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
        </div>
      ),
    },
  ];

  // Template Handlers
  const handleCreateTemplate = async (formData: EstimationTemplateFormData) => {
    setIsFormLoading(true);
    try {
      if (editingTemplate) {
        const updatedTemplate = await updateTemplate(editingTemplate.id, formData);
        if (updatedTemplate) {
          setIsTemplateModalOpen(false);
          setEditingTemplate(null);
        }
      } else {
        const newTemplate = await createTemplate(formData);
        if (newTemplate) {
          setIsTemplateModalOpen(false);
        }
      }
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleEditTemplate = (template: EstimationTemplate) => {
    setEditingTemplate(template);
    setIsTemplateModalOpen(true);
  };

  const handleDeleteTemplate = async (template: EstimationTemplate) => {
    const confirmMessage = `⚠️ Delete Estimation Template\n\nTemplate: "${template.name}"\nCategory: ${template.category}\nItems: ${template.itemsCount}\n\nThis will:\n• Remove the template permanently\n• Affect projects using this template\n• Cannot be undone\n\nType "DELETE" to confirm:`;
    
    const userConfirmation = window.prompt(confirmMessage);
    if (userConfirmation === 'DELETE') {
      await deleteTemplate(template.id);
    } else if (userConfirmation !== null) {
      alert('Deletion cancelled. Please type "DELETE" exactly to confirm.');
    }
  };

  const handleViewTemplate = (template: EstimationTemplate) => {
    const itemsList = template.items.map((item, index) => {
      const lineItem = lineItems.find(li => li.id === item.lineItemId);
      return `${index + 1}. ${lineItem?.name || 'Unknown Item'} - Qty: ${item.quantity} ${lineItem?.unit || ''} ${item.notes ? `(${item.notes})` : ''}`;
    }).join('\n');

    alert(`Template Details: ${template.name}\n\nCategory: ${template.category}\nTotal Items: ${template.itemsCount}\nLast Modified: ${new Date(template.lastModified).toLocaleDateString('en-GB')}\n\nItems:\n${itemsList}`);
  };

  const handleCloseTemplateModal = () => {
    setIsTemplateModalOpen(false);
    setEditingTemplate(null);
  };

  const renderTemplateActions = (template: EstimationTemplate) => (
    <div className="flex items-center space-x-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          handleViewTemplate(template);
        }}
        title="View Template Details"
        className="hover:bg-gray-50 h-8 w-8"
      >
        <Eye className="h-4 w-4 text-gray-600" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          handleEditTemplate(template);
        }}
        title="Edit Template"
        className="hover:bg-blue-50 h-8 w-8"
      >
        <Edit className="h-4 w-4 text-blue-600" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteTemplate(template);
        }}
        title="Delete Template"
        className="hover:bg-red-50 h-8 w-8"
      >
        <Trash2 className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  );

  const EstimationTemplatesTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Estimation Templates</h3>
          <p className="text-sm text-gray-600 mt-1">
            Create reusable templates combining multiple line items for different types of construction projects
          </p>
        </div>
        <Button onClick={() => setIsTemplateModalOpen(true)} className="w-fit">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Residential</p>
              <p className="text-lg font-bold text-blue-900">
                {templates.filter(t => t.category === 'Residential').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">Commercial</p>
              <p className="text-lg font-bold text-green-900">
                {templates.filter(t => t.category === 'Commercial').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText className="h-5 w-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-600">Renovation</p>
              <p className="text-lg font-bold text-orange-900">
                {templates.filter(t => t.category === 'Renovation').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <DataTable
            data={templates}
            columns={templateColumns}
            actions={renderTemplateActions}
            loading={templatesLoading}
            emptyMessage="No estimation templates found. Create your first template to streamline project cost estimation."
            searchable
            sortable
            filterable
            pagination
            pageSize={10}
          />
        </div>
      </div>
    </div>
  );

  // Agreements Tab Configuration
  const agreementColumns: TableColumn<Agreement>[] = [
    {
      id: 'name',
      header: 'Agreement Name',
      accessor: 'name',
      sortable: true,
      filterable: true,
      render: (value, row) => (
        <div>
          <span className="font-medium text-gray-900">{value}</span>
          <p className="text-xs text-gray-500 mt-1">
            ID: {row.id}
          </p>
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Agreement Type',
      accessor: 'type',
      sortable: true,
      filterable: true,
      render: (value) => {
        const typeColors = {
          'Construction': 'bg-blue-100 text-blue-800',
          'Renovation': 'bg-orange-100 text-orange-800',
          'Interior': 'bg-purple-100 text-purple-800'
        };
        return (
          <Badge 
            variant="secondary"
            className={typeColors[value as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'}
          >
            {value}
          </Badge>
        );
      },
    },
    {
      id: 'lastModified',
      header: 'Last Modified',
      accessor: 'lastModified',
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          <span className="text-gray-700">
            {new Date(value).toLocaleDateString('en-GB')}
          </span>
          <p className="text-xs text-gray-500">
            {new Date(value).toLocaleDateString('en-GB', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
        </div>
      ),
    },
  ];

  // Agreement Handlers
  const handleEditAgreement = (agreement: Agreement) => {
    alert(`📝 Agreement Editor\n\nEditing: "${agreement.name}"\nType: ${agreement.type}\n\nThe rich text agreement editor will be implemented in the next phase.\n\nThis will include:\n• Rich text editing with formatting\n• Dynamic variable insertion\n• Template preview and testing\n• Version control and history\n• PDF generation preview`);
  };

  const handleDeleteAgreement = async (agreement: Agreement) => {
    const confirmMessage = `⚠️ Delete Agreement Template\n\nTemplate: "${agreement.name}"\nType: ${agreement.type}\n\nThis will:\n• Remove the agreement template permanently\n• Affect projects using this template\n• Cannot be undone\n\nType "DELETE" to confirm:`;
    
    const userConfirmation = window.prompt(confirmMessage);
    if (userConfirmation === 'DELETE') {
      await deleteAgreement(agreement.id);
    } else if (userConfirmation !== null) {
      alert('Deletion cancelled. Please type "DELETE" exactly to confirm.');
    }
  };

  const handleViewAgreement = (agreement: Agreement) => {
    const preview = agreement.templateContent.replace(/<[^>]*>/g, '').substring(0, 300);
    alert(`Agreement Preview: ${agreement.name}\n\nType: ${agreement.type}\nLast Modified: ${new Date(agreement.lastModified).toLocaleDateString('en-GB')}\n\nContent Preview:\n${preview}...\n\nUse the PDF generator in projects to see the full formatted agreement.`);
  };

  const renderAgreementActions = (agreement: Agreement) => (
    <div className="flex items-center space-x-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          handleViewAgreement(agreement);
        }}
        title="Preview Agreement"
        className="hover:bg-gray-50 h-8 w-8"
      >
        <Eye className="h-4 w-4 text-gray-600" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          handleEditAgreement(agreement);
        }}
        title="Edit Agreement"
        className="hover:bg-blue-50 h-8 w-8"
      >
        <Edit className="h-4 w-4 text-blue-600" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteAgreement(agreement);
        }}
        title="Delete Agreement"
        className="hover:bg-red-50 h-8 w-8"
      >
        <Trash2 className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  );

  const AgreementsTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Agreement Templates</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage contract templates with dynamic content placeholders for different project types
          </p>
        </div>
        <Button 
          onClick={() => alert('📄 Agreement Creator\n\nThe agreement template creator will be implemented in the next phase.\n\nFeatures will include:\n• Rich text editor with formatting\n• Dynamic variable system\n• Template categories\n• Version management\n• Preview and testing tools')}
          className="w-fit"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Agreement
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Construction</p>
              <p className="text-lg font-bold text-blue-900">
                {agreements.filter((a:any) => a.type === 'Construction').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText className="h-5 w-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-600">Renovation</p>
              <p className="text-lg font-bold text-orange-900">
                {agreements.filter((a:any) => a.type === 'Renovation').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-600">Interior</p>
              <p className="text-lg font-bold text-purple-900">
                {agreements.filter((a:any) => a.type === 'Interior').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <DataTable
            data={agreements}
            columns={agreementColumns}
            actions={renderAgreementActions}
            loading={agreementsLoading}
            emptyMessage="No agreement templates found. Create templates to streamline contract generation for your projects."
            searchable
            sortable
            filterable
            pagination
            pageSize={10}
          />
        </div>
      </div>
    </div>
  );

  // Tab Configuration
  const tabs: TabItem[] = [
    {
      id: 'line-items',
      label: 'Line Items',
      content: <LineItemsTab />,
      badge: Number(lineItems.length),
    },
    {
      id: 'templates',
      label: 'Templates',
      content: <EstimationTemplatesTab />,
      badge: Number(templates.length),
    },
    {
      id: 'agreements',
      label: 'Agreements',
      content: <AgreementsTab />,
      badge: Number(agreements.length),
    },
  ];

  return (
    <DashboardLayout
      title="Configurations"
      subtitle="Manage system settings, estimation components, and agreement templates"
    >
      <div className="space-y-6">


        {/* Main Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>
      </div>

      {/* Add/Edit Line Item Modal */}
      <Modal
        isOpen={isLineItemModalOpen}
        onClose={handleCloseLineItemModal}
        title={
          editingLineItem 
            ? `Edit Line Item - ${editingLineItem.name}` 
            : "Add New Line Item"
        }
        size="lg"
      >
        <LineItemForm
          onSubmit={handleCreateLineItem}
          onCancel={handleCloseLineItemModal}
          initialData={editingLineItem || undefined}
          isLoading={isFormLoading}
        />
      </Modal>

      {/* Add/Edit Estimation Template Modal */}
      <Modal
        isOpen={isTemplateModalOpen}
        onClose={handleCloseTemplateModal}
        title={
          editingTemplate 
            ? `Edit Template - ${editingTemplate.name}` 
            : "Create New Estimation Template"
        }
        size="xl"
      >
        <EstimationTemplateForm
          onSubmit={handleCreateTemplate}
          onCancel={handleCloseTemplateModal}
          initialData={editingTemplate || undefined}
          isLoading={isFormLoading}
        />
      </Modal>
    </DashboardLayout>
  );
}