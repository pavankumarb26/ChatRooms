import { useState } from "react";
import CreateRoom from "../components/CreateRoom";
import JoinRoom from "../components/JoinRoom";
import { FiMessageCircle } from "react-icons/fi";
import Hide from "../components/Hide"

export default function Home({ onRoomJoined }) {
  const [page, setPage] = useState("");

  
  const goHome = () => setPage("");

  if (page === "create") {
    return <CreateRoom onRoomJoined={onRoomJoined} onBack={goHome} />;
  }

  if (page === "join") {
    return <JoinRoom onRoomJoined={onRoomJoined} onBack={goHome} />;
  }

return (
  <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-12">
    <div className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-8 text-center shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/60">

      {/* Header */}
      <div className="mb-6">
        <div className="text-3xl flex justify-center mb-2 text-black">
          <FiMessageCircle />
        </div>
        <h1 className="text-2xl font-semibold">Chat Room</h1>
        <p className="text-gray-500 text-sm">
          Connect instantly with friends
        </p>
      </div>


      {/* Create Room Card */}
      <div
        onClick={() => setPage("create")}
        className="flex justify-between items-center p-4 mb-3 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition hover:shadow"
      >
        <div className="text-left">
          <h3 className="font-medium">Create Room</h3>
          <p className="text-sm text-gray-500">
            Start a new conversation
          </p>
        </div>
        <span className="text-lg">→</span>
      </div>

      {/* Join Room Card */}
      <div
        onClick={() => setPage("join")}
        className="flex justify-between items-center p-4 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition hover:shadow"
      >
        <div className="text-left">
          <h3 className="font-medium">Join Room</h3>
          <p className="text-sm text-gray-500">
            Enter with a room code
          </p>
        </div>
        <span className="text-lg">→</span>
      </div>

      <p className="mt-6 text-xs text-slate-400">
        Rooms are private to those who know the password
      </p>
    </div>
  </div>
);
}