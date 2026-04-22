import { useMutation } from '@/hooks/useMutation';
import { apiClient } from '@/api/client';
import { ApiResponse, Invoice, CreateInvoiceCommand } from '../../types';
import { invoiceKeys } from '../keys';
import { invalidateKey } from '@/lib/eventBus';

export const completeInvoice = async ({ invoiceId, command }: { invoiceId: string, command: CreateInvoiceCommand }): Promise<Invoice> => {
  const { data } = await apiClient.post<ApiResponse<Invoice>>(`/invoices/${invoiceId}`, command);
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
