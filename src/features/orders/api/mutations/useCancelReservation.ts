import { useMutation } from "@/hooks/useMutation";
import { cancelReservation } from "@/api/orderApi";
import { orderKeys } from "../keys";
import { invalidateKey } from "@/lib/eventBus";
import toast from "react-hot-toast";

export function useCancelReservation() {
  return useMutation({
    mutationFn: (sessionId: string) => cancelReservation(sessionId),
    onSuccess: () => {
      invalidateKey(orderKeys.reservationsBase);
      toast.success("Reservation cancelled successfully");
    },
    onError: () => {
      toast.error("Failed to cancel reservation");
    },
  });
}
