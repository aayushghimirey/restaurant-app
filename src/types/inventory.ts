import type { ApiResponse, PaginatedData } from "./api";

export type StockType = "BEVERAGE" | "FOOD" | "OTHER";
export type UnitType = "PURCHASE" | "SELL" | "BOTH";

export interface UnitDto {
  id?: string;
  name: string;
  conversionRate: number;
  unitType: UnitType;
}

export interface VariantDto {
  id?: string;
  name: string;
  baseUnit: string;
  openingStock: number;
  currentStock: number;
  units: UnitDto[];
}

// Used by the stock list + expandable variants table.
export interface StockResponse {
  id: string;
  name: string;
  type: StockType;
  variants: VariantDto[];
}

// Used by the stock variants endpoint.
export interface VariantResponse {
  id: string;
  name: string;
  baseUnit: string;
  openingStock: number;
  currentStock: number;
  availableStock: number;
  units: UnitDto[];
}

export interface StockReqDto {
  name: string;
  type: StockType;
  variants: VariantDto[];
}

export interface StockUpdateCommand {
  name?: string;
  type?: StockType;
  variants?: VariantDto[];
}

export interface StockAdjustmentCommand {
  variantId: string;
  unitId: string;
  quantity: number;
  reason?: string;
  isAddition: boolean;
}

export interface GetStockQueryRequest {
  name?: string;
  type?: StockType;
  page?: number;
  size?: number;
}

export interface GetStockVariantsQueryRequest {
  page?: number;
  size?: number;
}

// Response wrappers for endpoints that still return these legacy shapes.
export type StockListResponse = PaginatedData<StockResponse[]>;
export type StockVariantsResponse = PaginatedData<VariantResponse[]>;

export interface StockTransactionResponse {
  id: string
  referenceId?: string | null
  referenceType?: string | null
  variantId: string
  variantName: string
  unitId: string
  unitName: string
  quantityChanged: number
  balanceAfter: number
  remark?: string | null
  createdAt?: string
}

export interface GetStockTransactionsQueryRequest {
  variantId?: string;
  referenceType?: string;
  page?: number;
  size?: number;
}

// Some endpoints wrap primitive responses in ApiResponse.
export type VerifyVariantUnitResponse = ApiResponse<boolean>;
