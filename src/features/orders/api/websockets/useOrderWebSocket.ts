import { useEffect } from "react";
import { useWebSocket } from "@/providers/WebSocketProvider";
import { invalidateKey } from "@/lib/eventBus";
import { financeKeys } from "@/features/finances/api/keys";
import { orderKeys } from "../keys";
import { invoiceKeys } from "@/features/invoices/api/keys";
import toast from "react-hot-toast";

export function useOrderWebSocket() {
  const { orderClient, orderStatus } = useWebSocket();

  useEffect(() => {
    if (!orderClient || orderStatus !== "OPEN") return;

    const refreshAll = () => {
      invalidateKey(orderKeys.reservationsBase);
      invalidateKey(orderKeys.tables);
      invalidateKey(invoiceKeys.all);
      invalidateKey(financeKeys.all);
    };

    const orderSub = orderClient.subscribe("/user/queue/orders", (msg) => {
      try {
        const body = JSON.parse(msg.body);
        console.log("Order WS Message:", body);
        refreshAll();

        if (body.status === "PENDING" || body.payload?.status === "PENDING") {
          toast.success("New order received!");
        }
      } catch (err) {
        console.error("Failed to parse Order WebSocket message:", err);
        invalidateKey(orderKeys.all);
      }
    });

    const resSub = orderClient.subscribe("/user/queue/reservations", (msg) => {
      try {
        const body = JSON.parse(msg.body);
        console.log("Reservation WS Message:", body);
        refreshAll();

        if (body.status === "PENDING" || body.payload?.status === "PENDING") {
          toast.success("New reservation received!");
        }
      } catch (err) {
        console.error("Failed to parse Reservation WebSocket message:", err);
        invalidateKey(orderKeys.all);
      }
    });

    return () => {
      orderSub.unsubscribe();
      resSub.unsubscribe();
    };
  }, [orderClient, orderStatus]);

  return { status: orderStatus };
}
