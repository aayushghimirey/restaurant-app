import { apiClient } from '@/api/client';
import { useFetch } from '@/hooks/useFetch';
import { dashboardKeys } from '../keys';
import { DateSelection, ReservationOrderInfo, PurchaseInfo, FinanceServiceInfo } from '../../types';

export const fetchReservationDashboard = async (dateSelection: DateSelection): Promise<ReservationOrderInfo> => {
  const { data } = await apiClient.get<ReservationOrderInfo>('/reservations/dashboard', { params: { dateSelection } });
  return data;
};

export const fetchPurchaseDashboard = async (dateSelection: DateSelection): Promise<PurchaseInfo> => {
  const { data } = await apiClient.get<PurchaseInfo>('/purchases/dashboard', { params: { dateSelection } });
  return data;
};

export const fetchFinanceDashboard = async (dateSelection: DateSelection): Promise<FinanceServiceInfo> => {
  const { data } = await apiClient.get<FinanceServiceInfo>('/finances/dashboard', { params: { dateSelection } });
  return data;
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
