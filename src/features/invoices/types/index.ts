export type InvoiceStatus = 'PENDING' | 'PAID' | 'COMPLETED' | 'CANCELLED';

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
}

export type InvoiceWsEvent = {
  type: 'INVOICE_CREATED' | 'INVOICE_UPDATED' | 'INVOICE_COMPLETED';
  payload: Invoice;
};

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
