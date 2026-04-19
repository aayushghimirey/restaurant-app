import { useFetch } from "@/hooks/useFetch";
import { getReservations } from "@/api/orderApi";
import type { ReservationStatus } from "@/types/reservations";
import { orderKeys } from "../keys";

export function useReservations(status: ReservationStatus) {
  return useFetch(orderKeys.reservations(status), () => getReservations(status));
}
