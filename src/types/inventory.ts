import type { ApiResponse } from './index';

export const InventoryCategory = {
  MEAT_AND_POULTRY: 'MEAT_AND_POULTRY',
  GRAINS: 'GRAINS',
  DAIRY: 'DAIRY',
  FRUITS_AND_VEGETABLES: 'FRUITS_AND_VEGETABLES',
  OILS_AND_SPICES: 'OILS_AND_SPICES',
  BEVERAGES: 'BEVERAGES',
  OTHER: 'OTHER',
} as const;
export type InventoryCategory = typeof InventoryCategory[keyof typeof InventoryCategory];

export const TransactionType = {
  PURCHASE_IN: 'PURCHASE_IN',
  ORDER_OUT: 'ORDER_OUT',
  WASTE_OUT: 'WASTE_OUT',
  ADJUSTMENT_IN: 'ADJUSTMENT_IN',
  ADJUSTMENT_OUT: 'ADJUSTMENT_OUT',
} as const;
export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

export const TransactionRefType = {
  PURCHASE: 'PURCHASE',
  ORDER: 'ORDER',
  MANUAL_ADJUSTMENT: 'MANUAL_ADJUSTMENT',
  WASTE: 'WASTE',
} as const;
export type TransactionRefType = typeof TransactionRefType[keyof typeof TransactionRefType];

export const UnitType = {
  WEIGHT: 'WEIGHT',
  VOLUME: 'VOLUME',
  COUNT: 'COUNT',
} as const;
export type UnitType = typeof UnitType[keyof typeof UnitType];

export const UnitSource = {
  SYSTEM: 'SYSTEM',
  CUSTOM: 'CUSTOM',
} as const;
export type UnitSource = typeof UnitSource[keyof typeof UnitSource];

export interface UnitResponse {
  id: string;
  name: string;
  symbol: string;
  unitType: UnitType;
  conversionFactor: number;
  isBaseUnit: boolean;
  source: UnitSource;
}

export interface StockItemResponse {
  id: string;
  name: string;
  baseUnit: UnitResponse;
  category: InventoryCategory;
  currentStock: number;
  minimumStock: number;
  lowStock: boolean;
  tenantId: string;
  branchId: string;
}

export interface InventorySummaryResponse {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  healthyStockItems: number;
}

export interface CreateStockItemRequest {
  name: string;
  baseUnitId: string;
  category: InventoryCategory;
  minimumStock: number;
}

export interface UpdateStockItemRequest {
  name: string;
  baseUnitId: string;
  category: InventoryCategory;
  minimumStock: number;
}

export interface CreateCustomUnitRequest {
  name: string;
  symbol: string;
  unitType: UnitType;
  conversionFactor: number;
}

export interface PackagingUnitResponse {
  id: string;
  name: string;
  quantityInBaseUnit: number;
  stockItemId: string;
}

export interface CreatePackagingUnitRequest {
  name: string;
  quantityInBaseUnit: number;
}

export interface InventoryTransactionResponse {
  id: string;
  stockItemId: string;
  stockItemName: string;
  transactionType: TransactionType;
  quantity: number;
  direction: number;
  balanceAfter: number;
  originalQuantity: number;
  originalUnitId: string;
  originalUnitName: string;
  referenceId: string;
  referenceType: TransactionRefType;
  remark: string;
  createdAt: string;
}

export interface StockAdjustmentRequest {
  stockItemId: string;
  quantity: number;
  unitId?: string;
  unitSource?: UnitSource;
  packagingUnitId?: string;
  type: TransactionType;
  remark?: string;
}
