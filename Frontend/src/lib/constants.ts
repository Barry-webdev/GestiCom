// Categories
export const PRODUCT_CATEGORIES = [
  "Alimentaire",
  "Quincaillerie",
  "Vêtements",
  "Électronique",
  "Cosmétiques",
  "Autres",
] as const;

// Units
export const PRODUCT_UNITS = [
  "sac",
  "bidon",
  "pot",
  "carton",
  "pièce",
  "kg",
  "litre",
  "mètre",
  "boîte",
] as const;

// Payment Methods
export const PAYMENT_METHODS = [
  "Espèces",
  "Mobile Money",
  "Orange Money",
  "MTN Money",
  "Virement",
  "Chèque",
  "Crédit",
] as const;

// User Roles
export const USER_ROLES = [
  { value: "admin", label: "Administrateur", description: "Accès complet au système" },
  { value: "gestionnaire", label: "Gestionnaire", description: "Gestion stock et ventes" },
  { value: "vendeur", label: "Vendeur", description: "Ventes et clients uniquement" },
  { value: "lecteur", label: "Lecteur", description: "Consultation uniquement" },
] as const;

// Stock Movement Reasons
export const ENTRY_REASONS = [
  "Achat",
  "Retour client",
  "Ajustement inventaire",
  "Transfert entrant",
  "Production",
  "Autre",
] as const;

export const EXIT_REASONS = [
  "Vente",
  "Perte",
  "Casse",
  "Vol",
  "Don",
  "Transfert sortant",
  "Échantillon",
  "Autre",
] as const;

// Status
export const PRODUCT_STATUS = {
  ok: { label: "En stock", color: "success" },
  low: { label: "Stock bas", color: "warning" },
  out: { label: "Rupture", color: "destructive" },
} as const;

export const SALE_STATUS = {
  completed: { label: "Complétée", color: "success" },
  pending: { label: "En attente", color: "warning" },
  cancelled: { label: "Annulée", color: "destructive" },
} as const;

export const CLIENT_STATUS = {
  active: { label: "Actif", color: "success" },
  inactive: { label: "Inactif", color: "destructive" },
  vip: { label: "VIP", color: "secondary" },
} as const;

// Date Ranges
export const DATE_RANGES = [
  { value: "today", label: "Aujourd'hui" },
  { value: "yesterday", label: "Hier" },
  { value: "week", label: "Cette semaine" },
  { value: "month", label: "Ce mois" },
  { value: "quarter", label: "Ce trimestre" },
  { value: "year", label: "Cette année" },
  { value: "all", label: "Tout" },
] as const;

// Pagination
export const PAGE_SIZES = [10, 20, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 10;

// Currency
export const CURRENCY = "GNF";
export const CURRENCY_SYMBOL = "GNF";

// Phone Format
export const PHONE_PREFIX = "+224";
export const PHONE_REGEX = /^\+224\s?\d{3}\s?\d{2}\s?\d{2}\s?\d{2}$/;

// Validation
export const MIN_PASSWORD_LENGTH = 6;
export const MIN_PRODUCT_NAME_LENGTH = 3;
export const MIN_CLIENT_NAME_LENGTH = 3;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "gestistock_auth_token",
  USER_DATA: "gestistock_user_data",
  THEME: "gestistock_theme",
  SIDEBAR_COLLAPSED: "gestistock_sidebar_collapsed",
} as const;

// API Endpoints (pour plus tard)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
  },
  PRODUCTS: {
    LIST: "/products",
    CREATE: "/products",
    UPDATE: (id: number) => `/products/${id}`,
    DELETE: (id: number) => `/products/${id}`,
    DETAIL: (id: number) => `/products/${id}`,
  },
  CLIENTS: {
    LIST: "/clients",
    CREATE: "/clients",
    UPDATE: (id: number) => `/clients/${id}`,
    DELETE: (id: number) => `/clients/${id}`,
  },
  SUPPLIERS: {
    LIST: "/suppliers",
    CREATE: "/suppliers",
    UPDATE: (id: number) => `/suppliers/${id}`,
    DELETE: (id: number) => `/suppliers/${id}`,
  },
  SALES: {
    LIST: "/sales",
    CREATE: "/sales",
    DETAIL: (id: string) => `/sales/${id}`,
    CANCEL: (id: string) => `/sales/${id}/cancel`,
  },
  STOCK: {
    MOVEMENTS: "/stock/movements",
    CREATE_MOVEMENT: "/stock/movements",
  },
  USERS: {
    LIST: "/users",
    CREATE: "/users",
    UPDATE: (id: number) => `/users/${id}`,
    DELETE: (id: number) => `/users/${id}`,
  },
  DASHBOARD: {
    STATS: "/dashboard/stats",
  },
} as const;

// Chart Colors
export const CHART_COLORS = {
  primary: "hsl(222 47% 20%)",
  secondary: "hsl(38 92% 50%)",
  success: "hsl(152 69% 40%)",
  warning: "hsl(38 92% 50%)",
  destructive: "hsl(0 84% 60%)",
  info: "hsl(199 89% 48%)",
  muted: "hsl(220 9% 46%)",
} as const;
