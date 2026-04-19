import { useMutation } from '@/hooks/useMutation';
import { apiClient } from '@/api/client';
import { CreatePurchaseCommand, PurchaseResponse, ApiResponse } from '../../types';
import { purchaseKeys } from '../keys';
import { invalidateKey } from '@/lib/eventBus';

export const createPurchase = async (payload: CreatePurchaseCommand): Promise<PurchaseResponse> => {
  const { data } = await apiClient.post<ApiResponse<PurchaseResponse>>('/purchases', payload);
  return data.data;
};

export function useCreatePurchase() {
  return useMutation({
    mutationFn: createPurchase,
    onSuccess: () => {
      invalidateKey(purchaseKeys.lists());
    },
  });
}
