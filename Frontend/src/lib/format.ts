import { CURRENCY } from "./constants";

/**
 * Formate un nombre en prix avec la devise guinéenne
 */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat("fr-GN").format(value) + " " + CURRENCY;
}

/**
 * Formate un nombre avec séparateurs de milliers
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("fr-GN").format(value);
}

/**
 * Formate un numéro de téléphone guinéen
 */
export function formatPhone(phone: string): string {
  // Enlever tous les espaces
  const cleaned = phone.replace(/\s/g, "");
  
  // Format: +224 XXX XX XX XX
  if (cleaned.startsWith("+224")) {
    const number = cleaned.substring(4);
    if (number.length === 9) {
      return `+224 ${number.substring(0, 3)} ${number.substring(3, 5)} ${number.substring(5, 7)} ${number.substring(7, 9)}`;
    }
  }
  
  return phone;
}

/**
 * Formate une date au format français
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/**
 * Formate une date avec l'heure
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Formate une date relative (il y a X minutes/heures/jours)
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "À l'instant";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Il y a ${diffInMinutes} min`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Il y a ${diffInHours}h`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `Il y a ${diffInDays}j`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `Il y a ${diffInWeeks} sem`;
  }

  return formatDate(d);
}

/**
 * Formate un pourcentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return value.toFixed(decimals) + "%";
}

/**
 * Calcule et formate la marge bénéficiaire
 */
export function calculateMargin(buyPrice: number, sellPrice: number): string {
  if (buyPrice === 0) return "0%";
  const margin = ((sellPrice - buyPrice) / buyPrice) * 100;
  return formatPercentage(margin);
}

/**
 * Calcule le profit
 */
export function calculateProfit(buyPrice: number, sellPrice: number): number {
  return sellPrice - buyPrice;
}

/**
 * Tronque un texte avec ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/**
 * Capitalise la première lettre
 */
export function capitalize(text: string): string {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Génère un ID de vente
 */
export function generateSaleId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `VNT-${year}-${random}`;
}

/**
 * Valide un numéro de téléphone guinéen
 */
export function isValidGuineanPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, "");
  return /^\+224\d{9}$/.test(cleaned);
}

/**
 * Nettoie un numéro de téléphone
 */
export function cleanPhone(phone: string): string {
  return phone.replace(/\s/g, "");
}

/**
 * Formate un nom de fichier pour l'export
 */
export function formatExportFilename(prefix: string, extension: string = "pdf"): string {
  const date = new Date();
  const dateStr = date.toISOString().split("T")[0];
  const timeStr = date.toTimeString().split(" ")[0].replace(/:/g, "-");
  return `${prefix}_${dateStr}_${timeStr}.${extension}`;
}
