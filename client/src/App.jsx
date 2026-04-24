import { useEffect, useState } from "react";
import Home from "./pages/Home.jsx";
import Chat from "./components/Chat.jsx";
import AppLayout from "./components/AppLayout.jsx";
import socket, { parseRoomJoined } from "./socket";
import Hide from "./components/Hide.jsx"

const SESSION_KEY = "chat_websocket_session";

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (o && typeof o.room === "string" && typeof o.name === "string") return o;
  } catch {
    /* ignore */
  }
  return null;
}

function saveSession(room, name) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ room, name }));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export default function App() {
  const [room, setRoom] = useState(null);
  const [name, setName] = useState("");
  const [initialMessages, setInitialMessages] = useState([]);
  const [restoring, setRestoring] = useState(() => !!loadSession());

  const handleRoomJoined = ({ roomId, messages, name: displayName }) => {
    setName(displayName);
    setRoom(roomId);
    setInitialMessages(messages ?? []);
    saveSession(roomId, displayName);
  };

  useEffect(() => {
    const onConnect = () => console.log("Socket connected:", socket.id);
    const onErr = (err) => console.log("Socket error:", err.message);
    socket.on("connect", onConnect);
    socket.on("connect_error", onErr);
    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onErr);
    };
  }, []);

  useEffect(() => {
    const saved = loadSession();
    if (!saved) return;

    const join = () => {
      socket.emit("join-room", { password: saved.room, name: saved.name });
    };

    function teardownListeners() {
      socket.off("connect", join);
      socket.off("room-joined", onJoined);
      socket.off("error-message", onErr);
    }

    function onErr() {
      teardownListeners();
      clearSession();
      setRestoring(false);
    }

    function onJoined(payload) {
      teardownListeners();
      const { roomId, messages } = parseRoomJoined(payload);
      setName(saved.name);
      setRoom(roomId);
      setInitialMessages(messages);
      saveSession(roomId, saved.name);
      setRestoring(false);
    }

    socket.on("room-joined", onJoined);
    socket.on("error-message", onErr);
    socket.on("connect", join);

    if (socket.connected) join();

    return () => {
      teardownListeners();
    };
  }, []);

  return (
    <AppLayout>
      <Hide/>
      {restoring ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />
          <p className="mt-4 text-sm text-slate-600">Restoring your chat…</p>
        </div>
      ) : !room ? (
        <Home onRoomJoined={handleRoomJoined} />
      ) : (
        <Chat
          key={room}
          room={room}
          name={name}
          initialMessages={initialMessages}
          onLeave={() => {
            socket.emit("leave-room", { password: room });
            clearSession();
            setRoom(null);
            setName("");
            setInitialMessages([]);
          }}
        />
      )}
    </AppLayout>
  );
}
