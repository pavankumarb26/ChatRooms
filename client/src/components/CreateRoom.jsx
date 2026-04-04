import { useState } from "react";
import socket, { parseRoomJoined } from "../socket";

export default function CreateRoom({ onRoomJoined, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = () => {
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }

    setStatus("Creating room...");
    setError("");

    const displayName = username.trim();

    socket.off("room-created");
    socket.off("error-message");

    const onCreated = (roomId) => {
      socket.off("error-message", onErr);
      setStatus("Joining room...");

      const onJoinErr = (msg) => {
        socket.off("error-message", onJoinErr);
        setError(msg || "Could not join the room");
        setStatus("");
      };

      socket.once("error-message", onJoinErr);
      socket.emit("join-room", { password: roomId, name: displayName });
      socket.once("room-joined", (payload) => {
        socket.off("error-message", onJoinErr);
        const { roomId: id, messages } = parseRoomJoined(payload);
        onRoomJoined({ roomId: id, messages, name: displayName });
      });
    };

    const onErr = (msg) => {
      setError(msg);
      setStatus("");
    };

    socket.once("room-created", onCreated);
    socket.once("error-message", onErr);

    socket.emit("create-room", { password: password.trim() });
  };

return (
  
  <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-12">
    <div className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/60">
      
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="text-sm text-gray-600 mb-3 hover:text-black"
      >
        ← Back
      </button>

      {/* Header */}
      <div className="text-center mb-5">
        <div className="w-12 h-12 bg-black text-white grid place-items-center rounded-xl mx-auto mb-2 text-xl">
          +
        </div>

        <h2 className="text-xl font-semibold">Create Room</h2>
        <p className="text-gray-500 text-sm">
          Set up a new private room for your conversation
        </p>
      </div>

      {/* Error / Status */}
      {error && (
        <p className="text-red-500 text-sm mb-2">{error}</p>
      )}
      {status && (
        <p className="text-blue-500 text-sm mb-2">{status}</p>
      )}

      {/* Name Input */}
      <div className="mb-4">
        <label className="text-sm text-gray-700 block mb-1">
          Your Name
        </label>
        <input
          className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-black"
          placeholder="Enter your display name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      {/* Password Input */}
      <div className="mb-4">
        <label className="text-sm text-gray-700 block mb-1">
          Room Password
        </label>
        <input
          type="password"
          className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-black"
          placeholder="Create a unique room password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">
          Share this password with friends to let them join
        </p>
      </div>

      {/* Button */}
      <button
        onClick={handleSubmit}
        className="w-full bg-black text-white p-3 rounded-xl mt-3 hover:bg-gray-800 transition"
      >
        Create Room
      </button>

    </div>
  </div>
);
}