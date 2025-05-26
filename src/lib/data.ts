// lib/data.ts
import {
  Project,
  LineItem,
  EstimationTemplate,
  Agreement,
  User,
  TimelineEvent,
  EstimationTemplateItem,
  ProjectEstimation,
  ProjectEstimationItem,
} from "./types";

// Mock data for development - Replace with Supabase calls in production
export const mockUser: User = {
  id: "1",
  username: "admin",
  email: "admin@omegabuilders.com",
  role: "admin",
};

export const mockProjects: Project[] = [
  {
    id: "PRJ001",
    name: "Riverside Residences",
    clientName: "Rahul Sharma",
    clientAddress: "123 River View Road, Mumbai",
    dateCreated: "2025-03-15",
    agreementDate: "2025-03-20",
    projectType: "Residential",
    numberOfFloors: 3,
    projectDuration: 8,
    estimatedBudget: 4500000,
    status: "Under Construction",
    timeline: [
      {
        id: "t1",
        title: "Project Created",
        date: "2025-03-15",
        status: "completed",
        description: "Initial project setup and documentation",
      },
      {
        id: "t2",
        title: "Agreement Signed",
        date: "2025-03-20",
        status: "completed",
        description: "Contract finalized with client",
      },
      {
        id: "t3",
        title: "Foundation Work",
        date: "2025-04-01",
        status: "in-progress",
        description: "Foundation and basement construction",
      },
    ],
    projectAddress: "",
    phoneNumber: ""
  },
  {
    id: "PRJ002",
    name: "Greenfield Mall",
    clientName: "Metro Developers",
    clientAddress: "456 Business Park, Chennai",
    dateCreated: "2025-02-10",
    agreementDate: "2025-02-15",
    projectType: "Commercial",
    numberOfFloors: 4,
    projectDuration: 12,
    estimatedBudget: 8500000,
    status: "Opportunity",
    timeline: [
      {
        id: "t4",
        title: "Project Created",
        date: "2025-02-10",
        status: "completed",
      },
    ],
    projectAddress: "",
    phoneNumber: ""
  },
  {
    id: "PRJ003",
    name: "Sunset Apartments Renovation",
    clientName: "Housing Society Ltd",
    clientAddress: "789 Sunset Avenue, Bangalore",
    dateCreated: "2025-01-05",
    agreementDate: "2025-01-10",
    projectType: "Renovation",
    numberOfFloors: 5,
    projectDuration: 6,
    estimatedBudget: 2500000,
    status: "Completed",
    timeline: [
      {
        id: "t5",
        title: "Project Created",
        date: "2025-01-05",
        status: "completed",
      },
      {
        id: "t6",
        title: "Agreement Signed",
        date: "2025-01-10",
        status: "completed",
      },
      {
        id: "t7",
        title: "Project Completed",
        date: "2025-04-15",
        status: "completed",
      },
    ],
    projectAddress: "",
    phoneNumber: ""
  },
  {
    id: "PRJ004",
    name: "Tech Park Office Building",
    clientName: "TechCorp Solutions",
    clientAddress: "321 IT Park, Hyderabad",
    dateCreated: "2025-04-01",
    agreementDate: "2025-04-05",
    projectType: "New Construction",
    numberOfFloors: 6,
    projectDuration: 10,
    estimatedBudget: 6500000,
    status: "New",
    timeline: [
      {
        id: "t8",
        title: "Project Created",
        date: "2025-04-01",
        status: "completed",
      },
    ],
    projectAddress: "",
    phoneNumber: ""
  },
];

