import { useMutation } from "@/hooks/useMutation";
import { createReservation } from "@/api/orderApi";
import type { CreateReservationRequest } from "@/types/reservations";
import { orderKeys } from "../keys";
import { invalidateKey } from "@/lib/eventBus";

export function useCreateReservation() {
  return useMutation({
    mutationFn: (payload: CreateReservationRequest) =>
      createReservation(payload),
    onSuccess: () => {
      invalidateKey(orderKeys.reservationsBase);
    },
  });
}
