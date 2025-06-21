// lib/types.ts

// Base Types
export interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "user";
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  status: "completed" | "in-progress" | "pending";
  description?: string;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  clientAddress: string;
  projectAddress: string; // Add this - you're now collecting project site address
  phoneNumber: string; // Add this - required contact field
  email?: string; // Add this - optional contact field
  dateCreated: string;
  agreementDate: string;
  projectType: string;
  numberOfFloors: number;
  projectDuration: number;
  estimatedBudget: number;
  status:
    | "New"
    | "Under Construction"
    | "Completed"
    | "On Hold"
    | "Opportunity Lost";
  timeline: TimelineEvent[];
}
export interface LineItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  rate: number;
  description?: string;
  align?: string;
  hidden?:any;
}

export interface EstimationTemplateItem {
  id: string;
  lineItemId: string;
  quantity: number;
  notes?: string;
}

export interface EstimationTemplate {
  id: string;
  name: string;
  category: string;
  itemsCount: number;
  lastModified: string;
  items: EstimationTemplateItem[];
  clientName?: string;
  version?: number;
}

// New Project Estimation Types
export interface ProjectEstimationItem {
  id: string;
  lineItemId: string;
  quantity: number;
  rate: number;
  amount: number;
  notes?: string;
}

export interface ProjectEstimation {
  id: string;
  projectId: string;
  templateId: string;
  name: string;
  totalAmount: number;
  createdDate: string;
  updatedDate: string;
  isActive: boolean;
  version: number;
  items: ProjectEstimationItem[];
}

export interface Agreement {
  id: string;
  name: string;
  type: string;
  lastModified: string;
  templateContent: string;
}

// Form Data Types
export interface ProjectFormData {
  name: string;
  clientName: string;
  clientAddress: string;
  agreementDate: string;
  projectType: string;
  numberOfFloors: number;
  projectDuration: number;
  estimatedBudget: number;
  status: Project["status"];
  projectAddress: string;
  phoneNumber: string;
  email?: string; // Optional contact field
}

export interface LineItemFormData {
  name: string;
  unit: string;
  rate: number;
  description?: string;
}

export interface EstimationTemplateFormData {
  name: string;
  category: string;
  items: EstimationTemplateItem[];
}

// UI Component Types
export interface TableColumn<T> {
  hidden: any;
  id: string;
  header: string;
  accessor: keyof T | ((item: T) => any);
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  align?: "left" | "center" | "right";
}

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  badge?: number | string;
  disabled?: boolean;
}

// Badge Variants
export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "info";

// Button Variants
export type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

export type ButtonSize = "default" | "sm" | "lg" | "icon";

// Modal Sizes
export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

// Toast Types
export type ToastType = "success" | "error" | "info" | "warning";

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// Statistics Types
export interface ProjectStatistics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalValue: number;
  averageProjectDuration: number;
}

// Estimation Statistics
export interface EstimationStatistics {
  totalEstimations: number;
  totalValue: number;
  averageEstimationValue: number;
  mostUsedTemplate: string;
  recentEstimations: ProjectEstimation[];
}

// Filter and Search Types
export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface SearchFilters {
  query?: string;
  status?: Project["status"][];
  projectType?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  budgetRange?: {
    min: number;
    max: number;
  };
}

// Pagination Types
export interface PaginationOptions {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// Sort Types
export interface SortOption {
  field: string;
  direction: "asc" | "desc";
}

// Export Types for Hook Returns
export interface UseProjectsReturn {
  projects: Project[];
  isLoading: boolean;
  createProject: (data: ProjectFormData) => Promise<Project | null>;
  updateProject: (
    id: string,
    updates: Partial<Project>
  ) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export interface UseLineItemsReturn {
  lineItems: LineItem[];
  isLoading: boolean;
  createLineItem: (data: LineItemFormData) => Promise<LineItem | null>;
  updateLineItem: (
    id: string,
    updates: Partial<LineItem>
  ) => Promise<LineItem | null>;
  deleteLineItem: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export interface UseEstimationTemplatesReturn {
  templates: EstimationTemplate[];
  isLoading: boolean;
  createTemplate: (
    data: EstimationTemplateFormData
  ) => Promise<EstimationTemplate | null>;
  updateTemplate: (
    id: string,
    updates: Partial<EstimationTemplate>
  ) => Promise<EstimationTemplate | null>;
  deleteTemplate: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

// New Hook Return Types for Project Estimations
export interface UseProjectEstimationsReturn {
  estimations: ProjectEstimation[];
  isLoading: boolean;
  createFromTemplate: (
    projectId: string,
    templateId: string,
    name: string
  ) => Promise<ProjectEstimation | null>;
  updateItem: (
    estimationId: string,
    itemId: string,
    updates: Partial<ProjectEstimationItem>
  ) => Promise<ProjectEstimation | null>;
  deleteItem: (
    estimationId: string,
    itemId: string
  ) => Promise<ProjectEstimation | null>;
  setActive: (projectId: string, estimationId: string) => Promise<boolean>;
  duplicate: (
    estimationId: string,
    newName: string
  ) => Promise<ProjectEstimation | null>;
  deleteEstimation: (estimationId: string) => Promise<boolean>;
  refetch: (projectId: string) => Promise<void>;
}

// Component Props Types
export interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: ModalSize;
  className?: string;
}

export interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

// Form Validation Types
export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "number"
    | "email"
    | "password"
    | "textarea"
    | "select"
    | "date";
  rules?: ValidationRule;
  options?: { label: string; value: string }[];
  placeholder?: string;
  description?: string;
}

// Configuration Types
export interface AppConfig {
  companyName: string;
  currency: string;
  locale: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
}

// Audit Types for tracking changes
export interface AuditLog {
  id: string;
  entityType: "project" | "estimation" | "lineItem" | "template";
  entityId: string;
  action: "create" | "update" | "delete";
  changes: Record<string, { old: any; new: any }>;
  userId: string;
  timestamp: string;
  description?: string;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// Dashboard Widget Types
export interface DashboardWidget {
  id: string;
  title: string;
  type: "chart" | "stat" | "table" | "progress";
  data: any;
  config: Record<string, any>;
  position: { x: number; y: number; w: number; h: number };
}

// Report Types
export interface Report {
  id: string;
  name: string;
  type: "project" | "estimation" | "financial";
  parameters: Record<string, any>;
  schedule?: {
    frequency: "daily" | "weekly" | "monthly";
    recipients: string[];
  };
  lastGenerated?: string;
}

// Export Configuration
export interface ExportConfig {
  format: "pdf" | "excel" | "csv";
  includeCharts: boolean;
  includeDetails: boolean;
  template?: string;
}

// Theme Types
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

// Permission Types
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: "create" | "read" | "update" | "delete";
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

// Integration Types
export interface Integration {
  id: string;
  name: string;
  type: "accounting" | "crm" | "storage" | "communication";
  config: Record<string, any>;
  enabled: boolean;
  lastSync?: string;
}

// Backup Types
export interface BackupConfig {
  frequency: "daily" | "weekly" | "monthly";
  retention: number;
  location: "local" | "cloud";
  encryption: boolean;
}

// System Health Types
export interface SystemHealth {
  status: "healthy" | "warning" | "critical";
  checks: {
    database: boolean;
    storage: boolean;
    memory: number;
    cpu: number;
  };
  lastCheck: string;
}
