import { useFetch } from '@/hooks/useFetch';
import { apiClient } from '@/api/client';
import { ApiResponse, Invoice } from '../../types';
import { invoiceKeys } from '../keys';

export const fetchPendingInvoices = async (): Promise<Invoice[]> => {
  const { data } = await apiClient.get<ApiResponse<Invoice[]>>('/invoices/pending');
  return data.data;
};

export function usePendingInvoices() {
  return useFetch(invoiceKeys.pending(), fetchPendingInvoices);
}
