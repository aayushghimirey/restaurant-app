export type InvoiceStatus = 'PENDING' | 'PAID' | 'COMPLETED' | 'CANCELLED';

export interface InvoiceItemResponse {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  billNumber?: string;
  tableId?: string;
  sessionId?: string;
  status: InvoiceStatus;
  subTotal: number;
  grossTotal: number;
  reservationTime: string;
  reservationEndTime?: string | null;
  items: InvoiceItemResponse[];
}

export type InvoiceWsEvent = {
  type: 'INVOICE_CREATED' | 'INVOICE_UPDATED' | 'INVOICE_COMPLETED';
  payload: Invoice;
};

export type BillingType = 'VAT' | 'PAN' | 'NO_BILL';
export type MoneyTransaction = 'CASH' | 'BANK' | 'FONE_PAY';

export interface CreateInvoiceCommand {
  invoiceType: BillingType;
  moneyTransaction: MoneyTransaction;
  discount: number;
  hiddenItemIds?: string[];
}

export interface InvoiceSearchRequest {
  billNumber?: string;
  sessionId?: string;
  tableId?: string;
}

export interface ApiResponse<T> {
  data: T;
  last?: boolean;
  message?: string;
  page?: number;
  size?: number;
  status?: string;
  totalElements?: number;
  totalPages?: number;
}
