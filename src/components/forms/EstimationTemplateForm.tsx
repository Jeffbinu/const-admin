"use client";
import React, { useState } from "react";
import {
  EstimationTemplateFormData,
  LineItem,
  EstimationTemplateItem,
} from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import DataTable from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { useLineItems } from "@/hooks/useLineItems";
import { Plus, Trash2, Package, Calculator, Edit, Info } from "lucide-react";

interface EstimationTemplateFormProps {
  onSubmit: (data: EstimationTemplateFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<EstimationTemplateFormData>;
  isLoading?: boolean;
}

interface TemplateItemDisplay {
  id: string;
  itemName: string;
  category: string;
  unit: string;
  rate: number;
  quantity: number;
  total: number;
  lineItemId: string;
}

const EstimationTemplateForm: React.FC<EstimationTemplateFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
}) => {
  const { lineItems } = useLineItems();

  const [formData, setFormData] = useState<EstimationTemplateFormData>({
    name: initialData?.name || "",
    category: initialData?.category || "Residential",
    items: initialData?.items || [],
  });

  const [errors, setErrors] = useState<{ name?: string; items?: string }>({});

  const handleChange = (
    field: keyof EstimationTemplateFormData,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (["name", "items"].includes(field as string)) {
      setErrors((prev) => ({
        ...prev,
        [field as "name" | "items"]: undefined,
      }));
    }
  };

  const addItem = () => {
    const newItem: EstimationTemplateItem = {
      id: `item_${Date.now()}`,
      lineItemId: "",
      quantity: 1,
      notes: "",
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const updateItem = (
    index: number,
    field: keyof EstimationTemplateItem,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; items?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Template name is required";
    }
    if (formData.items.length === 0) {
      newErrors.items = "Please add at least one item to the template";
    }

    const hasEmptyItems = formData.items.some((item) => !item.lineItemId);
    if (hasEmptyItems) {
      newErrors.items = "Please select a line item for all added items";
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
      console.error("Form submission error:", error);
    }
  };

  const lineItemOptions = lineItems.map((item) => ({
    value: item.id,
    label: `${item.name} - ₹${item.rate}/${item.unit}`,
  }));

  const getSelectedLineItem = (lineItemId: string) => {
    return lineItems.find((item) => item.id === lineItemId);
  };

  const calculateItemTotal = (item: EstimationTemplateItem) => {
    const lineItem = getSelectedLineItem(item.lineItemId);
    if (!lineItem) return 0;
    return lineItem.rate * item.quantity;
  };

  const calculateTemplateTotal = () => {
    return formData.items.reduce(
      (total, item) => total + calculateItemTotal(item),
      0
    );
  };

  // Transform items for table display
  const templateItemsData: TemplateItemDisplay[] = formData.items
    .filter((item) => item.lineItemId) // Only show items with selected line items
    .map((item) => {
      const lineItem = getSelectedLineItem(item.lineItemId);
      return {
        id: item.id,
        itemName: lineItem?.name || "Unknown Item",
        category: lineItem?.category || "Unknown",
        unit: lineItem?.unit || "",
        rate: lineItem?.rate || 0,
        quantity: item.quantity,
        total: calculateItemTotal(item),
        lineItemId: item.lineItemId,
      };
    });

  // Table columns
  const columns = [
    {
      id: "itemName",
      header: "Item Name",
      accessor: "itemName" as keyof TemplateItemDisplay,
      sortable: true,
      render: (value: any, row: TemplateItemDisplay) => (
        <div>
          <span className="font-medium text-gray-900">{value}</span>
          <p className="text-xs text-gray-500">
            ID: {row.lineItemId.slice(-8)}
          </p>
        </div>
      ),
    },
    {
      id: "quantity",
      header: "Quantity",
      accessor: "quantity" as keyof TemplateItemDisplay,
      sortable: true,
      render: (value: any, row: TemplateItemDisplay) => (
        <div className="text-center">
          <span className="font-semibold">{value}</span>
          <p className="text-xs text-gray-500">{row.unit}</p>
        </div>
      ),
    },
    {
      id: "rate",
      header: "Rate (₹)",
      accessor: "rate" as keyof TemplateItemDisplay,
      sortable: true,
      render: (value: any) => (
        <span className="font-medium text-gray-900">
          ₹{value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      id: "total",
      header: "Total (₹)",
      accessor: "total" as keyof TemplateItemDisplay,
      sortable: true,
      render: (value: any) => (
        <span className="font-semibold text-green-600">
          ₹{value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
  ];


  return (
    <div className="h-full w-full flex flex-col">
      <form onSubmit={handleSubmit} className="h-full w-full flex flex-col">
        {/* Main Content Area - Two-Pane Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          {/* Left Pane - Form */}
          <div className="flex flex-col min-h-0">
            {/* Template Basic Info - Fixed Height */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 flex-shrink-0 mb-4">
              <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                <Info className="h-5 w-5 mr-2" />
                Template Information
              </h4>

              <Input
                label="Template Name *"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                error={errors.name}
                placeholder="Enter a descriptive name (e.g., 'Small Bedroom Construction')"
                required
              />
        
            </div>

            {/* Add Items Section - Scrollable */}
            <div className="flex flex-col flex-1 min-h-0">
              {/* Section Header - Fixed */}
              <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 flex items-center">
                    <Package className="h-5 w-5 mr-2 text-blue-600" />
                    Add Items to Template
                  </h4>
                  <p className="text-sm text-gray-600">
                    Build your template by adding line items
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="flex items-center flex-shrink-0"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {/* Error Message - Fixed */}
              {errors.items && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 flex-shrink-0">
                  <p className="text-sm text-red-600">{errors.items}</p>
                </div>
              )}

              {/* Items Form - Scrollable Area */}
              <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                <div className="space-y-4">
                  {formData.items.map((item, index) => {
                    const selectedLineItem = getSelectedLineItem(
                      item.lineItemId
                    );
                    const itemTotal = calculateItemTotal(item);

                    return (
                      <div
                        key={item.id}
                        id={`item-${index}`}
                        className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-medium text-gray-900">
                            Item #{index + 1}
                          </h5>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                            title="Remove this item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <Select
                            label="Choose Item *"
                            value={item.lineItemId}
                            onChange={(e) =>
                              updateItem(index, "lineItemId", e.target.value)
                            }
                            options={[
                              {
                                value: "",
                                label: "Select an item from your list",
                              },
                              ...lineItemOptions,
                            ]}
                            required
                          />

                          {selectedLineItem && (
                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                label="Quantity *"
                                type="number"
                                min="1"
                                step="0.01"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateItem(
                                    index,
                                    "quantity",
                                    parseFloat(e.target.value) || 1
                                  )
                                }
                                required
                              />
                              <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">
                                  Rate & Unit
                                </label>
                                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                  <p>
                                    ₹{selectedLineItem.rate}/
                                    {selectedLineItem.unit}
                                  </p>
                                  <p className="text-xs text-green-600">
                                    Total: ₹
                                    {itemTotal.toLocaleString("en-IN", {
                                      minimumFractionDigits: 2,
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {formData.items.length === 0 && (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                      <Package className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="font-medium">No items added yet</p>
                      <p className="text-sm">
                        Click "Add Item" to start building your template
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Pane - Preview Table */}
          <div className="flex flex-col min-h-0">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex flex-col h-full">
              {/* Header - Fixed */}
              <div className="flex-shrink-0 mb-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Calculator className="h-5 w-5 mr-2 text-green-600" />
                  Template Preview
                </h4>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded p-3 border">
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {templateItemsData.length}
                    </p>
                  </div>
                  <div className="bg-white rounded p-3 border">
                    <p className="text-sm text-gray-600">Estimated Total</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹
                      {calculateTemplateTotal().toLocaleString("en-IN", {
                        minimumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Table - Flexible Height */}
              <div className="bg-white rounded-lg border border-gray-200 flex-1 min-h-0 flex flex-col">
                {templateItemsData.length > 0 ? (
                  <div className="p-4 h-full flex flex-col">
                    <div className="flex-1 min-h-0">
                      <DataTable
                        data={templateItemsData}
                        columns={columns}
                        loading={false}
                        emptyMessage="Add items to see them here"
                        searchable={false}
                        sortable={true}
                        filterable={false}
                        pagination={false} // Disable pagination to let it scroll
                        pageSize={100} // Large page size
                        className="h-full"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center flex-1 text-gray-500">
                    <div className="text-center">
                      <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">Template Preview</p>
                      <p className="text-sm">
                        Add items to see the template preview
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions - Fixed at Bottom */}
        <div className="flex justify-end space-x-3 border-t border-gray-200 mt-6 flex-shrink-0">
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
            disabled={isLoading || formData.items.length === 0}
          >
            {isLoading
              ? "Saving..."
              : initialData
              ? "Update Template"
              : "Create Template"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EstimationTemplateForm;
