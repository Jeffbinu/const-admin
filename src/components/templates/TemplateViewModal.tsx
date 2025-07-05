"use client";
import React, { useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { EstimationTemplate, LineItem } from "@/lib/types";
import { Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
  const tableRef = useRef<HTMLDivElement>(null);

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

  const numberToWords = (num: number): string => {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    if (num === 0) return "Zero";

    const crores = Math.floor(num / 10000000);
    const lakhs = Math.floor((num % 10000000) / 100000);
    const thousands = Math.floor((num % 100000) / 1000);
    const hundreds = Math.floor((num % 1000) / 100);
    const remainder = num % 100;

    let result = "";

    if (crores > 0) {
      result += numberToWords(crores) + " Crore ";
    }
    if (lakhs > 0) {
      result += numberToWords(lakhs) + " Lakh ";
    }
    if (thousands > 0) {
      result += numberToWords(thousands) + " Thousand ";
    }
    if (hundreds > 0) {
      result += ones[hundreds] + " Hundred ";
    }

    if (remainder >= 20) {
      result += tens[Math.floor(remainder / 10)];
      if (remainder % 10 > 0) {
        result += " " + ones[remainder % 10];
      }
    } else if (remainder > 0) {
      result += ones[remainder];
    }

    return result.trim() + " Only";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Preview Estimation `}
      size="2xl"
      custom_class="h-[95vh]"
    >
      <div className="h-full flex flex-col space-y-4">
        {/* Estimation Table */}
        <div className="flex-1 overflow-auto">
          <div ref={tableRef} className="bg-white p-6 min-h-full">
            {/* Table Header */}
            <div className="border-2 border-b-none">
              <div className="bg-white text-center py-2 flex items-center justify-center">
                <h2 className=" text-xl font-bold items-center justify-center">
                  ESTIMATION
                </h2>
              </div>
              <div className="grid grid-cols-2 border-t-2 border-black">
                <div className="border-r border-black p-2 text-center font-semibold">
                  Client
                </div>
                <div className="p-2 text-center font-semibold">
                  {template.clientName}
                </div>
              </div>
              <div className=" text-center py-2 border-t-2  border-black">
                <h3 className="text-lg font-bold">ESTIMATED COST</h3>
              </div>
            </div>

            {/* Table Content */}
            <div className="border-2 border-t-0 border-black">
              {/* Table Headers */}
              <div className="grid grid-cols-12 bg-gray-100 border-b-2 border-black">
                <div className="col-span-1 border-r border-black p-2 text-center font-bold">
                  SN
                </div>
                <div className="col-span-6 border-r border-black p-2 text-center font-bold">
                  ESTIMATION
                </div>
                <div className="col-span-1 border-r border-black p-2 text-center font-bold">
                  UNIT
                </div>
                <div className="col-span-2 border-r border-black p-2 text-center font-bold">
                  U.PRICE
                </div>
                <div className="col-span-2 p-2 text-center font-bold">
                  AMOUNT
                </div>
              </div>

              {/* Table Rows */}
              {templateItemsData.map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 border-b border-black"
                >
                  <div className="col-span-1 border-r border-black p-2 text-center">
                    {index + 1}
                  </div>
                  <div className="col-span-6 border-r border-black p-2">
                    <div className="font-medium">{item.itemName}</div>
                  </div>
                  <div className="col-span-1 border-r border-black p-2 text-center">
                    {item.quantity}
                  </div>
                  <div className="col-span-2 border-r border-black p-2 text-right">
                    {item.rate.toLocaleString("en-IN")}
                  </div>
                  <div className="col-span-2 p-2 text-right font-medium">
                    {item.total.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
              ))}

              {/* Total Row */}
              <div className="grid grid-cols-12 border-t-2 border-black bg-gray-50">
                <div className="col-span-10 border-r border-black p-3 text-right font-bold text-lg">
                  Amount
                </div>
                <div className="col-span-2 p-3 text-right font-bold text-lg">
                  {totalTemplateValue.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </div>
              </div>

              {/* Amount in Words */}
              <div className="border-t border-black p-3 text-center font-medium bg-gray-50">
                <span className="font-bold">Rupees </span>
                {numberToWords(Math.floor(totalTemplateValue))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TemplateViewModal;
