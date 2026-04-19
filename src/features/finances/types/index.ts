import { BillingType, MoneyTransaction } from '@/features/purchases/types';

export interface PurchaseRecordResponse {
  id: string;
  purchaseId: string;
  billingType: BillingType;
  moneyTransaction: MoneyTransaction;
  vatAmount: number;
  grossTotal: number;
  createdDateTime: string;
}

export interface InvoiceRecordResponse {
  id: string;
  invoiceId: string;
  grossTotal: number;
  reservationTime: string;
  reservationEndTime?: string | null;
  createdDateTime: string;
}

export interface PagedResponse<T> {
  data: T;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
