import { useEffect } from "react";
import { useWebSocket } from "@/providers/WebSocketProvider";
import { invalidateKey } from "@/lib/eventBus";
import { financeKeys } from "@/features/finances/api/keys";
import { orderKeys } from "../keys";

export function useOrderWebSocket() {
  const { orderClient, orderStatus } = useWebSocket();

  useEffect(() => {
    if (!orderClient || orderStatus !== "OPEN") return;

    const orderSub = orderClient.subscribe("/user/queue/orders", (msg) => {
      try {
        const body = JSON.parse(msg.body);
        console.log("Order WS Message:", body);
        
        invalidateKey(orderKeys.reservationsBase);
        invalidateKey(orderKeys.tables);
        invalidateKey(financeKeys.all);
      } catch (err) {
        console.error("Failed to parse Order WebSocket message:", err);
        invalidateKey(orderKeys.all);
      }
    });

    const resSub = orderClient.subscribe("/user/queue/reservations", (msg) => {
      try {
        const body = JSON.parse(msg.body);
        console.log("Reservation WS Message:", body);
        
        invalidateKey(orderKeys.reservationsBase);
        invalidateKey(orderKeys.tables);
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
