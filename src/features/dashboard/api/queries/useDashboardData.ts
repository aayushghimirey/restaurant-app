import { apiClient } from '@/api/client';
import { useFetch } from '@/hooks/useFetch';
import { dashboardKeys } from '../keys';
import { DateSelection, ReservationOrderInfo, PurchaseInfo, FinanceServiceInfo } from '../../types';
import type { ApiResponse } from '@/types/api';

export const fetchReservationDashboard = async (dateSelection: DateSelection): Promise<ReservationOrderInfo> => {
  const { data } = await apiClient.get<ApiResponse<ReservationOrderInfo>>('/reservations/dashboard', { params: { dateSelection } });
  return data.data;
};

export const fetchPurchaseDashboard = async (dateSelection: DateSelection): Promise<PurchaseInfo> => {
  const { data } = await apiClient.get<ApiResponse<PurchaseInfo>>('/purchases/dashboard', { params: { dateSelection } });
  return data.data;
};

export const fetchFinanceDashboard = async (dateSelection: DateSelection): Promise<FinanceServiceInfo> => {
  const { data } = await apiClient.get<ApiResponse<FinanceServiceInfo>>('/finances/dashboard', { params: { dateSelection } });
  return data.data;
};

export function useReservationDashboard(dateSelection: DateSelection) {
  return useFetch(
    dashboardKeys.reservations({ dateSelection }),
    () => fetchReservationDashboard(dateSelection)
  );
}

export function usePurchaseDashboard(dateSelection: DateSelection) {
  return useFetch(
    dashboardKeys.purchases({ dateSelection }),
    () => fetchPurchaseDashboard(dateSelection)
  );
}

export function useFinanceDashboard(dateSelection: DateSelection) {
  return useFetch(
    dashboardKeys.finances({ dateSelection }),
    () => fetchFinanceDashboard(dateSelection)
  );
}
