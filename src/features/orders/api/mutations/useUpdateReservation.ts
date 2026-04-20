import { useMutation } from "@/hooks/useMutation";
import { updateReservation } from "@/api/orderApi";
import type { UpdateOrderItemCommand } from "@/types/reservations";
import { orderKeys } from "../keys";
import { invalidateKey } from "@/lib/eventBus";
import toast from "react-hot-toast";

export function useUpdateReservation() {
  return useMutation({
    mutationFn: ({ sessionId, payload }: { sessionId: string; payload: UpdateOrderItemCommand }) =>
      updateReservation(sessionId, payload),
    onSuccess: () => {
      invalidateKey(orderKeys.reservationsBase);
      toast.success("Order updated successfully");
    },
    onError: () => {
      toast.error("Failed to update order");
    },
  });
}
