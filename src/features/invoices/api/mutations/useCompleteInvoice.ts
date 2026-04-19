import { useMutation } from '@/hooks/useMutation';
import { apiClient } from '@/api/client';
import { ApiResponse, Invoice } from '../../types';
import { invoiceKeys } from '../keys';
import { invalidateKey } from '@/lib/eventBus';

export const completeInvoice = async (invoiceId: string): Promise<Invoice> => {
  const { data } = await apiClient.post<ApiResponse<Invoice>>(`/invoices/${invoiceId}`, {});
  return data.data;
};

export function useCompleteInvoice() {
  return useMutation({
    mutationFn: completeInvoice,
    onSuccess: () => {
      invalidateKey(invoiceKeys.all);
    },
  });
}
