import { useFetch } from '@/hooks/useFetch';
import { apiClient } from '@/api/client';
import { PurchaseResponse, PagedResponse } from '../../types';
import { purchaseKeys } from '../keys';

export const fetchPurchases = async (params: { page?: number, size?: number } = {}): Promise<PagedResponse<PurchaseResponse[]>> => {
  const { data } = await apiClient.get<PagedResponse<PurchaseResponse[]>>('/purchases', { params });
  return data;
};

export function usePurchases(params: { page?: number, size?: number } = {}) {
  return useFetch(
    purchaseKeys.list(params),
    () => fetchPurchases(params)
  );
}
