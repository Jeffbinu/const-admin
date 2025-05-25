// components/forms/ProjectForm.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useEstimationTemplates } from '@/hooks/useEstimationTemplates';
import { useLineItems } from '@/hooks/useLineItems';
import { useProjectEstimations } from '@/hooks/useProjectEstimations';
import { Project, ProjectFormData, EstimationTemplate } from '@/lib/types';
import { 
  Save, 
  X, 
  Plus, 
  Eye, 
  Calculator,
  FileText,
  Building,
  User,
  Calendar,
  DollarSign
} from 'lucide-react';

interface ProjectFormProps {
  onSubmit: (data: ProjectFormData, estimationTemplateId?: string) => Promise<void>;
  onCancel: () => void;
  initialData?: Project;
  isLoading?: boolean;
}

export default function ProjectForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  isLoading = false 
}: ProjectFormProps) {
  const { templates } = useEstimationTemplates();
  const { lineItems } = useLineItems();
  const [selectedEstimationTemplate, setSelectedEstimationTemplate] = useState<EstimationTemplate | null>(null);
  
  const [formData, setFormData] = useState<ProjectFormData>({
    name: initialData?.name || '',
    clientName: initialData?.clientName || '',
    clientAddress: initialData?.clientAddress || '',
    agreementDate: initialData?.agreementDate || '',
    projectType: initialData?.projectType || 'Residential',
    numberOfFloors: initialData?.numberOfFloors || 1,
    projectDuration: initialData?.projectDuration || 6,
    estimatedBudget: initialData?.estimatedBudget || 0,
    status: initialData?.status || 'New',
  });

  const [showEstimationPreview, setShowEstimationPreview] = useState(false);
  const [estimatedTotal, setEstimatedTotal] = useState(0);

  // Calculate estimated total when template is selected
  useEffect(() => {
    if (selectedEstimationTemplate) {
      let total = 0;
      selectedEstimationTemplate.items.forEach(item => {
        const lineItem = lineItems.find(li => li.id === item.lineItemId);
        if (lineItem) {
          total += item.quantity * lineItem.rate;
        }
      });
      setEstimatedTotal(total);
      
      // Auto-update estimated budget if it's 0 or if we're creating a new project
      if (formData.estimatedBudget === 0 || !initialData) {
        setFormData(prev => ({ ...prev, estimatedBudget: total }));
      }
    }
  }, [selectedEstimationTemplate, lineItems, formData.estimatedBudget, initialData]);

  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData, selectedEstimationTemplate?.id);
  };

  const projectTypes = [
    'Residential',
    'Commercial',
    'Industrial',
    'Renovation',
    'New Construction',
    'Infrastructure'
  ];

  const statusOptions = [
    'New',
    'Under Construction', 
    'Completed',
    'On Hold',
    'Opportunity'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Project Basic Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <FileText className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Project Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter project name"
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
              required
            >
              {projectTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
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
              required
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
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
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Duration (months) *
            </label>
            <input
              type="number"
              value={formData.projectDuration}
              onChange={(e) => handleInputChange('projectDuration', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              required
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
              required
            />
          </div>
        </div>
      </div>

      {/* Client Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <User className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Client Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Name *
            </label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => handleInputChange('clientName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter client name"
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
              placeholder="Enter client address"
              rows={3}
              required
            />
          </div>
        </div>
      </div>

      {/* Estimation & Budget */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Calculator className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Estimation & Budget</h3>
          </div>
          {selectedEstimationTemplate && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowEstimationPreview(!showEstimationPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showEstimationPreview ? 'Hide Preview' : 'Preview Items'}
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {/* Estimation Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Estimation Template (Optional)
            </label>
            <p className="text-sm text-gray-600 mb-4">
              Select a template to automatically calculate project costs and create initial estimation.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedEstimationTemplate?.id === template.id 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedEstimationTemplate(
                    selectedEstimationTemplate?.id === template.id ? null : template
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">{template.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    {template.itemsCount} items • Updated {new Date(template.lastModified).toLocaleDateString('en-GB')}
                  </p>
                  {selectedEstimationTemplate?.id === template.id && (
                    <div className="flex items-center text-blue-600">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-2" />
                      <span className="text-xs font-medium">Selected</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {templates.length === 0 && (
              <div className="text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
                <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No estimation templates available</p>
                <p className="text-sm text-gray-500 mt-1">Create templates in the Configurations section</p>
              </div>
            )}
          </div>

          {/* Template Preview */}
          {selectedEstimationTemplate && showEstimationPreview && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">
                Template Preview: {selectedEstimationTemplate.name}
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedEstimationTemplate.items.map((item) => {
                  const lineItem = lineItems.find(li => li.id === item.lineItemId);
                  const itemTotal = lineItem ? item.quantity * lineItem.rate : 0;
                  
                  return (
                    <div key={item.id} className="flex justify-between items-center text-sm bg-white rounded p-2">
                      <div>
                        <span className="font-medium text-gray-900">{lineItem?.name || 'Unknown Item'}</span>
                        <span className="text-gray-500 ml-2">({item.quantity} {lineItem?.unit})</span>
                      </div>
                      <span className="font-medium text-green-600">
                        ₹{itemTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-blue-200 mt-3 pt-3 flex justify-between items-center">
                <span className="font-semibold text-blue-900">Estimated Total:</span>
                <span className="font-bold text-green-600 text-lg">
                  ₹{estimatedTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}

          {/* Manual Budget Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Budget (₹) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={formData.estimatedBudget}
                onChange={(e) => handleInputChange('estimatedBudget', parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter estimated budget"
                min="0"
                step="1000"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {selectedEstimationTemplate 
                ? 'This will be updated automatically when you select an estimation template'
                : 'Enter the estimated project budget'
              }
            </p>
          </div>

          {/* Budget vs Template Comparison */}
          {selectedEstimationTemplate && estimatedTotal > 0 && estimatedTotal !== formData.estimatedBudget && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                <span className="text-sm font-medium text-yellow-800">Budget Comparison</span>
              </div>
              <div className="text-sm text-yellow-700">
                Template estimate: ₹{estimatedTotal.toLocaleString('en-IN')} • 
                Manual budget: ₹{formData.estimatedBudget.toLocaleString('en-IN')} • 
                Difference: ₹{Math.abs(estimatedTotal - formData.estimatedBudget).toLocaleString('en-IN')}
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-2 text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                onClick={() => handleInputChange('estimatedBudget', estimatedTotal)}
              >
                Use Template Amount
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600 mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {initialData ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
}