import { financeKeys } from "@/features/finances/api/keys";
import { orderKeys } from "@/features/orders/api/keys";
import { invalidateKey } from "@/lib/eventBus";
import { useWebSocket } from "@/providers/WebSocketProvider";
import { useEffect } from "react";
import { invoiceKeys } from "../keys";
import toast from "react-hot-toast";

export function useInvoiceWebSocket() {
  const { invoiceClient, invoiceStatus } = useWebSocket();

  useEffect(() => {
    if (!invoiceClient || invoiceStatus !== "OPEN") return;

    const refreshAll = () => {
      invalidateKey(invoiceKeys.all);
      invalidateKey(orderKeys.reservationsBase);
      invalidateKey(orderKeys.tables);
      invalidateKey(financeKeys.all);
    };

    const subscription = invoiceClient.subscribe(
      "/user/queue/invoices",
      (msg) => {
        try {
          const body = JSON.parse(msg.body);
          console.log("Invoice WS Message:", body);
          refreshAll();

          if (body.status === "PENDING" || body.payload?.status === "PENDING") {
            toast.success("New invoice received!");
          }
        } catch (err) {
          console.error("Failed to parse Invoice WebSocket message:", err);
          refreshAll();
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [invoiceClient, invoiceStatus]);

  return { status: invoiceStatus };
}
