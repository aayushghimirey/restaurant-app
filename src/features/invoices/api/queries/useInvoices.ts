import { useFetch } from '@/hooks/useFetch';
import { apiClient } from '@/api/client';
import { ApiResponse, Invoice } from '../../types';
import { invoiceKeys } from '../keys';

export const fetchInvoices = async (): Promise<Invoice[]> => {
  const { data } = await apiClient.get<ApiResponse<Invoice[]>>('/invoices');
  return data.data;
};

export function useInvoices() {
  return useFetch(invoiceKeys.lists(), fetchInvoices);
}
