import { apiClient } from '@/api/client';
import { ApiResponse } from '../../types';

export const getPrintInvoiceHtml = async (invoiceId: string): Promise<string> => {
  const { data } = await apiClient.get<ApiResponse<string>>(`/invoices/${invoiceId}/print`);
  return data.data;
};
