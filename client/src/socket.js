import { io } from "socket.io-client";
import { SOCKET_ORIGIN } from "./apiBase.js";

const socket = io(SOCKET_ORIGIN, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 800,
  reconnectionDelayMax: 10_000,
  timeout: 20_000,
  transports: ["polling", "websocket"], // ✅ only this line changes
});

/** Server sends { roomId, messages }; older clients may receive a string room id only. */
export function parseRoomJoined(payload) {
  if (payload == null) return { roomId: "", messages: [] };
  if (typeof payload === "string") return { roomId: payload, messages: [] };
  return {
    roomId: payload.roomId ?? "",
    messages: Array.isArray(payload.messages) ? payload.messages : [],
  };
}

export default socket;