export const mockLineItems: LineItem[] = [
  {
    id: "LI001",
    name: "Cement (OPC 53 Grade)",
    category: "Building Materials",
    unit: "Bag",
    rate: 350,
    description: "High quality cement for construction",
  },
  {
    id: "LI002",
    name: "Bricks (Red Clay)",
    category: "Building Materials",
    unit: "Piece",
    rate: 8,
    description: "Standard red clay bricks",
  },
  {
    id: "LI003",
    name: "Sand (River)",
    category: "Building Materials",
    unit: "Cubic Meter",
    rate: 1800,
    description: "River sand for construction",
  },
  {
    id: "LI004",
    name: "Steel Reinforcement (TMT Bars)",
    category: "Building Materials",
    unit: "Kg",
    rate: 65,
    description: "TMT bars for reinforcement",
  },
  {
    id: "LI005",
    name: "Mason Labor",
    category: "Labor",
    unit: "Day",
    rate: 800,
    description: "Skilled mason work",
  },
  {
    id: "LI006",
    name: "Helper Labor",
    category: "Labor",
    unit: "Day",
    rate: 500,
    description: "General helper labor",
  },
  {
    id: "LI007",
    name: "Concrete (M20)",
    category: "Building Materials",
    unit: "Cubic Meter",
    rate: 4500,
    description: "Ready mix concrete M20 grade",
  },
  {
    id: "LI008",
    name: "Plaster of Paris",
    category: "Building Materials",
    unit: "Bag",
    rate: 280,
    description: "High quality plaster for finishing",
  },
];

export const mockEstimationTemplates: EstimationTemplate[] = [
  {
    id: "ET001",
    name: "Standard House Construction",
    category: "Residential",
    itemsCount: 6,
    lastModified: "2025-04-15",
    items: [
      {
        id: "eti1",
        lineItemId: "LI001",
        quantity: 100,
        notes: "For foundation and structure",
      },
      {
        id: "eti2",
        lineItemId: "LI002",
        quantity: 5000,
        notes: "Wall construction",
      },
      {
        id: "eti3",
        lineItemId: "LI003",
        quantity: 20,
        notes: "Mortar and concrete",
      },
      {
        id: "eti4",
        lineItemId: "LI004",
        quantity: 2000,
        notes: "Structural reinforcement",
      },
      {
        id: "eti5",
        lineItemId: "LI005",
        quantity: 30,
        notes: "Masonry work",
      },
      {
        id: "eti6",
        lineItemId: "LI007",
        quantity: 15,
        notes: "Foundation concrete",
      },
    ],
  },
  {
    id: "ET002",
    name: "Commercial Office Space",
    category: "Commercial",
    itemsCount: 4,
    lastModified: "2025-04-20",
    items: [
      {
        id: "eti7",
        lineItemId: "LI001",
        quantity: 200,
        notes: "Heavy construction",
      },
      {
        id: "eti8",
        lineItemId: "LI004",
        quantity: 5000,
        notes: "Commercial grade steel",
      },
      {
        id: "eti9",
        lineItemId: "LI005",
        quantity: 60,
        notes: "Skilled labor for commercial work",
      },
      {
        id: "eti10",
        lineItemId: "LI007",
        quantity: 50,
        notes: "Commercial grade concrete",
      },
    ],
  },
  {
    id: "ET003",
    name: "Bathroom Renovation",
    category: "Renovation",
    itemsCount: 3,
    lastModified: "2025-05-01",
    items: [
      {
        id: "eti11",
        lineItemId: "LI002",
        quantity: 200,
        notes: "Wall tiles and structure",
      },
      {
        id: "eti12",
        lineItemId: "LI005",
        quantity: 5,
        notes: "Tile work and plumbing",
      },
      {
        id: "eti13",
        lineItemId: "LI008",
        quantity: 10,
        notes: "Wall finishing",
      },
    ],
  },
];

