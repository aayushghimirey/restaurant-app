import { useFetch } from '@/hooks/useFetch';
import { apiClient } from '@/api/client';
import { PagedResponse, PurchaseRecordResponse } from '../../types';
import { financeKeys } from '../keys';

export const fetchFinancePurchases = async (params: { page?: number, size?: number } = {}): Promise<PagedResponse<PurchaseRecordResponse[]>> => {
  const { data } = await apiClient.get<PagedResponse<PurchaseRecordResponse[]>>('/finances/purchases', { params });
  return data;
};

export function useFinancePurchases(params: { page?: number, size?: number } = {}) {
  return useFetch(
    financeKeys.purchaseList(params),
    () => fetchFinancePurchases(params)
  );
}
