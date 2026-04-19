import { useFetch } from '@/hooks/useFetch';
import { apiClient } from '@/api/client';
import { Vendor, VendorQueryParams, PagedResponse } from '../../types';
import { vendorKeys } from '../keys';

export const fetchVendors = async (params: VendorQueryParams): Promise<PagedResponse<Vendor[]>> => {
  const { data } = await apiClient.get<PagedResponse<Vendor[]>>('/vendors', { params });
  return data;
};

export function useVendors(params: VendorQueryParams = {}) {
  return useFetch(vendorKeys.list(params), () => fetchVendors(params));
}
