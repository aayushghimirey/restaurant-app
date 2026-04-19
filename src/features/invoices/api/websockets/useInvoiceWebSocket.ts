import { financeKeys } from "@/features/finances/api/keys";
import { orderKeys } from "@/features/orders/api/keys";
import { invalidateKey } from "@/lib/eventBus";
import { useWebSocket } from "@/providers/WebSocketProvider";
import { useEffect } from "react";
import { invoiceKeys } from "../keys";

export function useInvoiceWebSocket() {
  const { invoiceClient, invoiceStatus } = useWebSocket();

  useEffect(() => {
    if (!invoiceClient || invoiceStatus !== "OPEN") return;

    const subscription = invoiceClient.subscribe(
      "/user/queue/invoices",
      (msg) => {
        try {
          const body = JSON.parse(msg.body);
          console.log("Invoice WS Message:", body);

          // Update invoice queries
          invalidateKey(invoiceKeys.all);

          // Handle real-time updates for reservations and orders
          // When an invoice is created/updated/completed, it often affects reservation status
          invalidateKey(orderKeys.reservationsBase);
          invalidateKey(orderKeys.tables);

          // Finances are affected by invoice completion or cancellation
          invalidateKey(financeKeys.all);
        } catch (err) {
          console.error("Failed to parse Invoice WebSocket message:", err);
          // Fallback: invalidate invoice keys at minimum
          invalidateKey(invoiceKeys.all);
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [invoiceClient, invoiceStatus]);

  return { status: invoiceStatus };
}
