import { useFetch } from '@/hooks/useFetch';
import { apiClient } from '@/api/client';
import { PurchaseResponse, PagedResponse, GetPurchaseQueryRequest } from '../../types';
import { purchaseKeys } from '../keys';

export type PurchaseQueryParams = {
  page?: number;
  size?: number;
} & GetPurchaseQueryRequest;

export const fetchPurchases = async (params: PurchaseQueryParams = {}): Promise<PagedResponse<PurchaseResponse[]>> => {
  const { data } = await apiClient.get<PagedResponse<PurchaseResponse[]>>('/purchases', { params });
  return data;
};

export function usePurchases(params: PurchaseQueryParams = {}) {
  return useFetch(
    purchaseKeys.list(params),
    () => fetchPurchases(params)
  );
}
