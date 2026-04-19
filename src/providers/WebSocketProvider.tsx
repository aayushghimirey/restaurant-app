import React, { createContext, useContext, useEffect, useRef, useState, useMemo } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuthStore } from "@/features/auth/store/authStore";

type ConnectionStatus = "CONNECTING" | "OPEN" | "CLOSED";

interface WebSocketContextType {
  orderClient: Client | null;
  orderStatus: ConnectionStatus;
  invoiceClient: Client | null;
  invoiceStatus: ConnectionStatus;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

// Singleton instances outside the component lifecycle
let globalOrderClient: Client | null = null;
let globalInvoiceClient: Client | null = null;
let lastOrderToken: string | null = null;
let lastInvoiceToken: string | null = null;

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuthStore();
  const [orderStatus, setOrderStatus] = useState<ConnectionStatus>("CLOSED");
  const [invoiceStatus, setInvoiceStatus] = useState<ConnectionStatus>("CLOSED");

  // Keep track of internal status even across remounts
  const syncStatus = () => {
    if (globalOrderClient?.active) {
      setOrderStatus(globalOrderClient.connected ? "OPEN" : "CONNECTING");
    } else {
      setOrderStatus("CLOSED");
    }
    if (globalInvoiceClient?.active) {
      setInvoiceStatus(globalInvoiceClient.connected ? "OPEN" : "CONNECTING");
    } else {
      setInvoiceStatus("CLOSED");
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !token) {
      console.log("WebSocketProvider: No auth, cleaning up...");
      if (globalOrderClient) {
        globalOrderClient.deactivate();
        globalOrderClient = null;
        lastOrderToken = null;
      }
      if (globalInvoiceClient) {
        globalInvoiceClient.deactivate();
        globalInvoiceClient = null;
        lastInvoiceToken = null;
      }
      syncStatus();
      return;
    }

    const tenantId = JSON.parse(atob(token.split(".")[1])).tenantId;

    // Handle Order WebSocket
    if (globalOrderClient && lastOrderToken !== token) {
      console.log("WebSocketProvider: Token changed, deactivating old order client");
      globalOrderClient.deactivate();
      globalOrderClient = null;
    }

    if (!globalOrderClient) {
      console.log("WebSocketProvider: Creating new order client for tenant:", tenantId);
      const client = new Client({
        webSocketFactory: () => new SockJS(`http://localhost:9000/orders/ws?tenantId=${tenantId}`),
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 5000,
        debug: (str) => console.log("STOMP Order:", str),
      });

      client.onConnect = () => {
        console.log("WebSocketProvider: Order WS Connected");
        setOrderStatus("OPEN");
      };
      client.onDisconnect = () => {
        console.log("WebSocketProvider: Order WS Disconnected");
        setOrderStatus("CLOSED");
      };
      client.onStompError = (frame) => {
        console.error("WebSocketProvider: Order WS Error", frame);
        setOrderStatus("CLOSED");
      };

      globalOrderClient = client;
      lastOrderToken = token;
      setOrderStatus("CONNECTING");
      client.activate();
    } else {
      console.log("WebSocketProvider: Reusing existing order client");
      syncStatus();
    }

    // Handle Invoice WebSocket
    if (globalInvoiceClient && lastInvoiceToken !== token) {
      console.log("WebSocketProvider: Token changed, deactivating old invoice client");
      globalInvoiceClient.deactivate();
      globalInvoiceClient = null;
    }

    if (!globalInvoiceClient) {
      console.log("WebSocketProvider: Creating new invoice client for tenant:", tenantId);
      const client = new Client({
        webSocketFactory: () => new SockJS(`http://localhost:9000/invoices/ws?tenantId=${tenantId}`),
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 5000,
        debug: (str) => console.log("STOMP Invoice:", str),
      });

      client.onConnect = () => {
        console.log("WebSocketProvider: Invoice WS Connected");
        setInvoiceStatus("OPEN");
      };
      client.onDisconnect = () => {
        console.log("WebSocketProvider: Invoice WS Disconnected");
        setInvoiceStatus("CLOSED");
      };
      client.onStompError = (frame) => {
        console.error("WebSocketProvider: Invoice WS Error", frame);
        setInvoiceStatus("CLOSED");
      };

      globalInvoiceClient = client;
      lastInvoiceToken = token;
      setInvoiceStatus("CONNECTING");
      client.activate();
    } else {
      console.log("WebSocketProvider: Reusing existing invoice client");
      syncStatus();
    }

    return () => {
      // In singleton pattern, we DON'T deactivate on unmount
      // We only deactivate on logout or token change
    };
  }, [isAuthenticated, token]);

  const value = useMemo(() => ({
    orderClient: globalOrderClient,
    orderStatus,
    invoiceClient: globalInvoiceClient,
    invoiceStatus,
  }), [orderStatus, invoiceStatus]); // References to global clients are stable enough

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
