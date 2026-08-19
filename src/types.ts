export interface Product {
  id: string;
  name: string;
  expiryDate: string; // ISO date string (YYYY-MM-DD)
  category: 'medicine' | 'grocery';
  quantity: number;
  barcode?: string;
  uses?: string;
  dosage?: string;
  imageUrl?: string;
  genericName?: string;
  composition?: string;
  packSize?: string;
  batchNumber?: string;
  price?: number;
  manufacturer?: string;
  verificationSource?: string; // 'gs1-verified' | 'local-catalog' | 'manual'
  verifiedAt?: string;
}

export interface Gs1Result {
  found: boolean;
  verified: boolean;
  name?: string;
  genericName?: string;
  brandName?: string;
  manufacturer?: string;
  composition?: string;
  packSize?: string;
  source?: string;
}

export type ExpiryStatus = 'all' | 'expired' | 'critical' | 'warning' | 'safe';
export type CategoryFilter = 'all' | 'tablets' | 'syrups' | 'inhalers' | 'injections' | 'creams' | 'drops';
