export type BillingType = 'VAT' | 'PAN' | 'NO_BILL';
export type MoneyTransaction = 'CASH' | 'CREDIT' | 'BANK';

export interface PurchaseItemCommand {
  variantId: string;
  unitId: string;
  quantity: number;
  perUnitPrice: number;
  discountAmount: number;
}

export interface CreatePurchaseCommand {
  invoiceNumber: string;
  billingType: BillingType;
  vendorId: string;
  moneyTransaction: MoneyTransaction;
  discountAmount: number;
  items: PurchaseItemCommand[];
}

export interface PurchaseItemResponse {
  variantId: string;
  unitId: string;
  quantity: number;
  perUnitPrice: number;
  discountAmount: number;
  subTotal: number;
  netTotal: number;
}

export interface PurchaseResponse {
  id: string;
  invoiceNumber: string;
  vendorId?: string; // Optional if not returned by backend
  billingType: BillingType;
  moneyTransaction: MoneyTransaction;
  discountAmount: number;
  subTotal: number;
  vatAmount: number;
  grossTotal: number;
  items: PurchaseItemResponse[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PagedResponse<T> {
  data: T;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
