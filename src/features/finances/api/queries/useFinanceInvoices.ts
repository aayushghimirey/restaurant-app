import { useFetch } from '@/hooks/useFetch';
import { apiClient } from '@/api/client';
import { PagedResponse, InvoiceRecordResponse } from '../../types';
import { financeKeys } from '../keys';

export const fetchFinanceInvoices = async (params: { page?: number, size?: number } = {}): Promise<PagedResponse<InvoiceRecordResponse[]>> => {
  const { data } = await apiClient.get<PagedResponse<InvoiceRecordResponse[]>>('/finances/invoices', { params });
  return data;
};

export function useFinanceInvoices(params: { page?: number, size?: number } = {}) {
  return useFetch(
    financeKeys.invoiceList(params),
    () => fetchFinanceInvoices(params)
  );
}
