"use client";
import React, { useState } from "react";
import {
  EstimationTemplateFormData,
  LineItem,
  EstimationTemplateItem,
  LineItemFormData,
} from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { useLineItems } from "@/hooks/useLineItems";
import { useToast } from "@/hooks/useToast";
import { 
  Plus, 
  Trash2, 
  Package, 
  Calculator, 
  Edit, 
  Info, 
  Copy,
  Save,
  PlusCircle,
  CheckCircle,
  Edit3
} from "lucide-react";

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

// Inline Line Item Creation Form Component
const InlineLineItemForm: React.FC<{
  onSubmit: (data: LineItemFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}> = ({ onSubmit, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState<LineItemFormData>({
    name: "",
    unit: "",
    rate: 0,
    category: "Materials",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categoryOptions = [
    { value: "Materials", label: "Materials" },
    { value: "Labor", label: "Labor" },
    { value: "Equipment", label: "Equipment" },
    { value: "Overhead", label: "Overhead" },
    { value: "Other", label: "Other" },
  ];

  const unitOptions = [
    { value: "sq ft", label: "Square Feet (sq ft)" },
    { value: "sq m", label: "Square Meters (sq m)" },
    { value: "cu ft", label: "Cubic Feet (cu ft)" },
    { value: "cu m", label: "Cubic Meters (cu m)" },
    { value: "linear ft", label: "Linear Feet (linear ft)" },
    { value: "linear m", label: "Linear Meters (linear m)" },
    { value: "pieces", label: "Pieces (pcs)" },
    { value: "kg", label: "Kilograms (kg)" },
    { value: "tons", label: "Tons" },
    { value: "hours", label: "Hours" },
    { value: "days", label: "Days" },
    { value: "lump sum", label: "Lump Sum" },
    { value: "bags", label: "Bags" },
    { value: "boxes", label: "Boxes" },
    { value: "rolls", label: "Rolls" },
    { value: "sheets", label: "Sheets" },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = "Item name is required";
    if (!formData.unit.trim()) newErrors.unit = "Unit is required";
    if (formData.rate <= 0) newErrors.rate = "Rate must be greater than 0";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Failed to create line item:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <PlusCircle className="h-5 w-5 text-blue-600 mr-2" />
          <h4 className="font-medium text-blue-900">Add New Item to Library</h4>
        </div>
        <p className="text-sm text-blue-700">
          This will create a new line item that you can use in this template and future projects.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Item Name *"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          error={errors.name}
          placeholder="e.g., Cement Portland OPC 53 Grade"
          required
        />

        <Select
          label="Category *"
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          options={categoryOptions}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Unit of Measurement *"
          value={formData.unit}
          onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
          options={[
            { value: "", label: "Select a unit" },
            ...unitOptions,
          ]}
          error={errors.unit}
          required
        />

        <Input
          label="Rate (₹) *"
          type="number"
          min="0"
          step="0.01"
          value={formData.rate}
          onChange={(e) => setFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
          error={errors.rate}
          placeholder="Enter rate per unit"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Add specifications, quality standards, or other details"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Item"}
        </Button>
      </div>
    </form>
  );
};

const EstimationTemplateForm: React.FC<EstimationTemplateFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
}) => {
  const { lineItems, createLineItem } = useLineItems();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<EstimationTemplateFormData>({
    name: initialData?.name || "",
    category: initialData?.category || "Residential",
    items: initialData?.items || [],
  });

  const [errors, setErrors] = useState<{ name?: string; items?: string }>({});
  const [showNewLineItemModal, setShowNewLineItemModal] = useState(false);
  const [isCreatingLineItem, setIsCreatingLineItem] = useState(false);
  const [pendingItemIndex, setPendingItemIndex] = useState<number | null>(null);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

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
    // Auto-open the editing for the new item
    setEditingItemIndex(formData.items.length);
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
    // Close editing if this item was being edited
    if (editingItemIndex === index) {
      setEditingItemIndex(null);
    }
  };

  const duplicateItem = (index: number) => {
    const itemToDuplicate = formData.items[index];
    const duplicatedItem: EstimationTemplateItem = {
      ...itemToDuplicate,
      id: `item_${Date.now()}`,
      quantity: itemToDuplicate.quantity,
    };
    
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items.slice(0, index + 1), duplicatedItem, ...prev.items.slice(index + 1)],
    }));
  };

  const handleCreateNewLineItem = (index: number) => {
    setPendingItemIndex(index);
    setShowNewLineItemModal(true);
  };

  const handleNewLineItemSubmit = async (data: LineItemFormData) => {
    setIsCreatingLineItem(true);
    try {
      await createLineItem(data);
      
      // Close modal immediately after successful creation
      setShowNewLineItemModal(false);
      
      // Show success toast
      showToast(`"${data.name}" has been added to your line items library!`, "success");
      
      // Wait a moment for the lineItems to update, then auto-select the new item
      setTimeout(() => {
        if (pendingItemIndex !== null) {
          // Find the newly created item by matching the name and other properties
          const newLineItem = lineItems.find(item => 
            item.name === data.name && 
            item.category === data.category && 
            item.rate === data.rate && 
            item.unit === data.unit
          );
          
          if (newLineItem) {
            updateItem(pendingItemIndex, "lineItemId", newLineItem.id);
            showToast(`"${data.name}" has been selected for this template item!`, "success");
            // Auto-close editing since item is now selected
            setEditingItemIndex(null);
          }
        }
        setPendingItemIndex(null);
      }, 500); // Wait 500ms for state to update
      
    } catch (error) {
      console.error("Failed to create line item:", error);
      showToast("Failed to create line item. Please try again.", "error");
    } finally {
      setIsCreatingLineItem(false);
    }
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
      // Show success toast based on whether it's create or update
      const action = initialData ? "updated" : "created";
      showToast(`Template "${formData.name}" has been ${action} successfully!`, "success");
    } catch (error) {
      console.error("Form submission error:", error);
      const action = initialData ? "update" : "create";
      showToast(`Failed to ${action} template. Please try again.`, "error");
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
            {lineItems.find(item => item.id === row.lineItemId)?.category}
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
                    Template Items ({formData.items.length})
                  </h4>
                  <p className="text-sm text-gray-600">
                    Add items to build your estimation template
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
                <div className="space-y-3">
                  {formData.items.map((item, index) => {
                    const selectedLineItem = getSelectedLineItem(item.lineItemId);
                    const itemTotal = calculateItemTotal(item);
                    const isEditing = editingItemIndex === index;
                    const isComplete = !!selectedLineItem;

                    return (
                      <div
                        key={item.id}
                        className={`border rounded-lg p-4 transition-all ${
                          isComplete 
                            ? 'bg-green-50 border-green-200' 
                            : isEditing 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        {/* Item Header */}
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isComplete ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                            }`}>
                              {isComplete ? <CheckCircle className="h-4 w-4" /> : index + 1}
                            </div>
                            <h5 className="font-medium text-gray-900">
                              {selectedLineItem ? selectedLineItem.name : `Item #${index + 1}`}
                            </h5>
                            {isComplete && (
                              <Badge variant="secondary" className="text-xs">
                                ₹{itemTotal.toLocaleString("en-IN")}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            {!isEditing && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingItemIndex(index)}
                                className="text-blue-600 hover:bg-blue-50 h-8 w-8 p-0"
                                title="Edit this item"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {selectedLineItem && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => duplicateItem(index)}
                                className="text-green-600 hover:bg-green-50 h-8 w-8 p-0"
                                title="Duplicate this item"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            )}
                            
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
                        </div>

                        {/* Item Details - Show when editing or incomplete */}
                        {(isEditing || !isComplete) && (
                          <div className="space-y-4 border-t border-gray-200 pt-4">
                            <Select
                              label="Choose Item *"
                              value={item.lineItemId}
                              onChange={(e) => {
                                updateItem(index, "lineItemId", e.target.value);
                                if (e.target.value) {
                                  // Show success toast when item is selected
                                  const selectedItem = lineItems.find(li => li.id === e.target.value);
                                  if (selectedItem) {
                                    showToast(`"${selectedItem.name}" has been added to your template!`, "success");
                                  }
                                  // Auto-close editing when item is selected
                                  setEditingItemIndex(null);
                                }
                              }}
                              options={[
                                {
                                  value: "",
                                  label: "Select from your existing items",
                                },
                                ...lineItemOptions,
                              ]}
                              required
                            />

                            {/* Create New Line Item Button - Only show when no item is selected */}
                            {!item.lineItemId && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleCreateNewLineItem(index)}
                                className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
                              >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Don't see your item? Create a new one
                              </Button>
                            )}

                            {selectedLineItem && (
                              <>
                                <div className="grid grid-cols-2 gap-4">
                                  <Input
                                    label="Quantity *"
                                    type="number"
                                    min="0.01"
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
                                      Total Amount
                                    </label>
                                    <div className="text-lg font-bold text-green-600 bg-green-50 p-3 rounded-lg text-center">
                                      ₹{itemTotal.toLocaleString("en-IN")}
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes (Optional)
                                  </label>
                                  <textarea
                                    value={item.notes || ""}
                                    onChange={(e) =>
                                      updateItem(index, "notes", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    rows={2}
                                    placeholder="Add specific notes for this item..."
                                  />
                                </div>

                                <div className="flex justify-end">
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => setEditingItemIndex(null)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Done
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        {/* Show summary when complete and not editing */}
                        {isComplete && !isEditing && (
                          <div className="text-sm text-gray-600 mt-2">
                            <span>{item.quantity} {selectedLineItem.unit} × ₹{selectedLineItem.rate} = ₹{itemTotal.toLocaleString("en-IN")}</span>
                            {item.notes && (
                              <p className="text-xs text-blue-600 mt-1">📝 {item.notes}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {formData.items.length === 0 && (
                    <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                      <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Start Building Your Template</h3>
                      <p className="text-sm mb-4">
                        Add your first item to begin creating the estimation template
                      </p>
                      <Button
                        type="button"
                        onClick={addItem}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Item
                      </Button>
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
                  Template Summary
                </h4>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded p-3 border">
                    <p className="text-sm text-gray-600">Configured Items</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {templateItemsData.length}
                    </p>
                    <p className="text-xs text-gray-500">
                      of {formData.items.length} total
                    </p>
                  </div>
                  <div className="bg-white rounded p-3 border">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{(calculateTemplateTotal() / 100000).toFixed(1)}L
                    </p>
                    <p className="text-xs text-gray-500">
                      ₹{calculateTemplateTotal().toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Table - Flexible Height */}
              <div className="bg-white rounded-lg border border-gray-200 flex-1 min-h-0 flex flex-col">
                {templateItemsData.length > 0 ? (
                  <div className="p-4 h-full flex flex-col">
                    <h5 className="font-medium text-gray-900 mb-4">Configured Items</h5>
                    <div className="flex-1 min-h-0">
                      <DataTable
                        data={templateItemsData}
                        columns={columns}
                        loading={false}
                        emptyMessage="Configure items to see them here"
                        searchable={false}
                        sortable={true}
                        filterable={false}
                        pagination={false}
                        pageSize={100}
                        className="h-full"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center flex-1 text-gray-500">
                    <div className="text-center p-8">
                      <Calculator className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">Template Preview</h3>
                      <p className="text-sm">
                        Configure items on the left to see your template summary
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions - Fixed at Bottom */}
        <div className="flex justify-between items-center border-t border-gray-200 pt-6 mt-6 flex-shrink-0">
          <div className="text-sm text-gray-600">
            {templateItemsData.length > 0 && (
              <span>
                Total: <span className="font-bold text-green-600 text-lg">
                  ₹{calculateTemplateTotal().toLocaleString("en-IN")}
                </span> • {templateItemsData.length} items configured
              </span>
            )}
          </div>
          
          <div className="flex space-x-3">
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
              disabled={isLoading || formData.items.length === 0 || templateItemsData.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Save className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {initialData ? "Update Template" : "Create Template"}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* New Line Item Modal */}
      <Modal
        isOpen={showNewLineItemModal}
        onClose={() => {
          setShowNewLineItemModal(false);
          setPendingItemIndex(null);
        }}
        title="Create New Line Item"
        size="lg"
      >
        <InlineLineItemForm
          onSubmit={handleNewLineItemSubmit}
          onCancel={() => {
            setShowNewLineItemModal(false);
            setPendingItemIndex(null);
          }}
          isLoading={isCreatingLineItem}
        />
      </Modal>
    </div>
  );
};

export default EstimationTemplateForm;