// Mock Project Estimations Data
export const mockProjectEstimations: ProjectEstimation[] = [
  {
    id: "PE001",
    projectId: "PRJ001",
    templateId: "ET001",
    name: "Standard House Construction - Version 1",
    totalAmount: 4500000,
    createdDate: "2025-03-15",
    updatedDate: "2025-04-20",
    isActive: true,
    version: 1,
    items: [
      {
        id: "PEI001",
        lineItemId: "LI001",
        quantity: 100,
        rate: 350,
        amount: 35000,
        notes: "High quality cement for foundation"
      },
      {
        id: "PEI002",
        lineItemId: "LI002",
        quantity: 5000,
        rate: 8,
        amount: 40000,
        notes: "Red clay bricks for wall construction"
      },
      {
        id: "PEI003",
        lineItemId: "LI003",
        quantity: 20,
        rate: 1800,
        amount: 36000,
        notes: "River sand for concrete mix"
      },
      {
        id: "PEI004",
        lineItemId: "LI004",
        quantity: 2000,
        rate: 65,
        amount: 130000,
        notes: "TMT bars for structural reinforcement"
      },
      {
        id: "PEI005",
        lineItemId: "LI005",
        quantity: 30,
        rate: 800,
        amount: 24000,
        notes: "Skilled mason work"
      },
      {
        id: "PEI006",
        lineItemId: "LI007",
        quantity: 15,
        rate: 4500,
        amount: 67500,
        notes: "Foundation concrete work"
      }
    ]
  }
];

