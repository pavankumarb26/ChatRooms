import { useEffect, useState } from "react";
import socket, { parseRoomJoined } from "../socket";
import { API_BASE } from "../apiBase.js";
import ChatInput from "./ChatInput";
import MessageList from "./MessageList";
import Header from "./Header";
import ChatFooterBar from "./ChatFooterBar";

export default function Chat({ room, name, onLeave, initialMessages = [] }) {
  const [messages, setMessages] = useState(() =>
    initialMessages.map((m) => ({ ...m, isOwn: m.name === name }))
  );
  const [feedback, setFeedback] = useState("");
  const [users, setUsers] = useState([]);
  const [connection, setConnection] = useState(() =>
    socket.connected ? "connected" : "connecting"
  );
  const [banner, setBanner] = useState(null);

  /** Re-join room whenever the socket connects (first load + reconnect after sleep / network). */
  useEffect(() => {
    if (!room || !name) return;

    const rejoin = () => {
      socket.emit("join-room", { password: room, name });
    };

    if (socket.connected) rejoin();
    socket.on("connect", rejoin);

    return () => {
      socket.off("connect", rejoin);
    };
  }, [room, name]);

  // Add this useEffect in Chat.jsx
useEffect(() => {
  if (!room) return;

  const handleUnload = () => {
    socket.emit("leave-room", { password: room });
  };

  window.addEventListener("beforeunload", handleUnload);

  return () => {
    window.removeEventListener("beforeunload", handleUnload);
    socket.emit("leave-room", { password: room }); // fires when component unmounts too
  };
}, [room]);


  /** Report whether this browser tab is visible so "active" means room open + tab in foreground. */
  // useEffect(() => {
  //   if (!room) return;

  //   const emit = (visible) => {
  //     socket.emit("tab-visibility", { password: room, visible });
  //   };

  //   const onVis = () => emit(document.visibilityState === "visible");
  //   const onPageHide = () => emit(false);
  //   const onSocketConnect = () => emit(document.visibilityState === "visible");

  //   emit(document.visibilityState === "visible");
  //   document.addEventListener("visibilitychange", onVis);
  //   window.addEventListener("pagehide", onPageHide);
  //   socket.on("connect", onSocketConnect);

  //   return () => {
  //     document.removeEventListener("visibilitychange", onVis);
  //     window.removeEventListener("pagehide", onPageHide);
  //     socket.off("connect", onSocketConnect);
  //     emit(false);
  //   };
  // }, [room]);

  useEffect(() => {
    const onConnect = () => setConnection("connected");
    const onDisconnect = (reason) => {
      if (reason === "io client disconnect") setConnection("disconnected");
      else setConnection("reconnecting");
    };
    const onConnectError = () => setConnection("disconnected");
    const onReconnectAttempt = () => setConnection("reconnecting");
    const onReconnectFailed = () => setConnection("disconnected");

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.io.on("reconnect_attempt", onReconnectAttempt);
    socket.io.on("reconnect", onConnect);
    socket.io.on("reconnect_failed", onReconnectFailed);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.io.off("reconnect_attempt", onReconnectAttempt);
      socket.io.off("reconnect", onConnect);
      socket.io.off("reconnect_failed", onReconnectFailed);
    };
  }, []);

  useEffect(() => {
    if (!room || !name) return;

    const onRoomJoinedSync = (payload) => {
      const { roomId, messages: list } = parseRoomJoined(payload);
      if (String(roomId) !== String(room)) return;
      setMessages(
        (list || []).map((m) => ({
          ...m,
          isOwn: m.name === name,
        }))
      );
    };

    const onChatMessage = (data) => {
      setMessages((prev) => [
        ...prev,
        { ...data, isOwn: data.name === name },
      ]);
      setFeedback("");
    };

    const onFeedback = ({ feedback: fb }) => setFeedback(fb);

    const onDeleted = ({ messageId }) => {
      setMessages((prev) =>
        prev.filter((m) => String(m._id) !== String(messageId))
      );
    };

    const onDeleteFailed = (msg) => {
      setBanner(msg || "Could not delete message");
      window.setTimeout(() => setBanner(null), 5000);
    };

    const onActiveUsers = (usersList) => {
      setUsers(Array.isArray(usersList) ? usersList : []);
    };

    socket.on("room-joined", onRoomJoinedSync);
    socket.on("chat-message", onChatMessage);
    socket.on("feedback", onFeedback);
    socket.on("message-deleted", onDeleted);
    socket.on("delete-failed", onDeleteFailed);
    socket.on("active-users", onActiveUsers);

    const refreshPresence = () => {
      socket.emit("request-active-users", { password: room });
    };
    refreshPresence();

    return () => {
      socket.off("room-joined", onRoomJoinedSync);
      socket.off("chat-message", onChatMessage);
      socket.off("feedback", onFeedback);
      socket.off("message-deleted", onDeleted);
      socket.off("delete-failed", onDeleteFailed);
      socket.off("active-users", onActiveUsers);
    };
  }, [name, room]);

  /** After each successful connect while in chat, refresh presence list. */
  useEffect(() => {
    if (!room || connection !== "connected") return;
    socket.emit("request-active-users", { password: room });
  }, [connection, room]);

  const sendMessage = (msg) => {
    if (!msg.trim()) return;
    if (!socket.connected) {
      setBanner("Not connected — wait for the connection to recover.");
      window.setTimeout(() => setBanner(null), 4000);
      return;
    }
    socket.emit("message", { password: room, message: msg });
  };

  const deleteMessage = (messageId) => {
    if (!messageId) return;
    if (!window.confirm("Delete this message?")) return;
    socket.emit("delete-message", { password: room, messageId });
  };

  const sendFeedback = (fb) => {
    socket.emit("feedback", { password: room, feedback: fb });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col px-3 py-4 sm:px-4 lg:px-6">
      <div className="mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col lg:max-w-4xl">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/40 ring-1 ring-slate-200/60">
          <Header
            room={room}
            users={users}
            onLeave={onLeave}
            connection={connection}
          />

          {banner && (
            <div
              className="border-b border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-900 sm:text-sm"
              role="status"
            >
              {banner}
            </div>
          )}

          {connection === "reconnecting" && (
            <div className="border-b border-sky-200 bg-sky-50 px-3 py-2 text-center text-xs text-sky-900">
              Connection lost — reconnecting…
            </div>
          )}

          {connection === "disconnected" && (
            <div className="border-b border-red-200 bg-red-50 px-3 py-2 text-center text-xs text-red-900">
              Offline. Check the server and your network, then wait for an
              automatic retry or refresh the page.
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/90">
            <div className="mx-auto max-w-full px-2 py-3 sm:px-4">
              <MessageList
                messages={messages}
                feedback={feedback}
                apiBase={API_BASE}
                onDeleteMessage={deleteMessage}
              />
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white">
            <div className="p-3 sm:p-4">
              <ChatInput
                sendMessage={sendMessage}
                sendFeedback={sendFeedback}
                name={name}
                room={room}
                apiBase={API_BASE}
                disabled={!socket.connected}
              />
            </div>
            <ChatFooterBar room={room} />
          </div>
        </div>
      </div>
    </div>
  );
}
