'use client';
import React, { useState } from 'react';
import { LineItemFormData } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface LineItemFormProps {
  onSubmit: (data: LineItemFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<LineItemFormData>;
  isLoading?: boolean;
}

const LineItemForm: React.FC<LineItemFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<LineItemFormData>({
    name: initialData?.name || '',
    unit: initialData?.unit || '',
    rate: initialData?.rate || 0,
    description: initialData?.description || '', // Keep for backend compatibility
  });

  const [errors, setErrors] = useState<Partial<Record<keyof LineItemFormData, string>>>({});

  const handleChange = (field: keyof LineItemFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LineItemFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }
    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }
    if (formData.rate <= 0) {
      newErrors.rate = 'Rate must be greater than 0';
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

  const unitOptions = [
    { value: '', label: 'Select Unit' },
    { value: 'Sq ft', label: 'Square Feet (Sq ft)' },
    { value: 'Piece', label: 'Piece' },
    { value: 'Running Ft', label: 'Running Feet (Running Ft)' },
    { value: 'Bag', label: 'Bag' },
    { value: 'Cubic Meter', label: 'Cubic Meter' },
    { value: 'Liter', label: 'Liter' },
    { value: 'Kg', label: 'Kilogram (Kg)' },
  ];

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6 p-1">
        <div className="space-y-4">
          <div>
            <Input
              label="Item Name *"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
              placeholder="Enter the name of the item (e.g., Cement, Steel Rod)"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Give a clear, descriptive name that workers will easily understand
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select
                label="Unit of Measurement *"
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                options={unitOptions}
                error={errors.unit}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                How do you measure this item?
              </p>
            </div>

            <div>
              <Input
                label="Rate per Unit (₹) *"
                type="number"
                min="0"
                step="0.01"
                value={formData.rate}
                onChange={(e) => handleChange('rate', parseFloat(e.target.value) || 0)}
                error={errors.rate}
                placeholder="0.00"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Cost per unit (including all charges)
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
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
            {isLoading ? 'Saving...' : initialData ? 'Update Item' : 'Add Item'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LineItemForm;