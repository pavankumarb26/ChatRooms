import { useEffect, useState } from "react";
import socket from "../socket";
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

  useEffect(() => {
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

    const onDeleteFailed = (msg) => alert(msg);

    const onActiveUsers = (usersList) => {
      setUsers(usersList);
    };

    socket.on("chat-message", onChatMessage);
    socket.on("feedback", onFeedback);
    socket.on("message-deleted", onDeleted);
    socket.on("delete-failed", onDeleteFailed);
    socket.on("active-users", onActiveUsers);

    socket.emit("request-active-users", { password: room });

    return () => {
      socket.off("chat-message", onChatMessage);
      socket.off("feedback", onFeedback);
      socket.off("message-deleted", onDeleted);
      socket.off("delete-failed", onDeleteFailed);
      socket.off("active-users", onActiveUsers);
    };
  }, [name, room]);

  const sendMessage = (msg) => {
    if (!msg.trim()) return;
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
          <Header room={room} users={users} onLeave={onLeave} />

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
              />
            </div>
            <ChatFooterBar room={room} />
          </div>
        </div>
      </div>
    </div>
  );
}