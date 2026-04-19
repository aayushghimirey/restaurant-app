import { useCallback, useEffect, useRef, useState } from 'react';

export type ConnectionStatus = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED' | 'UNINSTANTIATED';

interface UseWebSocketOptions {
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onMessage?: (event: MessageEvent) => void;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const {
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    onMessage,
    onOpen,
    onClose,
    onError,
  } = options;

  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);
  const [status, setStatus] = useState<ConnectionStatus>('UNINSTANTIATED');

  const ws = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    setStatus('CONNECTING');
    let socket: WebSocket;
    try {
      socket = new WebSocket(url);
    } catch (error) {
      console.error("[WebSocket Error] Browser rejected URL scheme (use ws/wss instead of http):", error);
      setStatus('CLOSED');
      return;
    }
    ws.current = socket;

    socket.onopen = (event) => {
      setReadyState(WebSocket.OPEN);
      setStatus('OPEN');
      reconnectCount.current = 0;
      onOpen?.(event);
    };

    socket.onmessage = (event) => {
      setLastMessage(event);
      onMessage?.(event);
    };

    socket.onclose = (event) => {
      setReadyState(WebSocket.CLOSED);
      setStatus('CLOSED');
      onClose?.(event);

      if (reconnectCount.current < reconnectAttempts) {
        reconnectTimer.current = setTimeout(() => {
          reconnectCount.current += 1;
          connect();
        }, reconnectInterval);
      }
    };

    socket.onerror = (event) => {
      onError?.(event);
    };
  }, [url, reconnectAttempts, reconnectInterval, onMessage, onOpen, onClose, onError]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }, []);

  return {
    lastMessage,
    readyState,
    status,
    sendMessage,
    reconnect: connect,
  };
}
