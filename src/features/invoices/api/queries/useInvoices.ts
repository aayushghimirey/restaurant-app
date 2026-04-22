import { useFetch } from '@/hooks/useFetch';
import { apiClient } from '@/api/client';
import { ApiResponse, Invoice, InvoiceSearchRequest } from '../../types';
import { invoiceKeys } from '../keys';

export type InvoiceQueryParams = InvoiceSearchRequest & {
  page?: number;
  size?: number;
};

export const fetchInvoices = async (params?: InvoiceQueryParams): Promise<ApiResponse<Invoice[]>> => {
  const { data } = await apiClient.get<ApiResponse<Invoice[]>>('/invoices', { params });
  return data;
};

export function useInvoices(params?: InvoiceQueryParams) {
  return useFetch(invoiceKeys.list(params || {}), () => fetchInvoices(params));
}
