"use client";
import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import DataTable from "@/components/ui/DataTable";
import { EstimationTemplate, LineItem, TableColumn } from "@/lib/types";
import { Package, Calculator, Calendar, Eye } from "lucide-react";

interface TemplateViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: EstimationTemplate | null;
  lineItems: LineItem[];
}

interface TemplateItemView {
  id: string;
  itemName: string;
  category: string;
  unit: string;
  rate: number;
  quantity: number;
  total: number;
  notes?: string;
}

const TemplateViewModal: React.FC<TemplateViewModalProps> = ({
  isOpen,
  onClose,
  template,
  lineItems,
}) => {
  if (!template) return null;

  // Transform template items for table display
  const templateItemsData: TemplateItemView[] = template.items.map((item) => {
    const lineItem = lineItems.find((li) => li.id === item.lineItemId);
    return {
      id: item.id,
      itemName: lineItem?.name || "Unknown Item",
      category: lineItem?.category || "Unknown",
      unit: lineItem?.unit || "",
      rate: lineItem?.rate || 0,
      quantity: item.quantity,
      total: (lineItem?.rate || 0) * item.quantity,
      notes: item.notes,
    };
  });

  const totalTemplateValue = templateItemsData.reduce(
    (sum, item) => sum + item.total,
    0
  );

  // Table columns configuration
  const columns: TableColumn<TemplateItemView>[] = [
    {
      id: "itemName",
      header: "Item Name",
      accessor: "itemName",
      sortable: true,
      render: (value, row) => (
        <div>
          <span className="font-medium text-gray-900">{value}</span>
          {row.notes && (
            <p className="text-xs text-gray-500 mt-1 italic">
              Note: {row.notes}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "quantity",
      header: "Quantity",
      accessor: "quantity",
      sortable: true,
      render: (value, row) => (
        <div className="text-center">
          <span className="font-semibold text-gray-900">{value}</span>
          <p className="text-xs text-gray-500">{row.unit}</p>
        </div>
      ),
    },
    {
      id: "rate",
      header: "Rate (₹)",
      accessor: "rate",
      sortable: true,
      render: (value, row) => (
        <div className="text-right">
          <span className="font-medium text-gray-900">
            ₹{value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
          <p className="text-xs text-gray-500">per {row.unit}</p>
        </div>
      ),
    },
    {
      id: "total",
      header: "Total (₹)",
      accessor: "total",
      sortable: true,
      render: (value) => (
        <div className="text-right">
          <span className="font-semibold text-green-600 text-lg">
            ₹{value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>
      ),
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Template Details: ${template.name}`}
      size="2xl"
      custom_class="h-[90vh]"
    >
      <div className="h-full flex flex-col space-y-6">
        {/* Template Header Information */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Template Name & Category */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {template.name}
                </h3>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {template.category}
              </Badge>
              <p className="text-sm text-gray-600">
                Template ID: {template.id}
              </p>
            </div>

            {/* Items Count & Last Modified */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Template Info
                </span>
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">{template.itemsCount}</span> line
                items
              </p>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>
                  Modified:{" "}
                  {new Date(template.lastModified).toLocaleDateString("en-GB")}
                </span>
              </div>
            </div>

            {/* Total Value */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">
                  Estimated Value
                </span>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <p className="text-2xl font-bold text-green-600">
                  ₹
                  {totalTemplateValue.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-gray-500">Based on current rates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <Package className="h-5 w-5 mr-2 text-blue-600" />
              Template Items ({template.itemsCount})
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              Detailed breakdown of all items included in this template
            </p>
          </div>

          <div className="p-4 h-96">
            <DataTable
              data={templateItemsData}
              columns={columns}
              loading={false}
              emptyMessage="No items found in this template."
              searchable={false}
              sortable={true}
              filterable={false}
              pagination={templateItemsData.length > 10}
              pageSize={10}
              showActions={false}
            />
          </div>
        </div>

        {/* Footer Summary */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{template.itemsCount}</span> items •
              Last updated{" "}
              <span className="font-medium">
                {new Date(template.lastModified).toLocaleDateString("en-GB")}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Estimated Cost</p>
              <p className="text-xl font-bold text-green-600">
                ₹
                {totalTemplateValue.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TemplateViewModal;
