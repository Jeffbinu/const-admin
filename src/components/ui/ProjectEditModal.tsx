'use client';
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import DataTable from '@/components/ui/DataTable';
import { useEstimationTemplates } from '@/hooks/useEstimationTemplates';
import { useLineItems } from '@/hooks/useLineItems';
import { useProjectEstimations } from '@/hooks/useProjectEstimations';
import { 
  Project, 
  ProjectFormData, 
  EstimationTemplate,
  ProjectEstimationItem,
  TableColumn,
  TabItem
} from '@/lib/types';
import { 
  Save, 
  X, 
  Plus, 
  Edit, 
  Trash2,
  FileText,
  Calculator,
  Building,
  User,
  DollarSign,
  Calendar,
  Eye,
  History,
  Download
} from 'lucide-react';

interface ProjectEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSave: (updates: Partial<Project>) => Promise<void>;
  isLoading?: boolean;
}

export default function ProjectEditModal({
  isOpen,
  onClose,
  project,
  onSave,
  isLoading = false
}: ProjectEditModalProps) {
  const { templates } = useEstimationTemplates();
  const { lineItems } = useLineItems();
  const { 
    estimations, 
    createFromTemplate, 
    updateItem, 
    deleteItem, 
    setActive 
  } = useProjectEstimations(project.id);

  const [activeTab, setActiveTab] = useState('details');
  const [isSaving, setIsSaving] = useState(false);
  const [editingEstimationItem, setEditingEstimationItem] = useState<ProjectEstimationItem | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EstimationTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Project form data
  const [formData, setFormData] = useState<ProjectFormData>({
    name: project.name,
    clientName: project.clientName,
    clientAddress: project.clientAddress,
    agreementDate: project.agreementDate,
    projectType: project.projectType,
    numberOfFloors: project.numberOfFloors,
    projectDuration: project.projectDuration,
    estimatedBudget: project.estimatedBudget,
    status: project.status,
    projectAddress: project.projectAddress || '', // Add default if missing
    phoneNumber: project.phoneNumber || '',       // Add default if missing
  });

  const currentEstimation = estimations.find(est => est.isActive);

  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProject = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateEstimationFromTemplate = async (template: EstimationTemplate) => {
    if (!template) return;
    
    const estimationName = `${template.name} - Version ${estimations.length + 1}`;
    await createFromTemplate(project.id, template.id, estimationName);
    setShowTemplateModal(false);
    setSelectedTemplate(null);
  };

  const handleUpdateEstimationItem = async (itemId: string, updates: Partial<ProjectEstimationItem>) => {
    if (!currentEstimation) return;
    await updateItem(currentEstimation.id, itemId, updates);
    setEditingEstimationItem(null);
  };

  const handleDeleteEstimationItem = async (itemId: string) => {
    if (!currentEstimation) return;
    if (window.confirm('Are you sure you want to delete this estimation item?')) {
      await deleteItem(currentEstimation.id, itemId);
    }
  };

  // Project Details Tab
  const ProjectDetailsTab = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Building className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Project Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Type *
            </label>
            <select
              value={formData.projectType}
              onChange={(e) => handleInputChange('projectType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
              <option value="Renovation">Renovation</option>
              <option value="New Construction">New Construction</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as Project['status'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="New">New</option>
              <option value="Under Construction">Under Construction</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
              <option value="Opportunity">Opportunity</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Floors *
            </label>
            <input
              type="number"
              value={formData.numberOfFloors}
              onChange={(e) => handleInputChange('numberOfFloors', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (months) *
            </label>
            <input
              type="number"
              value={formData.projectDuration}
              onChange={(e) => handleInputChange('projectDuration', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agreement Date *
            </label>
            <input
              type="date"
              value={formData.agreementDate}
              onChange={(e) => handleInputChange('agreementDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Budget (₹) *
            </label>
            <input
              type="number"
              value={formData.estimatedBudget}
              onChange={(e) => handleInputChange('estimatedBudget', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="1000"
            />
          </div>
        </div>
      </div>

      {/* Client Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <User className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Client Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Name *
            </label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => handleInputChange('clientName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Address *
            </label>
            <textarea
              value={formData.clientAddress}
              onChange={(e) => handleInputChange('clientAddress', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Estimation Tab
  const EstimationTab = () => {
    const estimationItemColumns: TableColumn<ProjectEstimationItem>[] = [
      {
        id: 'itemName',
        header: 'Item Details',
        accessor: (item) => {
          const lineItem = lineItems.find(li => li.id === item.lineItemId);
          return lineItem?.name || 'Unknown Item';
        },
        render: (value, row) => {
          const lineItem = lineItems.find(li => li.id === row.lineItemId);
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
        id: 'quantity',
        header: 'Quantity',
        accessor: 'quantity',
        render: (value) => (
          <div className="text-center font-medium">{value}</div>
        ),
      },
      {
        id: 'rate',
        header: 'Rate (₹)',
        accessor: 'rate',
        render: (value) => (
          <div className="text-right font-medium">₹{value.toLocaleString('en-IN')}</div>
        ),
      },
      {
        id: 'amount',
        header: 'Amount (₹)',
        accessor: 'amount',
        render: (value) => (
          <div className="text-right font-semibold text-green-600">
            ₹{value.toLocaleString('en-IN')}
          </div>
        ),
      },
      {
        id: 'notes',
        header: 'Notes',
        accessor: 'notes',
        render: (value) => (
          <div className="text-sm text-gray-600 max-w-xs truncate">
            {value || '-'}
          </div>
        ),
      },
    ];

    const renderEstimationItemActions = (item: ProjectEstimationItem) => (
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setEditingEstimationItem(item)}
          title="Edit Item"
          className="hover:bg-blue-50 h-8 w-8"
        >
          <Edit className="h-4 w-4 text-blue-600" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDeleteEstimationItem(item.id)}
          title="Delete Item"
          className="hover:bg-red-50 h-8 w-8"
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    );

    return (
      <div className="space-y-6">
        {/* Estimation Header */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Project Estimation</h3>
            <p className="text-sm text-gray-600">
              Manage line items and costs for this project
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowTemplateModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add from Template
          </Button>
        </div>

        {/* Current Estimation */}
        {currentEstimation ? (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="font-semibold text-gray-900">{currentEstimation.name}</h4>
                <p className="text-sm text-gray-600">
                  Version {currentEstimation.version} • Last updated: {new Date(currentEstimation.updatedDate).toLocaleDateString('en-GB')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{currentEstimation.totalAmount.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <DataTable
              data={currentEstimation.items}
              columns={estimationItemColumns}
              actions={renderEstimationItemActions}
              emptyMessage="No items in this estimation"
              searchable
              pagination
              pageSize={8}
            />
          </div>
        ) : estimations.length > 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Estimation</h3>
            <p className="text-gray-500 mb-4">Select an estimation version to activate it</p>
            <div className="space-y-2">
              {estimations.slice(0, 3).map((estimation) => (
                <div key={estimation.id} className="flex justify-between items-center p-3 bg-white rounded border">
                  <div>
                    <span className="font-medium">{estimation.name}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      Version {estimation.version}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActive(project.id, estimation.id)}
                  >
                    Set Active
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Calculator className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Estimations Yet</h3>
            <p className="text-gray-500 mb-6">Create your first estimation using a template</p>
            <Button onClick={() => setShowTemplateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Estimation
            </Button>
          </div>
        )}

        {/* Estimation History */}
        {estimations.length > 1 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <History className="h-4 w-4 mr-2" />
              Estimation History ({estimations.length} versions)
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {estimations.map((estimation) => (
                <div 
                  key={estimation.id} 
                  className={`flex justify-between items-center p-3 rounded border ${
                    estimation.isActive ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div>
                    <span className="font-medium">{estimation.name}</span>
                    {estimation.isActive && <Badge variant="info" className="ml-2">Active</Badge>}
                    <div className="text-sm text-gray-500">
                      Version {estimation.version} • {new Date(estimation.createdDate).toLocaleDateString('en-GB')}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-green-600">
                      ₹{estimation.totalAmount.toLocaleString('en-IN')}
                    </span>
                    {!estimation.isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActive(project.id, estimation.id)}
                      >
                        Set Active
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Agreement Tab
  const AgreementTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Project Agreement</h3>
          <p className="text-sm text-gray-600">
            Generate and manage project contracts and agreements
          </p>
        </div>
        <Button size="sm">
          <Download className="h-4 w-4 mr-2" />
          Generate Agreement
        </Button>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <div className="text-center py-8">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Agreement Management</h3>
          <p className="text-gray-500 mb-6">
            Agreement generation and editing features will be available in the next update
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <h4 className="font-medium text-gray-900 mb-2">Standard Contract</h4>
              <p className="text-sm text-gray-600 mb-3">Basic construction agreement template</p>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <h4 className="font-medium text-gray-900 mb-2">Custom Agreement</h4>
              <p className="text-sm text-gray-600 mb-3">Tailored contract based on project specifics</p>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <h4 className="font-medium text-gray-900 mb-2">Amendment</h4>
              <p className="text-sm text-gray-600 mb-3">Modify existing agreements</p>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs: TabItem[] = [
    {
      id: 'details',
      label: 'Project Details',
      content: <ProjectDetailsTab />,
    },
    {
      id: 'estimation',
      label: 'Estimation',
      content: <EstimationTab />,
      badge: currentEstimation?.items.length || 0,
    },
    {
      id: 'agreement',
      label: 'Agreement',
      content: <AgreementTab />,
    },
  ];

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Edit Project: ${project.name}`}
        size="2xl"
      >
        <div className="space-y-6">
          {/* Tab Navigation */}
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Form Actions */}
          {activeTab === 'details' && (
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveProject}
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600 mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Template Selection Modal */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="Add Estimation from Template"
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-gray-600">
            Select a template to create a new estimation for this project.
          </p>
          
          <div className="space-y-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedTemplate?.id === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {template.itemsCount} items • {template.category}
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

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setShowTemplateModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedTemplate && handleCreateEstimationFromTemplate(selectedTemplate)}
              disabled={!selectedTemplate}
            >
              Create Estimation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Estimation Item Edit Modal */}
      {editingEstimationItem && (
        <Modal
          isOpen={!!editingEstimationItem}
          onClose={() => setEditingEstimationItem(null)}
          title="Edit Estimation Item"
          size="md"
        >
          <EstimationItemEditForm
            item={editingEstimationItem}
            lineItems={lineItems}
            onSave={(updates) => handleUpdateEstimationItem(editingEstimationItem.id, updates)}
            onCancel={() => setEditingEstimationItem(null)}
          />
        </Modal>
      )}
    </>
  );
}

// Estimation Item Edit Form Component
const EstimationItemEditForm: React.FC<{
  item: ProjectEstimationItem;
  lineItems: any[];
  onSave: (updates: Partial<ProjectEstimationItem>) => void;
  onCancel: () => void;
}> = ({ item, lineItems, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    quantity: item.quantity,
    rate: item.rate,
    notes: item.notes || ''
  });

  const lineItem = lineItems.find(li => li.id === item.lineItemId);
  const calculatedAmount = formData.quantity * formData.rate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      amount: calculatedAmount
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900">{lineItem?.name}</h4>
        <p className="text-sm text-gray-600">{lineItem?.category} • {lineItem?.unit}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity
          </label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
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
            onChange={(e) => setFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
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
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Add any notes or specifications..."
        />
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Calculated Amount:</span>
          <span className="text-lg font-bold text-blue-600">
            ₹{calculatedAmount.toLocaleString('en-IN')}
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