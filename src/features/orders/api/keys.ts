import type { ReservationStatus } from '@/types/reservations';

export const orderKeys = {
  all: ["orders"] as const,
  tables: ["tables"] as const,
  reservationsBase: ["reservations"] as const,
  reservations: (status: ReservationStatus) =>
    ["reservations", status] as const,
};
