import { useState } from "react";
import socket, { parseRoomJoined } from "../socket";
import { FiArrowLeft } from "react-icons/fi";

export default function JoinRoom({ onRoomJoined, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }

    setError("");
    const displayName = username.trim();

    socket.off("room-joined");
    socket.off("error-message");

    socket.once("room-joined", (payload) => {
      const { roomId, messages } = parseRoomJoined(payload);
      onRoomJoined({ roomId, messages, name: displayName });
    });
    socket.once("error-message", (msg) => setError(msg));

    socket.emit("join-room", { password: password.trim(), name: displayName });
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/70 p-7 shadow-2xl shadow-slate-200/40 backdrop-blur-xl ring-1 ring-slate-150/50 relative overflow-hidden">

        {/* Back Button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 transition-colors mb-5 font-semibold bg-slate-100/60 px-2.5 py-1 rounded-lg border border-slate-200/80"
        >
          <FiArrowLeft /> Back
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center rounded-2xl mx-auto mb-3 text-2xl font-bold shadow-md shadow-indigo-500/10">
            →
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Join Workspace</h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Access an existing private room with the password
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs rounded-xl p-3 mb-4 text-center font-medium">
            {error}
          </div>
        )}

        {/* Username */}
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">
            Your Profile Name
          </label>
          <input
            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition placeholder-slate-400"
            placeholder="e.g. John Doe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="mb-5">
          <label className="text-xs font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">
            Room Password Code
          </label>
          <input
            type="password"
            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition placeholder-slate-400"
            placeholder="Enter the room password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3.5 font-bold rounded-xl mt-2 border border-indigo-700 shadow-md shadow-indigo-600/10 transition-all duration-150 flex items-center justify-center text-sm"
        >
          Join Room
        </button>

      </div>
    </div>
  );
}