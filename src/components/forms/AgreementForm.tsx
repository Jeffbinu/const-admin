"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { Agreement } from "@/lib/types";
import { Save, X, Eye } from "lucide-react";

interface AgreementFormData {
  name: string;
  type: string;
  templateContent: string;
}

interface AgreementFormProps {
  onSubmit: (formData: AgreementFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Agreement;
  isLoading?: boolean;
}

function getDefaultTemplate(type: string): string {
  const templates = {
    Construction: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto;">
        <h1 style="text-align: center; color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
          CONSTRUCTION AGREEMENT
        </h1>
        
        <div style="margin: 30px 0;">
          <p><strong>Project Name:</strong> {{PROJECT_NAME}}</p>
          <p><strong>Client:</strong> {{CLIENT_NAME}}</p>
          <p><strong>Address:</strong> {{CLIENT_ADDRESS}}</p>
          <p><strong>Agreement Date:</strong> {{AGREEMENT_DATE}}</p>
          <p><strong>Project Type:</strong> {{PROJECT_TYPE}}</p>
          <p><strong>Number of Floors:</strong> {{NUMBER_OF_FLOORS}}</p>
          <p><strong>Project Duration:</strong> {{PROJECT_DURATION}} months</p>
          <p><strong>Estimated Budget:</strong> {{ESTIMATED_BUDGET}}</p>
        </div>

        <h2 style="color: #1e40af; margin-top: 30px;">Terms and Conditions</h2>
        <ol>
          <li>The contractor agrees to complete the construction work as per the specifications outlined in this agreement.</li>
          <li>Payment will be made in installments as per the agreed schedule.</li>
          <li>Any changes to the original plan must be approved by both parties in writing.</li>
          <li>The project will be completed within {{PROJECT_DURATION}} months from the commencement date.</li>
          <li>All materials used will be of standard quality and as per approved specifications.</li>
          <li>The contractor will obtain all necessary permits and approvals.</li>
        </ol>

        <h2 style="color: #1e40af; margin-top: 30px;">Work Estimation Details</h2>
        <div>
          {{ESTIMATION_TABLE}}
        </div>

        <h2 style="color: #1e40af; margin-top: 30px;">Payment Terms</h2>
        <ul>
          <li>20% advance payment upon signing this agreement</li>
          <li>30% upon completion of foundation work</li>
          <li>30% upon completion of structure</li>
          <li>20% upon final completion and handover</li>
        </ul>

        <div style="margin-top: 60px; display: flex; justify-content: space-between;">
          <div style="text-align: center; width: 45%;">
            <div style="border-top: 1px solid #333; padding-top: 10px; margin-top: 40px;">
              <p><strong>Contractor</strong></p>
              <p>Omega Builders</p>
              <p>Date: ___________</p>
            </div>
          </div>
          <div style="text-align: center; width: 45%;">
            <div style="border-top: 1px solid #333; padding-top: 10px; margin-top: 40px;">
              <p><strong>Client</strong></p>
              <p>{{CLIENT_NAME}}</p>
              <p>Date: ___________</p>
            </div>
          </div>
        </div>
      </div>
    `,
    Renovation: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto;">
        <h1 style="text-align: center; color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
          RENOVATION CONTRACT
        </h1>
        
        <div style="margin: 30px 0;">
          <p><strong>Project:</strong> {{PROJECT_NAME}}</p>
          <p><strong>Client:</strong> {{CLIENT_NAME}}</p>
          <p><strong>Property Address:</strong> {{CLIENT_ADDRESS}}</p>
          <p><strong>Agreement Date:</strong> {{AGREEMENT_DATE}}</p>
        </div>

        <h2 style="color: #1e40af; margin-top: 30px;">Renovation Details</h2>
        <p>This contract covers the renovation of {{NUMBER_OF_FLOORS}} floors as specified.</p>
        <p><strong>Estimated Duration:</strong> {{PROJECT_DURATION}} months</p>
        <p><strong>Budget:</strong> {{ESTIMATED_BUDGET}}</p>

        <h2 style="color: #1e40af; margin-top: 30px;">Work Estimation</h2>
        <div>
          {{ESTIMATION_TABLE}}
        </div>

        <h2 style="color: #1e40af; margin-top: 30px;">Renovation Terms</h2>
        <ol>
          <li>All existing structures will be carefully assessed before renovation begins.</li>
          <li>Client will be notified of any additional work required during renovation.</li>
          <li>All debris and waste materials will be properly disposed of.</li>
          <li>Work will be completed in phases to minimize disruption.</li>
        </ol>
      </div>
    `,
    Interior: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto;">
        <h1 style="text-align: center; color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
          INTERIOR DESIGN AGREEMENT
        </h1>
        
        <div style="margin: 30px 0;">
          <p><strong>Project:</strong> {{PROJECT_NAME}}</p>
          <p><strong>Client:</strong> {{CLIENT_NAME}}</p>
          <p><strong>Address:</strong> {{CLIENT_ADDRESS}}</p>
        </div>

        <h2 style="color: #1e40af; margin-top: 30px;">Interior Work Scope</h2>
        <p>Complete interior design and execution for the specified property.</p>
        <p><strong>Duration:</strong> {{PROJECT_DURATION}} months</p>
        <p><strong>Budget:</strong> {{ESTIMATED_BUDGET}}</p>

        <div>
          {{ESTIMATION_TABLE}}
        </div>
      </div>
    `,
    Maintenance: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto;">
        <h1 style="text-align: center; color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
          MAINTENANCE CONTRACT
        </h1>
        
        <div style="margin: 30px 0;">
          <p><strong>Property:</strong> {{PROJECT_NAME}}</p>
          <p><strong>Client:</strong> {{CLIENT_NAME}}</p>
          <p><strong>Address:</strong> {{CLIENT_ADDRESS}}</p>
        </div>

        <h2 style="color: #1e40af; margin-top: 30px;">Maintenance Details</h2>
        <p>Regular maintenance services for the specified property.</p>
        <p><strong>Contract Duration:</strong> {{PROJECT_DURATION}} months</p>
        <p><strong>Monthly Cost:</strong> {{ESTIMATED_BUDGET}}</p>

        <div>
          {{ESTIMATION_TABLE}}
        </div>
      </div>
    `,
    Custom: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto;">
        <h1 style="text-align: center; color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
          {{PROJECT_NAME}} AGREEMENT
        </h1>
        
        <div style="margin: 30px 0;">
          <p><strong>Client:</strong> {{CLIENT_NAME}}</p>
          <p><strong>Address:</strong> {{CLIENT_ADDRESS}}</p>
          <p><strong>Date:</strong> {{AGREEMENT_DATE}}</p>
        </div>

        <p>Add your custom agreement content here...</p>

        <div>
          {{ESTIMATION_TABLE}}
        </div>
      </div>
    `,
  };

  return templates[type as keyof typeof templates] || templates.Custom;
}
