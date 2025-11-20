// src/hook/useAccessLogSocket.ts
import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Platform } from "react-native";

export function useAccessLogSocket(onMessage: (msg: any) => void) {
  useEffect(() => {
    // 👉 Ajusta IP según dónde corres la app
    const WS_URL =
      Platform.OS === "android"
        ? "http://10.0.2.2:8080/ws"   // emulador Android
        : "http://localhost:8080/ws"; // iOS simulador / web

    const client = new Client({
      // ⬇️ Usamos SockJS, NO brokerURL directo
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      debug: (str) => {
        console.log("STOMP:", str);
      },
      onConnect: () => {
        console.log("✅ Conectado a WebSocket", WS_URL);

        client.subscribe("/topic/access-logs", (message) => {
          console.log("📩 Mensaje WS crudo:", message.body);
          try {
            const body = JSON.parse(message.body);
            onMessage(body);
          } catch (e) {
            console.log("Error parsing WS message", e);
          }
        });
      },
      onStompError: (frame) => {
        console.log("❌ STOMP error", frame.headers["message"], frame.body);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [onMessage]);
}