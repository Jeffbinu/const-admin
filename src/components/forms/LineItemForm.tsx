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
    category: initialData?.category || 'Building Materials',
    unit: initialData?.unit || '',
    rate: initialData?.rate || 0,
    description: initialData?.description || '',
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

  const categoryOptions = [
    { value: 'Building Materials', label: 'Building Materials' },
    { value: 'Labor', label: 'Labor' },
    { value: 'Equipment', label: 'Equipment' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Item Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          placeholder="Enter item name"
          required
        />

        <Select
          label="Category"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value as LineItemFormData['category'])}
          options={categoryOptions}
          error={errors.category}
          required
        />

        <Input
          label="Unit"
          value={formData.unit}
          onChange={(e) => handleChange('unit', e.target.value)}
          error={errors.unit}
          placeholder="e.g., Bag, Piece, Cubic Meter"
          required
        />

        <Input
          label="Rate (₹)"
          type="number"
          min="0"
          step="0.01"
          value={formData.rate}
          onChange={(e) => handleChange('rate', parseFloat(e.target.value) || 0)}
          error={errors.rate}
          placeholder="350.00"
          required
        />
      </div>

      <Input
        label="Description (Optional)"
        value={formData.description || ''}
        onChange={(e) => handleChange('description', e.target.value)}
        placeholder="Enter item description"
      />

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
          {isLoading ? 'Saving...' : 'Save Line Item'}
        </Button>
      </div>
    </form>
  );
};

export default LineItemForm;