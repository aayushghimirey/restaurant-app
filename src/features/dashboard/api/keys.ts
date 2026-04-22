import { DateSelection } from '../types';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  reservations: (params: { dateSelection: DateSelection }) => [...dashboardKeys.all, 'reservations', params] as const,
  purchases: (params: { dateSelection: DateSelection }) => [...dashboardKeys.all, 'purchases', params] as const,
  finances: (params: { dateSelection: DateSelection }) => [...dashboardKeys.all, 'finances', params] as const,
};
