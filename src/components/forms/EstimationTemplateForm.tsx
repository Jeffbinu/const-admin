'use client';
import React, { useState } from 'react';
import { EstimationTemplateFormData, LineItem, EstimationTemplateItem } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useLineItems } from '@/hooks/useLineItems';
import { Plus, Trash2 } from 'lucide-react';

interface EstimationTemplateFormProps {
  onSubmit: (data: EstimationTemplateFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<EstimationTemplateFormData>;
  isLoading?: boolean;
}

const EstimationTemplateForm: React.FC<EstimationTemplateFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
}) => {
  const { lineItems } = useLineItems();
  
  const [formData, setFormData] = useState<EstimationTemplateFormData>({
    name: initialData?.name || '',
    category: initialData?.category || 'Residential',
    items: initialData?.items || [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EstimationTemplateFormData, string>>>({});

  const handleChange = (field: keyof EstimationTemplateFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addItem = () => {
    const newItem: EstimationTemplateItem = {
      id: `item_${Date.now()}`,
      lineItemId: '',
      quantity: 1,
      notes: '',
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const updateItem = (index: number, field: keyof EstimationTemplateItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EstimationTemplateFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    }
    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const categoryOptions = [
    { value: 'Residential', label: 'Residential' },
    { value: 'Commercial', label: 'Commercial' },
    { value: 'Renovation', label: 'Renovation' },
  ];

  const lineItemOptions = lineItems.map(item => ({
    value: item.id,
    label: `${item.name} (${item.unit})`,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Template Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          placeholder="Enter template name"
          required
        />

        <Select
          label="Category"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value as EstimationTemplateFormData['category'])}
          options={categoryOptions}
          error={errors.category}
          required
        />
      </div>

      {/* Template Items */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-medium text-gray-900">Template Items</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItem}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        {errors.items && (
          <p className="text-sm text-red-600">{errors.items}</p>
        )}

        <div className="space-y-3">
          {formData.items.map((item, index) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Select
                    label="Line Item"
                    value={item.lineItemId}
                    onChange={(e) => updateItem(index, 'lineItemId', e.target.value)}
                    options={[{ value: '', label: 'Select line item' }, ...lineItemOptions]}
                    required
                  />
                </div>
                
                <Input
                  label="Quantity"
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  required
                />

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeItem(index)}
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                <Input
                  label="Notes (Optional)"
                  value={item.notes || ''}
                  onChange={(e) => updateItem(index, 'notes', e.target.value)}
                  placeholder="Additional notes for this item"
                />
              </div>
            </div>
          ))}

          {formData.items.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No items added yet. Click "Add Item" to get started.
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Template'}
        </Button>
      </div>
    </form>
  );
};
export default EstimationTemplateForm;