export const mockAgreements: Agreement[] = [
  {
    id: "AG001",
    name: "Standard Construction Agreement",
    type: "Construction",
    lastModified: "2025-03-10",
    templateContent: `
      <div class="agreement-template">
        <h1>CONSTRUCTION AGREEMENT</h1>
        <p><strong>Project:</strong> {{PROJECT_NAME}}</p>
        <p><strong>Client:</strong> {{CLIENT_NAME}}</p>
        <p><strong>Address:</strong> {{CLIENT_ADDRESS}}</p>
        <p><strong>Project Duration:</strong> {{PROJECT_DURATION}} months</p>
        <p><strong>Estimated Budget:</strong> ₹{{ESTIMATED_BUDGET}}</p>
        
        <h2>Terms and Conditions</h2>
        <ol>
          <li>The contractor agrees to complete the construction work as per specifications.</li>
          <li>Payment will be made in installments as per the agreed schedule.</li>
          <li>Any changes to the original plan must be approved by both parties.</li>
          <li>The project will be completed within {{PROJECT_DURATION}} months from the start date.</li>
        </ol>
        
        <h2>Work Estimation</h2>
        <div id="estimation-table">
          {{ESTIMATION_TABLE}}
        </div>
        
        <div class="signatures">
          <div class="contractor-signature">
            <p>Contractor: Omega Builders</p>
            <p>Date: {{AGREEMENT_DATE}}</p>
          </div>
          <div class="client-signature">
            <p>Client: {{CLIENT_NAME}}</p>
            <p>Date: {{AGREEMENT_DATE}}</p>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: "AG002",
    name: "Renovation Contract",
    type: "Renovation",
    lastModified: "2025-04-05",
    templateContent: `
      <div class="agreement-template">
        <h1>RENOVATION CONTRACT</h1>
        <p><strong>Project:</strong> {{PROJECT_NAME}}</p>
        <p><strong>Client:</strong> {{CLIENT_NAME}}</p>
        <p><strong>Property Address:</strong> {{CLIENT_ADDRESS}}</p>
        
        <h2>Renovation Details</h2>
        <p>This contract covers the renovation of {{NUMBER_OF_FLOORS}} floors.</p>
        <p><strong>Estimated Duration:</strong> {{PROJECT_DURATION}} months</p>
        <p><strong>Budget:</strong> ₹{{ESTIMATED_BUDGET}}</p>
        
        <div id="estimation-table">
          {{ESTIMATION_TABLE}}
        </div>
      </div>
    `,
  },
  {
    id: "AG003",
    name: "Interior Design Agreement",
    type: "Interior",
    lastModified: "2025-05-12",
    templateContent: `
      <div class="agreement-template">
        <h1>INTERIOR DESIGN AGREEMENT</h1>
        <p><strong>Project:</strong> {{PROJECT_NAME}}</p>
        <p><strong>Client:</strong> {{CLIENT_NAME}}</p>
        
        <h2>Interior Work Scope</h2>
        <p>Complete interior design and execution for the specified property.</p>
        
        <div id="estimation-table">
          {{ESTIMATION_TABLE}}
        </div>
      </div>
    `,
  },
];

// Data management functions (to be replaced with Supabase calls)
export const dataManager = {
  // Authentication
  async authenticate(username: string, password: string): Promise<User | null> {
    // Hardcoded login for development
    if (username === "admin" && password === "admin") {
      return mockUser;
    }
    return null;
  },

  async getAllProjects(): Promise<Project[]> {
    return [...mockProjects];
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    return [...mockProjects];
  },

  async getProject(id: string): Promise<Project | null> {
    return mockProjects.find((p) => p.id === id) || null;
  },

  async createProject(
    projectData: Omit<Project, "id" | "dateCreated" | "timeline">
  ): Promise<Project> {
    const newProject: Project = {
      ...projectData,
      id: `PRJ${String(mockProjects.length + 1).padStart(3, "0")}`,
      dateCreated: new Date().toISOString().split("T")[0],
      timeline: [
        {
          id: `t${Date.now()}`,
          title: "Project Created",
          date: new Date().toISOString().split("T")[0],
          status: "completed",
          description: "Project initialized in the system",
        },
      ],
    };
    mockProjects.push(newProject);
    return newProject;
  },

  async updateProject(
    id: string,
    updates: Partial<Project>
  ): Promise<Project | null> {
    const index = mockProjects.findIndex((p) => p.id === id);
    if (index === -1) return null;

    mockProjects[index] = { ...mockProjects[index], ...updates };
    return mockProjects[index];
  },

  async deleteProject(id: string): Promise<boolean> {
    const index = mockProjects.findIndex((p) => p.id === id);
    if (index === -1) return false;

    mockProjects.splice(index, 1);
    // Also remove related estimations
    const estimationIndexes = mockProjectEstimations
      .map((est, idx) => est.projectId === id ? idx : -1)
      .filter(idx => idx !== -1)
      .sort((a, b) => b - a); // Sort in descending order to avoid index issues
    
    estimationIndexes.forEach(idx => mockProjectEstimations.splice(idx, 1));
    return true;
  },

  // Line Items
  async getLineItems(): Promise<LineItem[]> {
    return [...mockLineItems];
  },

  async createLineItem(itemData: Omit<LineItem, "id">): Promise<LineItem> {
    const newItem: LineItem = {
      ...itemData,
      id: `LI${String(mockLineItems.length + 1).padStart(3, "0")}`,
    };
    mockLineItems.push(newItem);
    return newItem;
  },

  async updateLineItem(
    id: string,
    updates: Partial<LineItem>
  ): Promise<LineItem | null> {
    const index = mockLineItems.findIndex((item) => item.id === id);
    if (index === -1) return null;

    mockLineItems[index] = { ...mockLineItems[index], ...updates };
    return mockLineItems[index];
  },

  async deleteLineItem(id: string): Promise<boolean> {
    const index = mockLineItems.findIndex((item) => item.id === id);
    if (index === -1) return false;

    mockLineItems.splice(index, 1);
    return true;
  },

  // Estimation Templates
  async getEstimationTemplates(): Promise<EstimationTemplate[]> {
    return [...mockEstimationTemplates];
  },

  async createEstimationTemplate(
    templateData: Omit<EstimationTemplate, "id" | "lastModified" | "itemsCount">
  ): Promise<EstimationTemplate> {
    const newTemplate: EstimationTemplate = {
      ...templateData,
      id: `ET${String(mockEstimationTemplates.length + 1).padStart(3, "0")}`,
      itemsCount: templateData.items.length,
      lastModified: new Date().toISOString().split("T")[0],
    };
    mockEstimationTemplates.push(newTemplate);
    return newTemplate;
  },

  async updateEstimationTemplate(
    id: string,
    updates: Partial<EstimationTemplate>
  ): Promise<EstimationTemplate | null> {
    const index = mockEstimationTemplates.findIndex(
      (template) => template.id === id
    );
    if (index === -1) return null;

    const updatedTemplate = {
      ...mockEstimationTemplates[index],
      ...updates,
      lastModified: new Date().toISOString().split("T")[0],
      itemsCount: updates.items
        ? updates.items.length
        : mockEstimationTemplates[index].itemsCount,
    };

    mockEstimationTemplates[index] = updatedTemplate;
    return updatedTemplate;
  },

  async deleteEstimationTemplate(id: string): Promise<boolean> {
    const index = mockEstimationTemplates.findIndex(
      (template) => template.id === id
    );
    if (index === -1) return false;

    mockEstimationTemplates.splice(index, 1);
    return true;
  },

  // Project Estimations - NEW METHODS
  async getProjectEstimations(projectId: string): Promise<ProjectEstimation[]> {
    return mockProjectEstimations
      .filter(est => est.projectId === projectId)
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
  },

  async createProjectEstimationFromTemplate(
    projectId: string,
    templateId: string,
    name: string
  ): Promise<ProjectEstimation> {
    const template = mockEstimationTemplates.find(t => t.id === templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Get existing estimations for this project to determine version
    const existingEstimations = mockProjectEstimations.filter(est => est.projectId === projectId);
    const nextVersion = Math.max(...existingEstimations.map(est => est.version || 1), 0) + 1;

    // Set all existing estimations as inactive
    mockProjectEstimations.forEach(est => {
      if (est.projectId === projectId) {
        est.isActive = false;
      }
    });

    // Create estimation items from template
    const estimationItems: ProjectEstimationItem[] = template.items.map((templateItem, index) => {
      const lineItem = mockLineItems.find(li => li.id === templateItem.lineItemId);
      const rate = lineItem?.rate || 0;
      const amount = templateItem.quantity * rate;

      return {
        id: `PEI${Date.now()}_${index}`,
        lineItemId: templateItem.lineItemId,
        quantity: templateItem.quantity,
        rate: rate,
        amount: amount,
        notes: templateItem.notes || ""
      };
    });

    const totalAmount = estimationItems.reduce((sum, item) => sum + item.amount, 0);

    const newEstimation: ProjectEstimation = {
      id: `PE${String(mockProjectEstimations.length + 1).padStart(3, "0")}`,
      projectId,
      templateId,
      name,
      totalAmount,
      createdDate: new Date().toISOString().split("T")[0],
      updatedDate: new Date().toISOString().split("T")[0],
      isActive: true,
      version: nextVersion,
      items: estimationItems
    };

    mockProjectEstimations.push(newEstimation);
    return newEstimation;
  },

  async updateProjectEstimationItem(
    estimationId: string,
    itemId: string,
    updates: Partial<ProjectEstimationItem>
  ): Promise<ProjectEstimation> {
    const estimationIndex = mockProjectEstimations.findIndex(est => est.id === estimationId);
    if (estimationIndex === -1) {
      throw new Error("Estimation not found");
    }

    const estimation = mockProjectEstimations[estimationIndex];
    const itemIndex = estimation.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      throw new Error("Estimation item not found");
    }

    // Update the item
    estimation.items[itemIndex] = { ...estimation.items[itemIndex], ...updates };

    // Recalculate total amount
    estimation.totalAmount = estimation.items.reduce((sum, item) => sum + item.amount, 0);
    estimation.updatedDate = new Date().toISOString().split("T")[0];

    return estimation;
  },

  async deleteProjectEstimationItem(
    estimationId: string,
    itemId: string
  ): Promise<ProjectEstimation> {
    const estimationIndex = mockProjectEstimations.findIndex(est => est.id === estimationId);
    if (estimationIndex === -1) {
      throw new Error("Estimation not found");
    }

    const estimation = mockProjectEstimations[estimationIndex];
    const itemIndex = estimation.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      throw new Error("Estimation item not found");
    }

    // Remove the item
    estimation.items.splice(itemIndex, 1);

    // Recalculate total amount
    estimation.totalAmount = estimation.items.reduce((sum, item) => sum + item.amount, 0);
    estimation.updatedDate = new Date().toISOString().split("T")[0];

    return estimation;
  },

  async setActiveProjectEstimation(projectId: string, estimationId: string): Promise<boolean> {
    const projectEstimations = mockProjectEstimations.filter(est => est.projectId === projectId);
    
    // Set all estimations for this project as inactive
    projectEstimations.forEach(est => {
      est.isActive = false;
    });

    // Set the specified estimation as active
    const targetEstimation = mockProjectEstimations.find(est => est.id === estimationId);
    if (targetEstimation) {
      targetEstimation.isActive = true;
      return true;
    }

    return false;
  },

  async duplicateProjectEstimation(
    estimationId: string,
    newName: string
  ): Promise<ProjectEstimation> {
    const originalEstimation = mockProjectEstimations.find(est => est.id === estimationId);
    if (!originalEstimation) {
      throw new Error("Estimation not found");
    }

    // Get existing estimations for this project to determine version
    const existingEstimations = mockProjectEstimations.filter(est => est.projectId === originalEstimation.projectId);
    const nextVersion = Math.max(...existingEstimations.map(est => est.version || 1), 0) + 1;

    // Set all existing estimations as inactive
    mockProjectEstimations.forEach(est => {
      if (est.projectId === originalEstimation.projectId) {
        est.isActive = false;
      }
    });

    // Create new estimation items with new IDs
    const newItems: ProjectEstimationItem[] = originalEstimation.items.map((item, index) => ({
      ...item,
      id: `PEI${Date.now()}_${index}`
    }));

    const newEstimation: ProjectEstimation = {
      id: `PE${String(mockProjectEstimations.length + 1).padStart(3, "0")}`,
      projectId: originalEstimation.projectId,
      templateId: originalEstimation.templateId,
      name: newName,
      totalAmount: originalEstimation.totalAmount,
      createdDate: new Date().toISOString().split("T")[0],
      updatedDate: new Date().toISOString().split("T")[0],
      isActive: true,
      version: nextVersion,
      items: newItems
    };

    mockProjectEstimations.push(newEstimation);
    return newEstimation;
  },

  async deleteProjectEstimation(estimationId: string): Promise<boolean> {
    const index = mockProjectEstimations.findIndex(est => est.id === estimationId);
    if (index === -1) return false;

    const estimation = mockProjectEstimations[index];
    mockProjectEstimations.splice(index, 1);

    // If this was the active estimation, make the most recent one active
    if (estimation.isActive) {
      const remainingEstimations = mockProjectEstimations
        .filter(est => est.projectId === estimation.projectId)
        .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
      
      if (remainingEstimations.length > 0) {
        remainingEstimations[0].isActive = true;
      }
    }

    return true;
  },

  // Agreements
  async getAgreements(): Promise<Agreement[]> {
    return [...mockAgreements];
  },

  async updateAgreement(
    id: string,
    updates: Partial<Agreement>
  ): Promise<Agreement | null> {
    const index = mockAgreements.findIndex((agreement) => agreement.id === id);
    if (index === -1) return null;

    const updatedAgreement = {
      ...mockAgreements[index],
      ...updates,
      lastModified: new Date().toISOString().split("T")[0],
    };

    mockAgreements[index] = updatedAgreement;
    return updatedAgreement;
  },

  async deleteAgreement(id: string): Promise<boolean> {
    const index = mockAgreements.findIndex((agreement) => agreement.id === id);
    if (index === -1) return false;

    mockAgreements.splice(index, 1);
    return true;
  },

  async generateProjectAgreement(
    projectId: string,
    agreementId: string
  ): Promise<string> {
    const project = await this.getProject(projectId);
    const agreement = mockAgreements.find((a) => a.id === agreementId);

    if (!project || !agreement) {
      throw new Error("Project or agreement not found");
    }

    // Get the active estimation for this project
    const activeEstimation = mockProjectEstimations.find(
      est => est.projectId === projectId && est.isActive
    );

    // Replace template variables with project data
    let content = agreement.templateContent;
    content = content.replace(/{{PROJECT_NAME}}/g, project.name);
    content = content.replace(/{{CLIENT_NAME}}/g, project.clientName);
    content = content.replace(/{{CLIENT_ADDRESS}}/g, project.clientAddress);
    content = content.replace(
      /{{PROJECT_DURATION}}/g,
      project.projectDuration.toString()
    );
    content = content.replace(
      /{{ESTIMATED_BUDGET}}/g,
      (activeEstimation?.totalAmount || project.estimatedBudget).toLocaleString("en-IN")
    );
    content = content.replace(/{{AGREEMENT_DATE}}/g, project.agreementDate);
    content = content.replace(
      /{{NUMBER_OF_FLOORS}}/g,
      project.numberOfFloors.toString()
    );

    // Add detailed estimation table if active estimation exists
    let estimationTable = "";
    if (activeEstimation) {
      estimationTable = `
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Item</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">Quantity</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">Unit</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">Rate (₹)</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>`;

      activeEstimation.items.forEach(item => {
        const lineItem = mockLineItems.find(li => li.id === item.lineItemId);
        estimationTable += `
            <tr>
              <td style="border: 1px solid #d1d5db; padding: 8px;">
                ${lineItem?.name || 'Unknown Item'}
                ${item.notes ? `<br><small style="color: #666;">${item.notes}</small>` : ''}
              </td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${item.quantity}</td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${lineItem?.unit || '-'}</td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">${item.rate.toLocaleString('en-IN')}</td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">${item.amount.toLocaleString('en-IN')}</td>
            </tr>`;
      });

      estimationTable += `
            <tr style="background-color: #f9fafb; font-weight: bold;">
              <td style="border: 1px solid #d1d5db; padding: 8px;" colspan="4">Total Amount</td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">₹${activeEstimation.totalAmount.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>`;
    } else {
      // Fallback to simple estimation table
      estimationTable = `
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Item</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">Quantity</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">Rate (₹)</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #d1d5db; padding: 8px;">Construction Materials</td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">1</td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">${(
                project.estimatedBudget * 0.6
              ).toLocaleString("en-IN")}</td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">${(
                project.estimatedBudget * 0.6
              ).toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #d1d5db; padding: 8px;">Labor Charges</td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">1</td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">${(
                project.estimatedBudget * 0.3
              ).toLocaleString("en-IN")}</td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">${(
                project.estimatedBudget * 0.3
              ).toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #d1d5db; padding: 8px;">Other Expenses</td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">1</td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">${(
                project.estimatedBudget * 0.1
              ).toLocaleString("en-IN")}</td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">${(
                project.estimatedBudget * 0.1
              ).toLocaleString("en-IN")}</td>
            </tr>
            <tr style="background-color: #f9fafb; font-weight: bold;">
              <td style="border: 1px solid #d1d5db; padding: 8px;" colspan="3">Total Amount</td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">₹${project.estimatedBudget.toLocaleString(
                "en-IN"
              )}</td>
            </tr>
          </tbody>
        </table>`;
    }

    content = content.replace(/{{ESTIMATION_TABLE}}/g, estimationTable);

    return content;
  },
};