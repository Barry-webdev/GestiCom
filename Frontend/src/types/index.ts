// Product types
export interface Product {
  _id?: string;
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  buyPrice: number;
  sellPrice: number;
  threshold: number;
  supplier: string;
  status: "ok" | "low" | "out";
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Client types
export interface Client {
  id: number;
  name: string;
  phone: string;
  address: string;
  email?: string;
  totalPurchases: number;
  lastPurchase: string;
  status: "active" | "inactive" | "vip";
}

// Supplier types
export interface Supplier {
  id: number;
  name: string;
  phone: string;
  address: string;
  email?: string;
  contact: string;
  products: number;
  lastDelivery: string;
  totalValue: number;
  status: "active" | "inactive";
}

// Sale types
export interface Sale {
  id: string;
  date: string;
  time?: string;
  client: string;
  products: number;
  total: number;
  status: "completed" | "pending" | "cancelled";
  payment: string;
  items?: SaleItem[];
  user?: string;
  notes?: string;
}

export interface SaleItem {
  id: number | string;
  product: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

// Stock Movement types
export interface StockMovement {
  id: number;
  date: string;
  time: string;
  type: "entry" | "exit";
  product: string;
  quantity: number;
  unit: string;
  reason: string;
  user: string;
  comment?: string;
}

// User types
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "gestionnaire" | "vendeur" | "lecteur";
  status: "active" | "inactive";
  createdAt: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalStock: number;
  stockValue: number;
  dailySales: number;
  monthlyRevenue: number;
  activeClients: number;
  stockAlerts: number;
}

// Filter types
export interface TableFilters {
  search?: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: string | undefined;
}

// Pagination types
export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// Form types
export interface ProductFormData {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  buyPrice: number;
  sellPrice: number;
  threshold: number;
  supplier: string;
  description?: string;
}

export interface ClientFormData {
  name: string;
  phone: string;
  address: string;
  email?: string;
}

export interface SupplierFormData {
  name: string;
  phone: string;
  address: string;
  email?: string;
  contact: string;
}

export interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: "admin" | "gestionnaire" | "vendeur" | "lecteur";
  password?: string;
}

export interface SaleFormData {
  client: string;
  paymentMethod: string;
  items: SaleItem[];
  notes?: string;
}

export interface StockMovementFormData {
  type: "entry" | "exit";
  product: string;
  quantity: number;
  reason: string;
  comment?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}
